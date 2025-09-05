import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Get user's bookmark collections
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const collectionId = searchParams.get('collectionId');

    if (collectionId) {
      // Get specific collection with its bookmarks
      const collection = await prisma.bookmarkCollection.findUnique({
        where: {
          id: collectionId,
          userId: session.user.id
        },
        include: {
          posts: {
            include: {
              post: {
                include: {
                  author: {
                    select: {
                      id: true,
                      name: true,
                      image: true,
                      username: true,
                      verified: true
                    }
                  },
                  media: true,
                  _count: {
                    select: {
                      likes: true,
                      comments: true,
                      shares: true
                    }
                  }
                }
              }
            },
            orderBy: {
              savedAt: 'desc'
            }
          },
          _count: {
            select: {
              posts: true
            }
          }
        }
      });

      if (!collection) {
        return NextResponse.json(
          { error: 'Collection not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ collection });
    }

    // Get all collections
    const collections = await prisma.bookmarkCollection.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ collections });
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      { error: 'Error fetching collections' },
      { status: 500 }
    );
  }
}

// Create new collection
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, privacy = 'private' } = body;

    // Create collection
    const collection = await prisma.bookmarkCollection.create({
      data: {
        name,
        description,
        privacy,
        userId: session.user.id
      }
    });

    return NextResponse.json({ collection });
  } catch (error) {
    console.error('Error creating collection:', error);
    return NextResponse.json(
      { error: 'Error creating collection' },
      { status: 500 }
    );
  }
}

// Update collection
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { collectionId, name, description, privacy } = body;

    // Check ownership
    const existingCollection = await prisma.bookmarkCollection.findUnique({
      where: {
        id: collectionId,
        userId: session.user.id
      }
    });

    if (!existingCollection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    // Update collection
    const collection = await prisma.bookmarkCollection.update({
      where: {
        id: collectionId
      },
      data: {
        name,
        description,
        privacy
      },
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      }
    });

    return NextResponse.json({ collection });
  } catch (error) {
    console.error('Error updating collection:', error);
    return NextResponse.json(
      { error: 'Error updating collection' },
      { status: 500 }
    );
  }
}

// Delete collection
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const collectionId = searchParams.get('collectionId');

    if (!collectionId) {
      return NextResponse.json(
        { error: 'Collection ID is required' },
        { status: 400 }
      );
    }

    // Check ownership
    const collection = await prisma.bookmarkCollection.findUnique({
      where: {
        id: collectionId,
        userId: session.user.id
      }
    });

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    // Delete collection (bookmarks will remain, just removed from collection)
    await prisma.bookmarkCollection.delete({
      where: {
        id: collectionId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting collection:', error);
    return NextResponse.json(
      { error: 'Error deleting collection' },
      { status: 500 }
    );
  }
}