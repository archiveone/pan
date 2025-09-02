import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for property creation/update
const propertySchema = z.object({
  title: z.string().min(10),
  description: z.string().min(50),
  price: z.number().positive(),
  currency: z.string().default('GBP'),
  location: z.string().min(5),
  propertyType: z.enum(['HOUSE', 'APARTMENT', 'COMMERCIAL', 'LAND']),
  listingType: z.enum(['SALE', 'RENT']),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  features: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.object({
    url: z.string().url(),
    isPrimary: z.boolean().default(false),
  })).optional(),
})

// GET /api/properties - List properties with filtering
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const propertyType = searchParams.get('propertyType')
    const listingType = searchParams.get('listingType')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const location = searchParams.get('location')
    const searchTerm = searchParams.get('search')

    // Build filter conditions
    const where: any = {
      status: 'ACTIVE',
    }

    if (propertyType) {
      where.propertyType = propertyType
    }

    if (listingType) {
      where.listingType = listingType
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }

    if (location) {
      where.location = {
        contains: location,
        mode: 'insensitive',
      }
    }

    if (searchTerm) {
      where.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ]
    }

    // Get total count for pagination
    const total = await prisma.propertyListing.count({ where })

    // Get paginated results
    const properties = await prisma.propertyListing.findMany({
      where,
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
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      properties,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    })
  } catch (error) {
    console.error('Error fetching properties:', error)
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    )
  }
}

// POST /api/properties - Create new property listing
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const json = await request.json()
    const validatedData = propertySchema.parse(json)

    const property = await prisma.propertyListing.create({
      data: {
        ...validatedData,
        userId: session.user.id,
        images: {
          create: validatedData.images || [],
        },
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

    return NextResponse.json(property, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid property data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating property:', error)
    return NextResponse.json(
      { error: 'Failed to create property listing' },
      { status: 500 }
    )
  }
}