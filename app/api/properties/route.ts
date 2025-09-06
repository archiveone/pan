import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PropertyService } from '@/lib/services/propertyService';
import { z } from 'zod';

const propertyService = new PropertyService();

// Property creation schema
const createPropertySchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(['RESIDENTIAL', 'COMMERCIAL', 'LUXURY', 'TIMESHARE', 'LAND', 'INDUSTRIAL']),
  listingType: z.enum(['SALE', 'RENT', 'AUCTION', 'PRIVATE_SALE']),
  price: z.number().positive(),
  currency: z.string().default('EUR'),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  size: z.number().optional(),
  features: z.array(z.string()).optional(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string().optional(),
    country: z.string(),
    postalCode: z.string(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
  images: z.array(z.object({
    url: z.string().url(),
    caption: z.string().optional(),
  })).optional(),
  documents: z.array(z.object({
    url: z.string().url(),
    name: z.string(),
    type: z.string(),
  })).optional(),
  virtualTour: z.string().url().optional(),
  floorPlan: z.string().url().optional(),
  energyRating: z.string().optional(),
  status: z.enum(['DRAFT', 'PENDING', 'ACTIVE', 'INACTIVE', 'SOLD', 'RENTED']).default('DRAFT'),
});

// Search params schema
const searchParamsSchema = z.object({
  type: z.string().optional(),
  listingType: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  minBedrooms: z.coerce.number().optional(),
  maxBedrooms: z.coerce.number().optional(),
  minBathrooms: z.coerce.number().optional(),
  maxBathrooms: z.coerce.number().optional(),
  minSize: z.coerce.number().optional(),
  maxSize: z.coerce.number().optional(),
  features: z.string().transform(s => s.split(',')).optional(),
  energyRating: z.string().optional(),
  location: z.string().optional(),
  radius: z.coerce.number().optional(),
  isVerified: z.coerce.boolean().optional(),
  sortBy: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    const validatedParams = searchParamsSchema.parse(params);
    
    const properties = await propertyService.searchProperties(validatedParams);
    
    return NextResponse.json(properties);
  } catch (error) {
    console.error('Error in GET /api/properties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createPropertySchema.parse(body);
    
    const property = await propertyService.createProperty({
      ...validatedData,
      userId: session.user.id,
    });
    
    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid property data', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error in POST /api/properties:', error);
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...data } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }

    const validatedData = createPropertySchema.partial().parse(data);
    
    const property = await propertyService.updateProperty(id, {
      ...validatedData,
      userId: session.user.id,
    });
    
    return NextResponse.json(property);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid property data', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error in PUT /api/properties:', error);
    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }

    await propertyService.deleteProperty(id, session.user.id);
    
    return NextResponse.json(
      { message: 'Property deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/properties:', error);
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    );
  }
}