import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface Params {
  params: {
    id: string;
  };
}

// GET /api/listings/[id] - Get a single listing
export async function GET(req: Request, { params }: Params) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            verified: true,
            agentProfile: {
              select: {
                id: true,
                company: true,
                kycVerified: true,
                specialties: true,
                experience: true,
              },
            },
          },
        },
        media: {
          orderBy: {
            order: 'asc',
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
        _count: {
          select: {
            savedBy: true,
            reviews: true,
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

    // Increment view count
    await prisma.listing.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    // Check if user has saved this listing
    let isSaved = false;
    if (session?.user) {
      const savedListing = await prisma.savedListing.findUnique({
        where: {
          userId_listingId: {
            userId: session.user.id,
            listingId: id,
          },
        },
      });
      isSaved = !!savedListing;
    }

    // Get similar listings
    const similarListings = await prisma.listing.findMany({
      where: {
        id: { not: id },
        type: listing.type,
        status: 'ACTIVE',
        city: listing.city,
        OR: [
          { propertyType: listing.propertyType },
          { serviceType: listing.serviceType },
          { leisureType: listing.leisureType },
        ],
      },
      include: {
        media: {
          where: { isPrimary: true },
          take: 1,
        },
        _count: {
          select: {
            savedBy: true,
            reviews: true,
          },
        },
      },
      take: 4,
    });

    return NextResponse.json({
      ...listing,
      isSaved,
      similarListings,
    });
  } catch (error) {
    console.error('Listing fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listing' },
      { status: 500 }
    );
  }
}

// PATCH /api/listings/[id] - Update a listing
export async function PATCH(req: Request, { params }: Params) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if listing exists and belongs to user
    const existingListing = await prisma.listing.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingListing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    if (existingListing.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to update this listing' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      media,
      ...updates
    } = body;

    // Start a transaction for atomic updates
    const updatedListing = await prisma.$transaction(async (tx) => {
      // Update the listing
      const listing = await tx.listing.update({
        where: { id },
        data: updates,
      });

      // Handle media updates if provided
      if (media) {
        // Delete existing media
        await tx.listingMedia.deleteMany({
          where: { listingId: id },
        });

        // Create new media records
        if (media.length > 0) {
          await tx.listingMedia.createMany({
            data: media.map((m: any, index: number) => ({
              listingId: id,
              ...m,
              order: index,
            })),
          });
        }
      }

      return listing;
    });

    return NextResponse.json(updatedListing);
  } catch (error) {
    console.error('Listing update error:', error);
    return NextResponse.json(
      { error: 'Failed to update listing' },
      { status: 500 }
    );
  }
}

// DELETE /api/listings/[id] - Delete a listing
export async function DELETE(req: Request, { params }: Params) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if listing exists and belongs to user
    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    if (listing.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this listing' },
        { status: 403 }
      );
    }

    // Delete listing and related records in a transaction
    await prisma.$transaction([
      // Delete related records
      prisma.listingMedia.deleteMany({
        where: { listingId: id },
      }),
      prisma.savedListing.deleteMany({
        where: { listingId: id },
      }),
      prisma.review.deleteMany({
        where: { listingId: id },
      }),
      prisma.booking.deleteMany({
        where: { listingId: id },
      }),
      // Delete the listing
      prisma.listing.delete({
        where: { id },
      }),
    ]);

    return NextResponse.json({
      message: 'Listing deleted successfully',
    });
  } catch (error) {
    console.error('Listing deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete listing' },
      { status: 500 }
    );
  }
}