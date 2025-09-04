export type ListingType = 'PROPERTY' | 'SERVICE' | 'LEISURE';

export type PropertyType = 
  | 'HOUSE'
  | 'APARTMENT'
  | 'CONDO'
  | 'VILLA'
  | 'LAND'
  | 'COMMERCIAL'
  | 'OFFICE'
  | 'RETAIL'
  | 'INDUSTRIAL';

export type ServiceType =
  | 'PLUMBER'
  | 'ELECTRICIAN'
  | 'CARPENTER'
  | 'PAINTER'
  | 'CLEANER'
  | 'GARDENER'
  | 'HANDYMAN'
  | 'MOVING'
  | 'PEST_CONTROL'
  | 'SECURITY'
  | 'INTERIOR_DESIGN'
  | 'ARCHITECT'
  | 'SURVEYOR'
  | 'LEGAL'
  | 'FINANCIAL';

export type LeisureType =
  | 'CAR_RENTAL'
  | 'BOAT_RENTAL'
  | 'VENUE_RENTAL'
  | 'EXPERIENCE'
  | 'TOUR'
  | 'EVENT'
  | 'DINING'
  | 'ACCOMMODATION'
  | 'SPORTS'
  | 'WELLNESS';

export type ListingStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'SOLD'
  | 'RENTED'
  | 'BOOKED'
  | 'EXPIRED'
  | 'REJECTED';

export type PropertyStatus =
  | 'FOR_SALE'
  | 'FOR_RENT'
  | 'SOLD'
  | 'RENTED'
  | 'OFF_MARKET';

export type ServiceAvailability =
  | 'AVAILABLE'
  | 'BUSY'
  | 'ON_LEAVE'
  | 'BY_APPOINTMENT';

export type LeisureAvailability =
  | 'AVAILABLE'
  | 'FULLY_BOOKED'
  | 'LIMITED'
  | 'SEASONAL'
  | 'MAINTENANCE';

export interface Location {
  address: string;
  city: string;
  state?: string;
  country: string;
  postcode: string;
  latitude?: number;
  longitude?: number;
}

export interface PriceInfo {
  amount: number;
  currency: string;
  period?: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
  negotiable?: boolean;
  minimumStay?: number;
}

export interface ListingMedia {
  id: string;
  url: string;
  type: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  title?: string;
  description?: string;
  isPrimary?: boolean;
  order: number;
}

export interface BaseListing {
  id: string;
  type: ListingType;
  title: string;
  description: string;
  status: ListingStatus;
  location: Location;
  price: PriceInfo;
  media: ListingMedia[];
  features: string[];
  amenities: string[];
  rules?: string[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  expiresAt?: Date;
  userId: string;
  verified: boolean;
  featured: boolean;
  views: number;
  saves: number;
  rating?: number;
  reviews?: number;
}

export interface PropertyListing extends BaseListing {
  type: 'PROPERTY';
  propertyType: PropertyType;
  propertyStatus: PropertyStatus;
  size: {
    total: number;
    unit: 'sqft' | 'sqm';
  };
  rooms: {
    bedrooms: number;
    bathrooms: number;
    parking?: number;
    total?: number;
  };
  yearBuilt?: number;
  furnished: boolean;
  pets?: boolean;
  utilities?: boolean;
  availableFrom?: Date;
  minimumTerm?: number;
  maximumTerm?: number;
  deposit?: number;
  agentId?: string;
  virtualTour?: string;
  floorPlan?: string;
  energyRating?: string;
}

export interface ServiceListing extends BaseListing {
  type: 'SERVICE';
  serviceType: ServiceType;
  availability: ServiceAvailability;
  experience: number;
  qualifications?: string[];
  insurance?: boolean;
  coverage: {
    radius: number;
    unit: 'km' | 'miles';
  };
  response?: {
    time: number;
    unit: 'minutes' | 'hours' | 'days';
  };
  workingHours?: {
    [key: string]: {
      open: string;
      close: string;
    };
  };
  emergencyService?: boolean;
  minimumCharge?: number;
  callOutFee?: number;
}

export interface LeisureListing extends BaseListing {
  type: 'LEISURE';
  leisureType: LeisureType;
  availability: LeisureAvailability;
  capacity?: {
    minimum: number;
    maximum: number;
  };
  duration?: {
    value: number;
    unit: 'minutes' | 'hours' | 'days';
  };
  schedule?: {
    [key: string]: {
      slots: {
        start: string;
        end: string;
        available: boolean;
      }[];
    };
  };
  cancellation?: {
    allowed: boolean;
    deadline?: number;
    refund?: number;
  };
  requirements?: string[];
  included?: string[];
  excluded?: string[];
  seasonal?: {
    start: Date;
    end: Date;
  };
}