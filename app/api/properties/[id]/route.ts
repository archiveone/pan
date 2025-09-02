import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for property updates
const propertyUpdateSchema = z.object({
  title: z.string().min(10).optional(),
  description: z.string().min(50).optional(),
  price: z.number().positive().optional(),
  currency: z.string().optional(),
  location: z.string().min(5).optional(),
  propertyType: z.enum(['HOUSE', 'APARTMENT', 'COMMERCIAL', 'LAND']).optional(),
  listingType: z.enum(['SALE', 'RENT']).optional(),
  status: z.enum(['ACTIVE', 'UNDER_OFFER', 'SOLD', 'RENTED', 'INACTIVE']).optional(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  features: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.object({
    url: z.string().url(),
    isPrimary: z.boolean().default(false),
  })).optional(),
})

// GET /api/properties/[id] - Get single property
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const property = await prisma.propertyListing.findUnique({
      where: { id: params.id },
      include: {
        images: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            agentProfile: true,
          },
        },
        _count: {
          select: {
            views: true,
            favorites: true,
            enquiries: true,
          },
        },
      },
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Record view if user is authenticated
    const session = await getServerSession(authOptions)
    if (session?.user) {
      await prisma.propertyView.upsert({
        where: {
          propertyId_userId: {
            propertyId: params.id,
            userId: session.user.id,
          },
        },
        update: {
          viewedAt: new Date(),
        },
        create: {
          propertyId: params.id,
          userId: session.user.id,
        },
      })
    }

    return NextResponse.json(property)
  } catch (error) {
    console.error('Error fetching property:', error)
    return NextResponse.json(
      { error: 'Failed to fetch property' },
      { status: 500 }
    )
  }
}

// PUT /api/properties/[id] - Update property
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user owns the property or is admin
    const property = await prisma.propertyListing.findUnique({
      where: { id: params.id },
      select: { userId: true },
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    if (property.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const json = await request.json()
    const validatedData = propertyUpdateSchema.parse(json)

    // Update property with new data
    const updatedProperty = await prisma.propertyListing.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        ...(validatedData.images && {
          images: {
            deleteMany: {},
            create: validatedData.images,
          },
        }),
      },
      include: {
        images: true,
        user: {
          select: {
            name: true,
            image: true,
            agentProfile: true,
          },
        },
      },
    })

    return NextResponse.json(updatedProperty)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid property data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating property:', error)
    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    )
  }
}

// DELETE /api/properties/[id] - Soft delete property
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user owns the property or is admin
    const property = await prisma.propertyListing.findUnique({
      where: { id: params.id },
      select: { userId: true },
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    if (property.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Soft delete by setting status to INACTIVE
    await prisma.propertyListing.update({
      where: { id: params.id },
      data: { status: 'INACTIVE' },
    })

    return NextResponse.json(
      { message: 'Property listing deactivated successfully' }
    )
  } catch (error) {
    console.error('Error deleting property:', error)
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    )
  }
}