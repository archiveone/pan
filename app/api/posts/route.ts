import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { uploadToS3, deleteFromS3 } from '@/lib/s3';

// Get feed posts
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const userId = searchParams.get('userId'); // For profile-specific posts
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (userId) {
      where.authorId = userId;
    }

    // Get posts with engagement metrics and media
    const posts = await prisma.post.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
            bio: true,
            coverImage: true,
            verified: true
          }
        },
        media: true,
        _count: {
          select: {
            likes: true,
            comments: true
          }
        },
        likes: {
          where: { userId: session.user.id },
          select: { id: true }
        },
        comments: {
          take: 3,
          orderBy: { createdAt: 'desc' },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
                username: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    // Get total count for pagination
    const totalCount = await prisma.post.count({ where });

    return NextResponse.json({
      posts: posts.map(post => ({
        ...post,
        liked: post.likes.length > 0,
        likes: undefined // Remove likes array from response
      })),
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Error fetching posts' },
      { status: 500 }
    );
  }
}

// Create post with media
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const content = formData.get('content') as string;
    const files = formData.getAll('media') as File[];

    // Upload media files to S3
    const mediaUrls = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileType = file.type.split('/')[0]; // 'image' or 'video'
        const url = await uploadToS3(buffer, file.name, file.type);
        return { url, type: fileType };
      })
    );

    // Create post with media
    const post = await prisma.post.create({
      data: {
        content,
        authorId: session.user.id,
        media: {
          create: mediaUrls.map(({ url, type }) => ({
            url,
            type
          }))
        }
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
            bio: true,
            coverImage: true,
            verified: true
          }
        },
        media: true,
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      }
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Error creating post' },
      { status: 500 }
    );
  }
}

// Update post
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const postId = formData.get('postId') as string;
    const content = formData.get('content') as string;
    const files = formData.getAll('media') as File[];
    const deleteMediaIds = JSON.parse(formData.get('deleteMediaIds') as string || '[]');

    // Check if user is the author
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      include: { media: true }
    });

    if (!existingPost || existingPost.authorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this post' },
        { status: 403 }
      );
    }

    // Delete specified media from S3 and database
    if (deleteMediaIds.length > 0) {
      const mediaToDelete = existingPost.media.filter(m => deleteMediaIds.includes(m.id));
      await Promise.all(
        mediaToDelete.map(async (media) => {
          await deleteFromS3(media.url);
        })
      );
      await prisma.media.deleteMany({
        where: { id: { in: deleteMediaIds } }
      });
    }

    // Upload new media files to S3
    const newMediaUrls = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileType = file.type.split('/')[0];
        const url = await uploadToS3(buffer, file.name, file.type);
        return { url, type: fileType };
      })
    );

    // Update post
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        content,
        media: {
          create: newMediaUrls.map(({ url, type }) => ({
            url,
            type
          }))
        }
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
            bio: true,
            coverImage: true,
            verified: true
          }
        },
        media: true,
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      }
    });

    return NextResponse.json({ post: updatedPost });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Error updating post' },
      { status: 500 }
    );
  }
}

// Delete post
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Check if user is the author
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { media: true }
    });

    if (!post || post.authorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to delete this post' },
        { status: 403 }
      );
    }

    // Delete media from S3
    await Promise.all(
      post.media.map(async (media) => {
        await deleteFromS3(media.url);
      })
    );

    // Delete post and related data
    await prisma.$transaction([
      prisma.media.deleteMany({ where: { postId } }),
      prisma.like.deleteMany({ where: { postId } }),
      prisma.comment.deleteMany({ where: { postId } }),
      prisma.post.delete({ where: { id: postId } })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Error deleting post' },
      { status: 500 }
    );
  }
}