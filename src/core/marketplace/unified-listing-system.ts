/**
 * PAN Marketplace - Unified Listing System
 * Core system for managing Places, People, and Experiences listings
 */

export enum ListingCategory {
  PLACES = 'places',
  PEOPLE = 'people',
  EXPERIENCES = 'experiences'
}

export enum PlaceType {
  HOSTEL = 'hostel',
  HOTEL = 'hotel',
  AIRBNB = 'airbnb',
  SHORT_TERM_RENTAL = 'short_term_rental',
  VENUE_SPACE = 'venue_space',
  WORKSPACE = 'workspace',
  LANDMARK = 'landmark',
  ATTRACTION = 'attraction',
  TICKETED_VENUE = 'ticketed_venue'
}

export enum PeopleType {
  PROFESSIONAL = 'professional',
  SERVICE_PROVIDER = 'service_provider',
  COMPANY = 'company',
  ORGANIZATION = 'organization',
  SPECIALIST = 'specialist'
}

export enum ExperienceType {
  TOUR = 'tour',
  EVENT = 'event',
  FESTIVAL = 'festival',
  CONCERT = 'concert',
  ART_GALLERY = 'art_gallery',
  MUSEUM = 'museum',
  RESTAURANT = 'restaurant',
  ADVENTURE_PARK = 'adventure_park',
  CULTURAL_VENUE = 'cultural_venue'
}

export interface BaseListingData {
  id: string;
  title: string;
  description: string;
  category: ListingCategory;
  type: PlaceType | PeopleType | ExperienceType;
  ownerId: string;
  images: string[];
  location?: {
    address: string;
    city: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  pricing?: {
    amount: number;
    currency: string;
    period?: string; // hourly, daily, weekly, monthly
  };
  availability?: {
    startDate: Date;
    endDate: Date;
    schedule?: string;
  };
  tags: string[];
  verified: boolean;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
}

export interface PlaceListing extends BaseListingData {
  category: ListingCategory.PLACES;
  type: PlaceType;
  amenities: string[];
  capacity: number;
  rules?: string[];
  checkInTime?: string;
  checkOutTime?: string;
}

export interface PeopleListing extends BaseListingData {
  category: ListingCategory.PEOPLE;
  type: PeopleType;
  skills: string[];
  experience: string;
  certifications?: string[];
  portfolio?: string[];
  hourlyRate?: number;
  availability: {
    days: string[];
    hours: string;
  };
}

export interface ExperienceListing extends BaseListingData {
  category: ListingCategory.EXPERIENCES;
  type: ExperienceType;
  duration: string;
  groupSize: {
    min: number;
    max: number;
  };
  includes: string[];
  requirements?: string[];
  ageRestriction?: {
    min: number;
    max?: number;
  };
}

export type UnifiedListing = PlaceListing | PeopleListing | ExperienceListing;

export class UnifiedListingSystem {
  private listings: Map<string, UnifiedListing> = new Map();

  /**
   * Create a new listing
   */
  async createListing(listingData: Omit<UnifiedListing, 'id' | 'createdAt' | 'updatedAt'>): Promise<UnifiedListing> {
    const id = this.generateId();
    const now = new Date();
    
    const listing: UnifiedListing = {
      ...listingData,
      id,
      createdAt: now,
      updatedAt: now,
      status: 'pending'
    } as UnifiedListing;

    this.listings.set(id, listing);
    
    // Trigger verification process
    await this.initiateVerification(listing);
    
    return listing;
  }

  /**
   * Update an existing listing
   */
  async updateListing(id: string, updates: Partial<UnifiedListing>): Promise<UnifiedListing | null> {
    const existing = this.listings.get(id);
    if (!existing) return null;

    const updated: UnifiedListing = {
      ...existing,
      ...updates,
      id: existing.id, // Prevent ID changes
      updatedAt: new Date()
    } as UnifiedListing;

    this.listings.set(id, updated);
    return updated;
  }

  /**
   * Get listing by ID
   */
  getListing(id: string): UnifiedListing | null {
    return this.listings.get(id) || null;
  }

  /**
   * Search listings with filters
   */
  searchListings(filters: {
    category?: ListingCategory;
    type?: string;
    location?: string;
    priceRange?: { min: number; max: number };
    tags?: string[];
    verified?: boolean;
    status?: string;
    limit?: number;
    offset?: number;
  }): UnifiedListing[] {
    let results = Array.from(this.listings.values());

    // Apply filters
    if (filters.category) {
      results = results.filter(listing => listing.category === filters.category);
    }

    if (filters.type) {
      results = results.filter(listing => listing.type === filters.type);
    }

    if (filters.location) {
      results = results.filter(listing => 
        listing.location?.city.toLowerCase().includes(filters.location!.toLowerCase()) ||
        listing.location?.country.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    if (filters.priceRange && filters.priceRange.min !== undefined && filters.priceRange.max !== undefined) {
      results = results.filter(listing => 
        listing.pricing && 
        listing.pricing.amount >= filters.priceRange!.min && 
        listing.pricing.amount <= filters.priceRange!.max
      );
    }

    if (filters.tags && filters.tags.length > 0) {
      results = results.filter(listing => 
        filters.tags!.some(tag => listing.tags.includes(tag))
      );
    }

    if (filters.verified !== undefined) {
      results = results.filter(listing => listing.verified === filters.verified);
    }

    if (filters.status) {
      results = results.filter(listing => listing.status === filters.status);
    }

    // Sort by rating and creation date
    results.sort((a, b) => {
      if (a.rating !== b.rating) return b.rating - a.rating;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    // Apply pagination
    const offset = filters.offset || 0;
    const limit = filters.limit || 20;
    return results.slice(offset, offset + limit);
  }

  /**
   * Delete a listing
   */
  async deleteListing(id: string): Promise<boolean> {
    return this.listings.delete(id);
  }

  /**
   * Get listings by owner
   */
  getListingsByOwner(ownerId: string): UnifiedListing[] {
    return Array.from(this.listings.values())
      .filter(listing => listing.ownerId === ownerId);
  }

  /**
   * Get featured listings
   */
  getFeaturedListings(category?: ListingCategory, limit: number = 10): UnifiedListing[] {
    let results = Array.from(this.listings.values())
      .filter(listing => listing.status === 'active' && listing.verified);

    if (category) {
      results = results.filter(listing => listing.category === category);
    }

    return results
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  /**
   * Generate unique ID for listings
   */
  private generateId(): string {
    return `listing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Initiate verification process for new listings
   */
  private async initiateVerification(listing: UnifiedListing): Promise<void> {
    // This would integrate with the verification system
    // For now, we'll simulate the process
    setTimeout(() => {
      const updated = this.listings.get(listing.id);
      if (updated) {
        updated.status = 'active';
        updated.verified = true;
        this.listings.set(listing.id, updated);
      }
    }, 1000);
  }
}

export const unifiedListingSystem = new UnifiedListingSystem();