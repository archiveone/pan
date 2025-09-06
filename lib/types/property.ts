import { PropertyType, ListingType, PropertyStatus } from '@prisma/client';

export interface PropertyImage {
  url: string;
  caption?: string;
}

export interface PropertyDocument {
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface PropertyLocation {
  latitude: number;
  longitude: number;
}

export interface PropertyCreateInput {
  title: string;
  description: string;
  type: PropertyType;
  listingType: ListingType;
  price: number;
  currency?: string;
  size?: number;
  bedrooms?: number;
  bathrooms?: number;
  featureIds?: string[];
  addressId: string;
  images?: PropertyImage[];
  documents?: PropertyDocument[];
  virtualTour?: string;
  floorPlan?: string;
  energyRating?: string;
  ownerId: string;
  agentId?: string;
  isPrivate?: boolean;
}

export interface PropertyUpdateInput {
  title?: string;
  description?: string;
  type?: PropertyType;
  status?: PropertyStatus;
  listingType?: ListingType;
  price?: number;
  currency?: string;
  size?: number;
  bedrooms?: number;
  bathrooms?: number;
  featureIds?: string[];
  addressId?: string;
  images?: PropertyImage[];
  documents?: PropertyDocument[];
  virtualTour?: string;
  floorPlan?: string;
  energyRating?: string;
  agentId?: string;
  isPrivate?: boolean;
}

export interface PropertySearchParams {
  type?: PropertyType;
  listingType?: ListingType;
  status?: PropertyStatus;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  features?: string[];
  location?: PropertyLocation;
  radius?: number; // in kilometers
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  includePrivate?: boolean;
  agentId?: string;
  ownerId?: string;
}

export interface PropertyListResponse {
  properties: Property[];
  total: number;
  page: number;
  totalPages: number;
}

export interface PropertyFeature {
  id: string;
  name: string;
  icon?: string;
  category: string;
}

export interface PropertyAddress {
  id: string;
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface PropertyUser {
  id: string;
  name: string;
  email?: string;
  image?: string;
}

export interface PropertyReview {
  id: string;
  rating: number;
  title: string;
  content: string;
  photos: string[];
  isVerified: boolean;
  createdAt: string;
  user: PropertyUser;
}

export interface PropertyCounts {
  favorites: number;
  viewings: number;
  offers: number;
  reviews: number;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  status: PropertyStatus;
  listingType: ListingType;
  price: number;
  currency: string;
  size?: number;
  bedrooms?: number;
  bathrooms?: number;
  features: PropertyFeature[];
  address: PropertyAddress;
  images: PropertyImage[];
  documents: PropertyDocument[];
  virtualTour?: string;
  floorPlan?: string;
  energyRating?: string;
  owner: PropertyUser;
  agent?: PropertyUser;
  isPrivate: boolean;
  isVerified: boolean;
  reviews?: PropertyReview[];
  _count?: PropertyCounts;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface PropertyViewing {
  id: string;
  property: Property;
  user: PropertyUser;
  datetime: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyOffer {
  id: string;
  property: Property;
  user: PropertyUser;
  amount: number;
  currency: string;
  status: string;
  message?: string;
  validUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyValuation {
  id: string;
  property: Property;
  agent: PropertyUser;
  amount: number;
  currency: string;
  report?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}