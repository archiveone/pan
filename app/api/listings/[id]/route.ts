import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET /api/listings/[id] - Get a single listing
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            image: true,
            isVerified: true,
          },
        },
        _count: {
          select: {
            savedBy: true,
            enquiries: true,
          },
        },
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(listing);
  } catch (error) {
    console.error('Error fetching listing:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listing' },
      { status: 500 }
    );
  }
}

// PATCH /api/listings/[id] - Update a listing
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();

    // Check if user owns the listing or is admin
    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      select: { ownerId: true },
    });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (listing?.ownerId !== session.user.id && user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Update listing
    const updatedListing = await prisma.listing.update({
      where: { id: params.id },
      data,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            image: true,
            isVerified: true,
          },
        },
      },
    });

    return NextResponse.json(updatedListing);
  } catch (error) {
    console.error('Error updating listing:', error);
    return NextResponse.json(
      { error: 'Failed to update listing' },
      { status: 500 }
    );
  }
}

// DELETE /api/listings/[id] - Delete a listing
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user owns the listing or is admin
    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      select: { ownerId: true },
    });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (listing?.ownerId !== session.user.id && user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete listing
    await prisma.listing.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Error deleting listing:', error);
    return NextResponse.json(
      { error: 'Failed to delete listing' },
      { status: 500 }
    );
  }
}

// POST /api/listings/[id]/save - Save/unsave a listing
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { action } = await request.json();

    if (action !== 'save' && action !== 'unsave') {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    // Check if listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: {
        savedBy: {
          where: { id: session.user.id },
          select: { id: true },
        },
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Save or unsave the listing
    if (action === 'save' && listing.savedBy.length === 0) {
      await prisma.listing.update({
        where: { id: params.id },
        data: {
          savedBy: {
            connect: { id: session.user.id },
          },
        },
      });
      return NextResponse.json({ message: 'Listing saved successfully' });
    } else if (action === 'unsave' && listing.savedBy.length > 0) {
      await prisma.listing.update({
        where: { id: params.id },
        data: {
          savedBy: {
            disconnect: { id: session.user.id },
          },
        },
      });
      return NextResponse.json({ message: 'Listing unsaved successfully' });
    }

    return NextResponse.json({ message: 'No action needed' });
  } catch (error) {
    console.error('Error saving/unsaving listing:', error);
    return NextResponse.json(
      { error: 'Failed to save/unsave listing' },
      { status: 500 }
    );
  }
}