import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PropertyService } from '@/lib/services/propertyService';
import { PropertyCreateInput, PropertySearchParams } from '@/lib/types/property';

const propertyService = new PropertyService();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data: PropertyCreateInput = await req.json();
    
    // Set owner ID from session
    data.ownerId = session.user.id;

    const property = await propertyService.createProperty(data);
    return NextResponse.json(property);
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    
    const params: PropertySearchParams = {
      type: searchParams.get('type') as any,
      listingType: searchParams.get('listingType') as any,
      status: searchParams.get('status') as any,
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      minBedrooms: searchParams.get('minBedrooms') ? Number(searchParams.get('minBedrooms')) : undefined,
      maxBedrooms: searchParams.get('maxBedrooms') ? Number(searchParams.get('maxBedrooms')) : undefined,
      minBathrooms: searchParams.get('minBathrooms') ? Number(searchParams.get('minBathrooms')) : undefined,
      maxBathrooms: searchParams.get('maxBathrooms') ? Number(searchParams.get('maxBathrooms')) : undefined,
      features: searchParams.getAll('features'),
      location: searchParams.get('latitude') && searchParams.get('longitude') ? {
        latitude: Number(searchParams.get('latitude')),
        longitude: Number(searchParams.get('longitude')),
      } : undefined,
      radius: searchParams.get('radius') ? Number(searchParams.get('radius')) : undefined,
      sortBy: searchParams.get('sortBy') || undefined,
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
      agentId: searchParams.get('agentId') || undefined,
      ownerId: searchParams.get('ownerId') || undefined,
    };

    const session = await getServerSession(authOptions);
    const includePrivate = session?.user && (
      params.ownerId === session.user.id || 
      params.agentId === session.user.id
    );

    const result = await propertyService.searchProperties({
      ...params,
      includePrivate,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error searching properties:', error);
    return NextResponse.json(
      { error: 'Failed to search properties' },
      { status: 500 }
    );
  }
}