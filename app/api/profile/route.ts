import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { uploadToS3, deleteFromS3 } from '@/lib/s3';

// Get user profile
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');

    // Get profile data
    const profile = await prisma.user.findUnique({
      where: {
        username: username || session.user.username
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        image: true,
        coverImage: true,
        bio: true,
        location: true,
        website: true,
        verified: true,
        company: true,
        position: true,
        experience: true,
        specialties: true,
        certifications: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true
          }
        }
      }
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Check if the logged-in user follows this profile
    const isFollowing = await prisma.follow.findFirst({
      where: {
        followerId: session.user.id,
        followingId: profile.id
      }
    });

    return NextResponse.json({
      ...profile,
      isFollowing: !!isFollowing
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Error fetching profile' },
      { status: 500 }
    );
  }
}

// Update user profile
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    
    // Handle profile photo
    const profilePhoto = formData.get('profilePhoto') as File;
    let profilePhotoUrl = undefined;
    
    if (profilePhoto) {
      // Delete old profile photo from S3 if it exists
      const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { image: true }
      });
      
      if (currentUser?.image) {
        await deleteFromS3(currentUser.image);
      }
      
      // Upload new profile photo
      const buffer = Buffer.from(await profilePhoto.arrayBuffer());
      profilePhotoUrl = await uploadToS3(buffer, \`profile/\${session.user.id}/\${profilePhoto.name}\`, profilePhoto.type);
    }

    // Handle cover photo
    const coverPhoto = formData.get('coverPhoto') as File;
    let coverPhotoUrl = undefined;
    
    if (coverPhoto) {
      // Delete old cover photo from S3 if it exists
      const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { coverImage: true }
      });
      
      if (currentUser?.coverImage) {
        await deleteFromS3(currentUser.coverImage);
      }
      
      // Upload new cover photo
      const buffer = Buffer.from(await coverPhoto.arrayBuffer());
      coverPhotoUrl = await uploadToS3(buffer, \`profile/\${session.user.id}/cover/\${coverPhoto.name}\`, coverPhoto.type);
    }

    // Get other profile data
    const name = formData.get('name') as string;
    const username = formData.get('username') as string;
    const bio = formData.get('bio') as string;
    const location = formData.get('location') as string;
    const website = formData.get('website') as string;
    const company = formData.get('company') as string;
    const position = formData.get('position') as string;
    const experience = formData.get('experience') as string;
    const specialties = JSON.parse(formData.get('specialties') as string || '[]');
    const certifications = JSON.parse(formData.get('certifications') as string || '[]');

    // Check username uniqueness if changed
    if (username && username !== session.user.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 400 }
        );
      }
    }

    // Update profile
    const updatedProfile = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || undefined,
        username: username || undefined,
        bio: bio || undefined,
        location: location || undefined,
        website: website || undefined,
        company: company || undefined,
        position: position || undefined,
        experience: experience || undefined,
        specialties,
        certifications,
        ...(profilePhotoUrl && { image: profilePhotoUrl }),
        ...(coverPhotoUrl && { coverImage: coverPhotoUrl })
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        image: true,
        coverImage: true,
        bio: true,
        location: true,
        website: true,
        verified: true,
        company: true,
        position: true,
        experience: true,
        specialties: true,
        certifications: true
      }
    });

    return NextResponse.json({ profile: updatedProfile });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Error updating profile' },
      { status: 500 }
    );
  }
}

// Delete profile photo or cover photo
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'profile' or 'cover'

    if (!type || !['profile', 'cover'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid photo type' },
        { status: 400 }
      );
    }

    // Get current user data
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        image: true,
        coverImage: true
      }
    });

    // Delete photo from S3
    if (type === 'profile' && currentUser?.image) {
      await deleteFromS3(currentUser.image);
    } else if (type === 'cover' && currentUser?.coverImage) {
      await deleteFromS3(currentUser.coverImage);
    }

    // Update user record
    const updatedProfile = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(type === 'profile' && { image: null }),
        ...(type === 'cover' && { coverImage: null })
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        image: true,
        coverImage: true,
        bio: true,
        location: true,
        website: true,
        verified: true
      }
    });

    return NextResponse.json({ profile: updatedProfile });
  } catch (error) {
    console.error('Error deleting photo:', error);
    return NextResponse.json(
      { error: 'Error deleting photo' },
      { status: 500 }
    );
  }
}