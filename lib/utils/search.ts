import { ListingCategory, ListingType, PropertyType, ServiceType, LeisureType, BookingType } from '@prisma/client';
import { geocodeAddress, isValidCoordinates, getNearbyCoordinates } from './geocoding';

export interface SearchFilters {
  query?: string;
  category?: ListingCategory;
  type?: ListingType;
  city?: string;
  state?: string;
  country?: string;
  postcode?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  radius?: number;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  minArea?: number;
  maxArea?: number;
  propertyType?: PropertyType;
  serviceType?: ServiceType;
  leisureType?: LeisureType;
  bookingType?: BookingType;
  features?: string[];
  verifiedOnly?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'date_desc' | 'date_asc';
  page?: number;
  limit?: number;
}

export interface SearchParams {
  where: any;
  orderBy: any[];
  skip: number;
  take: number;
}

/**
 * Build Prisma search parameters from search filters
 */
export async function buildSearchParams(filters: SearchFilters): Promise<SearchParams> {
  const where: any = {
    status: 'ACTIVE',
  };

  // Text search
  if (filters.query) {
    where.OR = [
      { title: { contains: filters.query, mode: 'insensitive' } },
      { description: { contains: filters.query, mode: 'insensitive' } },
    ];
  }

  // Basic filters
  if (filters.category) where.category = filters.category;
  if (filters.type) where.type = filters.type;

  // Location filters
  if (filters.city) where.city = { contains: filters.city, mode: 'insensitive' };
  if (filters.state) where.state = { contains: filters.state, mode: 'insensitive' };
  if (filters.country) where.country = { contains: filters.country, mode: 'insensitive' };
  if (filters.postcode) where.postcode = { contains: filters.postcode, mode: 'insensitive' };

  // Geocoding and radius search
  if (filters.coordinates && filters.radius && filters.radius > 0) {
    const { lat, lng } = filters.coordinates;
    if (isValidCoordinates(lat, lng)) {
      const bounds = getNearbyCoordinates(lat, lng, filters.radius);
      where.AND = [
        {
          latitude: {
            gte: bounds.minLat,
            lte: bounds.maxLat,
          },
        },
        {
          longitude: {
            gte: bounds.minLng,
            lte: bounds.maxLng,
          },
        },
      ];
    }
  }

  // Price range
  if (filters.minPrice || filters.maxPrice) {
    where.price = {};
    if (filters.minPrice) where.price.gte = filters.minPrice;
    if (filters.maxPrice) where.price.lte = filters.maxPrice;
  }

  // Property specific filters
  if (filters.category === 'PROPERTY') {
    if (filters.minBedrooms) where.bedrooms = { gte: filters.minBedrooms };
    if (filters.maxBedrooms) where.bedrooms = { ...where.bedrooms, lte: filters.maxBedrooms };
    if (filters.minBathrooms) where.bathrooms = { gte: filters.minBathrooms };
    if (filters.maxBathrooms) where.bathrooms = { ...where.bathrooms, lte: filters.maxBathrooms };
    if (filters.minArea) where.area = { gte: filters.minArea };
    if (filters.maxArea) where.area = { ...where.area, lte: filters.maxArea };
    if (filters.propertyType) where.propertyType = filters.propertyType;
  }

  // Service specific filters
  if (filters.category === 'SERVICE' && filters.serviceType) {
    where.serviceType = filters.serviceType;
  }

  // Leisure specific filters
  if (filters.category === 'LEISURE') {
    if (filters.leisureType) where.leisureType = filters.leisureType;
    if (filters.bookingType) where.bookingType = filters.bookingType;
  }

  // Features filter
  if (filters.features && filters.features.length > 0) {
    where.features = {
      hasEvery: filters.features,
    };
  }

  // Verified owner filter
  if (filters.verifiedOnly) {
    where.owner = {
      isVerified: true,
    };
  }

  // Sorting
  const orderBy: any[] = [];
  switch (filters.sortBy) {
    case 'price_asc':
      orderBy.push({ price: 'asc' });
      break;
    case 'price_desc':
      orderBy.push({ price: 'desc' });
      break;
    case 'date_asc':
      orderBy.push({ createdAt: 'asc' });
      break;
    case 'date_desc':
    default:
      orderBy.push({ createdAt: 'desc' });
  }

  // Always add a secondary sort by id for consistency
  orderBy.push({ id: 'desc' });

  // Pagination
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const skip = (page - 1) * limit;

  return {
    where,
    orderBy,
    skip,
    take: limit,
  };
}

/**
 * Format search filters for display
 */
export function formatSearchFilters(filters: SearchFilters): string {
  const parts: string[] = [];

  if (filters.category) parts.push(filters.category.toLowerCase());
  if (filters.type) parts.push(filters.type.toLowerCase());
  if (filters.city) parts.push(filters.city);
  if (filters.minPrice) parts.push(`Min $${filters.minPrice.toLocaleString()}`);
  if (filters.maxPrice) parts.push(`Max $${filters.maxPrice.toLocaleString()}`);

  if (filters.category === 'PROPERTY') {
    if (filters.minBedrooms) parts.push(`${filters.minBedrooms}+ beds`);
    if (filters.minBathrooms) parts.push(`${filters.minBathrooms}+ baths`);
    if (filters.propertyType) parts.push(filters.propertyType.toLowerCase());
  }

  return parts.join(' • ');
}

