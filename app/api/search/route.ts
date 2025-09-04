import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Basic filters
    const query = searchParams.get('q'); // Search query
    const category = searchParams.get('category'); // PROPERTY, SERVICE, LEISURE
    const type = searchParams.get('type'); // SALE, RENT, SERVICE, EXPERIENCE
    const status = searchParams.get('status') || 'ACTIVE';

    // Location filters
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const country = searchParams.get('country');
    const postcode = searchParams.get('postcode');
    const radius = parseFloat(searchParams.get('radius') || '0'); // Search radius in km

    // Price range
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '0');

    // Property specific filters
    const minBedrooms = parseInt(searchParams.get('minBedrooms') || '0');
    const maxBedrooms = parseInt(searchParams.get('maxBedrooms') || '0');
    const minBathrooms = parseInt(searchParams.get('minBathrooms') || '0');
    const maxBathrooms = parseInt(searchParams.get('maxBathrooms') || '0');
    const minArea = parseFloat(searchParams.get('minArea') || '0');
    const maxArea = parseFloat(searchParams.get('maxArea') || '0');
    const propertyType = searchParams.get('propertyType');
    const tenure = searchParams.get('tenure');

    // Service specific filters
    const serviceType = searchParams.get('serviceType');
    
    // Leisure specific filters
    const leisureType = searchParams.get('leisureType');
    const bookingType = searchParams.get('bookingType');

    // Features
    const features = searchParams.getAll('features[]');

    // Verification filter
    const verifiedOnly = searchParams.get('verifiedOnly') === 'true';

    // Build where clause
    const where: any = {
      status,
    };

    // Text search
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    // Basic filters
    if (category) where.category = category;
    if (type) where.type = type;

    // Location filters
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (state) where.state = { contains: state, mode: 'insensitive' };
    if (country) where.country = { contains: country, mode: 'insensitive' };
    if (postcode) where.postcode = { contains: postcode, mode: 'insensitive' };

    // Radius search (if coordinates and radius provided)
    if (radius > 0 && searchParams.get('lat') && searchParams.get('lng')) {
      const lat = parseFloat(searchParams.get('lat')!);
      const lng = parseFloat(searchParams.get('lng')!);
      where.AND = [
        {
          latitude: {
            gte: lat - radius / 111, // Approximate degrees for km
            lte: lat + radius / 111,
          },
        },
        {
          longitude: {
            gte: lng - radius / (111 * Math.cos(lat * Math.PI / 180)),
            lte: lng + radius / (111 * Math.cos(lat * Math.PI / 180)),
          },
        },
      ];
    }

    // Price range
    if (minPrice > 0 || maxPrice > 0) {
      where.price = {};
      if (minPrice > 0) where.price.gte = minPrice;
      if (maxPrice > 0) where.price.lte = maxPrice;
    }

    // Property specific filters
    if (category === 'PROPERTY') {
      if (minBedrooms > 0) where.bedrooms = { gte: minBedrooms };
      if (maxBedrooms > 0) where.bedrooms = { ...where.bedrooms, lte: maxBedrooms };
      if (minBathrooms > 0) where.bathrooms = { gte: minBathrooms };
      if (maxBathrooms > 0) where.bathrooms = { ...where.bathrooms, lte: maxBathrooms };
      if (minArea > 0) where.area = { gte: minArea };
      if (maxArea > 0) where.area = { ...where.area, lte: maxArea };
      if (propertyType) where.propertyType = propertyType;
      if (tenure) where.tenure = tenure;
    }

    // Service specific filters
    if (category === 'SERVICE' && serviceType) {
      where.serviceType = serviceType;
    }

    // Leisure specific filters
    if (category === 'LEISURE') {
      if (leisureType) where.leisureType = leisureType;
      if (bookingType) where.bookingType = bookingType;
    }

    // Features filter
    if (features.length > 0) {
      where.features = {
        hasEvery: features,
      };
    }

    // Verified owner filter
    if (verifiedOnly) {
      where.owner = {
        isVerified: true,
      };
    }

    // Get total count for pagination
    const total = await prisma.listing.count({ where });

    // Execute search
    const listings = await prisma.listing.findMany({
      where,
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
      orderBy: [
        { updatedAt: 'desc' },
        { createdAt: 'desc' },
      ],
      skip,
      take: limit,
    });

    // Return results with pagination
    return NextResponse.json({
      listings,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
      filters: {
        query,
        category,
        type,
        city,
        state,
        country,
        postcode,
        radius,
        minPrice,
        maxPrice,
        propertyType,
        tenure,
        serviceType,
        leisureType,
        bookingType,
        features,
        verifiedOnly,
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to execute search' },
      { status: 500 }
    );
  }
}