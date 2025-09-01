import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ListingCategory, ListingType } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const {
      title,
      description,
      category,
      type,
      price,
      location,
      county,
      coordinates,
      images,
      features,
      contactInfo
    } = data

    // Check if user can create this type of listing
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Property listing validation
    if (category === 'PROPERTY') {
      const isResidentialSaleOrRent = type === 'RESIDENTIAL_SALE' || type === 'RESIDENTIAL_RENT' || 
                                     type === 'APARTMENT_SALE' || type === 'APARTMENT_RENT' ||
                                     type === 'STUDIO_SALE' || type === 'STUDIO_RENT' ||
                                     type === 'LUXURY_SALE' || type === 'LUXURY_RENT'

      if (isResidentialSaleOrRent && !user.isLicensedAgent) {
        // Create agent request instead of direct listing
        const agentRequest = await prisma.agentRequest.create({
          data: {
            userId: session.user.id,
            county,
            listingData: {
              title,
              description,
              category,
              type,
              price,
              location,
              coordinates,
              images,
              features,
              contactInfo
            }
          }
        })

        return NextResponse.json({
          success: true,
          message: 'Your property listing has been submitted to local licensed agents in your area.',
          agentRequestId: agentRequest.id
        })
      }
    }

    // Create the listing directly
    const listing = await prisma.listing.create({
      data: {
        userId: session.user.id,
        title,
        description,
        category: category as ListingCategory,
        type: type as ListingType,
        price: price ? parseFloat(price) : null,
        location,
        county,
        coordinates,
        images: images || [],
        features,
        contactInfo
      }
    })

    return NextResponse.json({ success: true, listing })
  } catch (error) {
    console.error('Error creating listing:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const type = searchParams.get('type')
    const county = searchParams.get('county')
    const search = searchParams.get('search')

    let where: any = {
      status: 'ACTIVE'
    }

    if (category) where.category = category
    if (type) where.type = type
    if (county) where.county = county
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ]
    }

    const listings = await prisma.listing.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            isLicensedAgent: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ listings })
  } catch (error) {
    console.error('Error fetching listings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