/**
 * Parse search filters from URL search params
 */
export function parseSearchFilters(searchParams: URLSearchParams): SearchFilters {
  return {
    query: searchParams.get('q') || undefined,
    category: (searchParams.get('category') as ListingCategory) || undefined,
    type: (searchParams.get('type') as ListingType) || undefined,
    city: searchParams.get('city') || undefined,
    state: searchParams.get('state') || undefined,
    country: searchParams.get('country') || undefined,
    postcode: searchParams.get('postcode') || undefined,
    coordinates: searchParams.has('lat') && searchParams.has('lng')
      ? {
          lat: parseFloat(searchParams.get('lat')!),
          lng: parseFloat(searchParams.get('lng')!),
        }
      : undefined,
    radius: searchParams.has('radius')
      ? parseFloat(searchParams.get('radius')!)
      : undefined,
    minPrice: searchParams.has('minPrice')
      ? parseFloat(searchParams.get('minPrice')!)
      : undefined,
    maxPrice: searchParams.has('maxPrice')
      ? parseFloat(searchParams.get('maxPrice')!)
      : undefined,
    minBedrooms: searchParams.has('minBedrooms')
      ? parseInt(searchParams.get('minBedrooms')!)
      : undefined,
    maxBedrooms: searchParams.has('maxBedrooms')
      ? parseInt(searchParams.get('maxBedrooms')!)
      : undefined,
    minBathrooms: searchParams.has('minBathrooms')
      ? parseInt(searchParams.get('minBathrooms')!)
      : undefined,
    maxBathrooms: searchParams.has('maxBathrooms')
      ? parseInt(searchParams.get('maxBathrooms')!)
      : undefined,
    minArea: searchParams.has('minArea')
      ? parseFloat(searchParams.get('minArea')!)
      : undefined,
    maxArea: searchParams.has('maxArea')
      ? parseFloat(searchParams.get('maxArea')!)
      : undefined,
    propertyType: (searchParams.get('propertyType') as PropertyType) || undefined,
    serviceType: (searchParams.get('serviceType') as ServiceType) || undefined,
    leisureType: (searchParams.get('leisureType') as LeisureType) || undefined,
    bookingType: (searchParams.get('bookingType') as BookingType) || undefined,
    features: searchParams.getAll('features[]'),
    verifiedOnly: searchParams.get('verifiedOnly') === 'true',
    sortBy: (searchParams.get('sortBy') as SearchFilters['sortBy']) || undefined,
    page: searchParams.has('page')
      ? parseInt(searchParams.get('page')!)
      : undefined,
    limit: searchParams.has('limit')
      ? parseInt(searchParams.get('limit')!)
      : undefined,
  };
}

/**
 * Convert search filters to URL search params
 */
export function filtersToSearchParams(filters: SearchFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.query) params.set('q', filters.query);
  if (filters.category) params.set('category', filters.category);
  if (filters.type) params.set('type', filters.type);
  if (filters.city) params.set('city', filters.city);
  if (filters.state) params.set('state', filters.state);
  if (filters.country) params.set('country', filters.country);
  if (filters.postcode) params.set('postcode', filters.postcode);
  if (filters.coordinates) {
    params.set('lat', filters.coordinates.lat.toString());
    params.set('lng', filters.coordinates.lng.toString());
  }
  if (filters.radius) params.set('radius', filters.radius.toString());
  if (filters.minPrice) params.set('minPrice', filters.minPrice.toString());
  if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString());
  if (filters.minBedrooms) params.set('minBedrooms', filters.minBedrooms.toString());
  if (filters.maxBedrooms) params.set('maxBedrooms', filters.maxBedrooms.toString());
  if (filters.minBathrooms) params.set('minBathrooms', filters.minBathrooms.toString());
  if (filters.maxBathrooms) params.set('maxBathrooms', filters.maxBathrooms.toString());
  if (filters.minArea) params.set('minArea', filters.minArea.toString());
  if (filters.maxArea) params.set('maxArea', filters.maxArea.toString());
  if (filters.propertyType) params.set('propertyType', filters.propertyType);
  if (filters.serviceType) params.set('serviceType', filters.serviceType);
  if (filters.leisureType) params.set('leisureType', filters.leisureType);
  if (filters.bookingType) params.set('bookingType', filters.bookingType);
  if (filters.features) {
    filters.features.forEach(feature => params.append('features[]', feature));
  }
  if (filters.verifiedOnly) params.set('verifiedOnly', 'true');
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.page) params.set('page', filters.page.toString());
  if (filters.limit) params.set('limit', filters.limit.toString());

  return params;
}