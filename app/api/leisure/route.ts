import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();

    // Get user's quota information
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        subscriptionTier: true,
        monthlyLeisureQuota: true,
        monthlyLeisureUsed: true,
        quotaResetDate: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Reset quota if it's a new month
    if (user.quotaResetDate && new Date() > new Date(user.quotaResetDate)) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          monthlyLeisureUsed: 0,
          quotaResetDate: new Date(
            new Date().getFullYear(),
            new Date().getMonth() + 1,
            1
          ),
        },
      });
      user.monthlyLeisureUsed = 0;
    }

    // Check quota for free users
    if (
      user.subscriptionTier === 'FREE' &&
      user.monthlyLeisureUsed >= user.monthlyLeisureQuota
    ) {
      return NextResponse.json(
        { error: 'Monthly leisure listing quota exceeded' },
        { status: 403 }
      );
    }

    // Create leisure listing
    const leisure = await prisma.leisure.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        price: data.price,
        location: data.location,
        availability: data.availability,
        providerId: session.user.id,
        status: 'ACTIVE',
        isFeatured: user.subscriptionTier === 'PRO',
      },
    });

    // Update user's quota if they're on the free tier
    if (user.subscriptionTier === 'FREE') {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          monthlyLeisureUsed: user.monthlyLeisureUsed + 1,
        },
      });
    }

    return NextResponse.json(leisure);
  } catch (error) {
    console.error('Error in leisure POST:', error);
    return NextResponse.json(
      { error: 'Failed to create leisure listing' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();

    // Verify ownership
    const existingLeisure = await prisma.leisure.findUnique({
      where: { id: data.id },
      select: { providerId: true },
    });

    if (!existingLeisure) {
      return NextResponse.json(
        { error: 'Leisure listing not found' },
        { status: 404 }
      );
    }

    if (existingLeisure.providerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this listing' },
        { status: 403 }
      );
    }

    // Update leisure listing
    const leisure = await prisma.leisure.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        price: data.price,
        location: data.location,
        availability: data.availability,
      },
    });

    return NextResponse.json(leisure);
  } catch (error) {
    console.error('Error in leisure PUT:', error);
    return NextResponse.json(
      { error: 'Failed to update leisure listing' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const existingLeisure = await prisma.leisure.findUnique({
      where: { id },
      select: { providerId: true },
    });

    if (!existingLeisure) {
      return NextResponse.json(
        { error: 'Leisure listing not found' },
        { status: 404 }
      );
    }

    if (existingLeisure.providerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to delete this listing' },
        { status: 403 }
      );
    }

    // Delete leisure listing
    await prisma.leisure.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in leisure DELETE:', error);
    return NextResponse.json(
      { error: 'Failed to delete leisure listing' },
      { status: 500 }
    );
  }
}