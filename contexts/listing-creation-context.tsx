'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Types
type ListingType = 'property' | 'service' | 'leisure' | 'connect';
type PaymentType = 'fixed' | 'hourly' | 'project' | 'subscription';
type BookingType = 'instant' | 'request' | 'quote';
type AvailabilityType = 'always' | 'schedule' | 'dates' | 'custom';

interface ListingState {
  step: number;
  type: ListingType | null;
  progress: number;
  data: {
    // Common fields
    title: string;
    description: string;
    images: string[];
    location: string;
    category: string;
    
    // Property specific
    property?: {
      type: string;
      status: 'FOR_SALE' | 'FOR_RENT';
      bedrooms?: number;
      bathrooms?: number;
      size?: number;
      features: string[];
      specifications: Record<string, any>;
      price: number;
      paymentType: 'full' | 'mortgage' | 'installment';
      depositRequired?: boolean;
      depositAmount?: number;
    };
    
    // Service specific
    service?: {
      expertise: string[];
      experience: number;
      qualifications: string[];
      availability: {
        type: AvailabilityType;
        schedule?: Record<string, any>;
        customHours?: Record<string, any>;
      };
      pricing: {
        type: PaymentType;
        rate: number;
        minimumHours?: number;
        packages?: Array<{
          name: string;
          description: string;
          price: number;
          duration?: string;
        }>;
      };
      bookingType: BookingType;
      instantBooking?: {
        enabled: boolean;
        minNotice: number;
        maxAdvance: number;
      };
      insurance?: {
        type: string;
        provider: string;
        coverage: number;
      };
    };
    
    // Leisure specific
    leisure?: {
      type: 'rental' | 'experience' | 'event';
      duration: string;
      groupSize: {
        min: number;
        max: number;
      };
      included: string[];
      requirements: string[];
      availability: {
        type: AvailabilityType;
        dates?: {
          start: string;
          end: string;
        };
        schedule?: Record<string, any>;
      };
      pricing: {
        type: 'per_person' | 'per_group' | 'per_hour' | 'fixed';
        basePrice: number;
        discounts?: {
          group?: number;
          early?: number;
          lastMinute?: number;
        };
      };
      bookingType: BookingType;
      cancellation: {
        policy: 'flexible' | 'moderate' | 'strict';
        refundPercentage: number;
        deadline: number;
      };
    };
    
    // Connect specific
    connect?: {
      type: 'group' | 'community' | 'event' | 'club';
      privacy: 'PUBLIC' | 'PRIVATE' | 'INVITE';
      membership: {
        type: 'free' | 'paid' | 'application';
        fee?: number;
        interval?: 'monthly' | 'yearly' | 'one_time';
        benefits: string[];
      };
      rules: string[];
      topics: string[];
      events?: {
        enabled: boolean;
        types: string[];
        pricing?: {
          type: 'free' | 'paid' | 'mixed';
          defaultPrice?: number;
        };
      };
      communication: {
        channels: ('chat' | 'forum' | 'video' | 'email')[];
        moderation: 'auto' | 'manual' | 'community';
      };
    };
  };
  validation: {
    [key: string]: boolean;
  };
  flow: {
    currentSection: string;
    completedSections: string[];
    availableSections: string[];
    branchingPath: string[];
  };
}

type Action =
  | { type: 'SET_TYPE'; payload: ListingType }
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SET_PROGRESS'; payload: number }
  | { type: 'UPDATE_DATA'; payload: Partial<ListingState['data']> }
  | { type: 'SET_VALIDATION'; payload: { [key: string]: boolean } }
  | { type: 'UPDATE_FLOW'; payload: Partial<ListingState['flow']> }
  | { type: 'RESET' };

const initialState: ListingState = {
  step: 1,
  type: null,
  progress: 0,
  data: {
    title: '',
    description: '',
    images: [],
    location: '',
    category: '',
  },
  validation: {},
  flow: {
    currentSection: 'type',
    completedSections: [],
    availableSections: ['type'],
    branchingPath: [],
  },
};

// Flow Configuration
const flowConfig = {
  property: {
    sections: [
      'type',
      'basics',
      'details',
      'features',
      'images',
      'pricing',
      'payment',
      'review',
    ],
    branches: {
      'FOR_SALE': ['mortgage', 'full'],
      'FOR_RENT': ['deposit', 'schedule'],
    },
  },
  service: {
    sections: [
      'type',
      'basics',
      'expertise',
      'availability',
      'images',
      'pricing',
      'booking',
      'insurance',
      'review',
    ],
    branches: {
      'instant': ['schedule', 'requirements'],
      'request': ['quote', 'terms'],
      'quote': ['response', 'negotiation'],
    },
  },
  leisure: {
    sections: [
      'type',
      'basics',
      'details',
      'requirements',
      'images',
      'availability',
      'pricing',
      'booking',
      'cancellation',
      'review',
    ],
    branches: {
      'rental': ['duration', 'deposit'],
      'experience': ['group', 'individual'],
      'event': ['recurring', 'one-time'],
    },
  },
  connect: {
    sections: [
      'type',
      'basics',
      'details',
      'membership',
      'images',
      'rules',
      'communication',
      'events',
      'review',
    ],
    branches: {
      'free': ['moderation', 'features'],
      'paid': ['pricing', 'benefits'],
      'application': ['process', 'approval'],
    },
  },
};

// Reducer
function listingReducer(state: ListingState, action: Action): ListingState {
  switch (action.type) {
    case 'SET_TYPE':
      const type = action.payload;
      return {
        ...state,
        type,
        progress: 10,
        flow: {
          ...state.flow,
          availableSections: flowConfig[type].sections,
          currentSection: flowConfig[type].sections[0],
          branchingPath: [],
        },
      };
    
    case 'SET_STEP':
      return {
        ...state,
        step: action.payload,
      };
    
    case 'SET_PROGRESS':
      return {
        ...state,
        progress: action.payload,
      };
    
    case 'UPDATE_DATA':
      return {
        ...state,
        data: {
          ...state.data,
          ...action.payload,
        },
      };
    
    case 'SET_VALIDATION':
      return {
        ...state,
        validation: {
          ...state.validation,
          ...action.payload,
        },
      };
    
    case 'UPDATE_FLOW':
      return {
        ...state,
        flow: {
          ...state.flow,
          ...action.payload,
        },
      };
    
    case 'RESET':
      return initialState;
    
    default:
      return state;
  }
}

// Context
interface ListingContextType {
  state: ListingState;
  dispatch: React.Dispatch<Action>;
  nextStep: () => void;
  prevStep: () => void;
  updateData: (data: Partial<ListingState['data']>) => void;
  validateStep: () => boolean;
  isStepValid: (step: number) => boolean;
  getTotalSteps: () => number;
  getNextSection: () => string;
  getBranchingOptions: () => string[];
  selectBranch: (branch: string) => void;
}

const ListingContext = createContext<ListingContextType | undefined>(undefined);

// Provider Component
interface ListingProviderProps {
  children: ReactNode;
}

export function ListingProvider({ children }: ListingProviderProps) {
  const [state, dispatch] = useReducer(listingReducer, initialState);

  const getTotalSteps = () => {
    if (!state.type) return 0;
    return flowConfig[state.type].sections.length + 
      (state.flow.branchingPath?.length || 0);
  };

  const getNextSection = () => {
    const { type, flow } = state;
    if (!type) return '';

    const sections = flowConfig[type].sections;
    const currentIndex = sections.indexOf(flow.currentSection);
    
    // Check if there's a branch to follow
    if (flow.branchingPath.length > 0) {
      const branchIndex = flow.completedSections.length - sections.length;
      return flow.branchingPath[branchIndex] || sections[currentIndex + 1];
    }

    return sections[currentIndex + 1];
  };

  const getBranchingOptions = () => {
    const { type, data } = state;
    if (!type) return [];

    switch (type) {
      case 'property':
        return flowConfig.property.branches[data.property?.status || ''] || [];
      case 'service':
        return flowConfig.service.branches[data.service?.bookingType || ''] || [];
      case 'leisure':
        return flowConfig.leisure.branches[data.leisure?.type || ''] || [];
      case 'connect':
        return flowConfig.connect.branches[data.connect?.membership.type || ''] || [];
      default:
        return [];
    }
  };

  const selectBranch = (branch: string) => {
    dispatch({
      type: 'UPDATE_FLOW',
      payload: {
        branchingPath: [...state.flow.branchingPath, branch],
      },
    });
  };

  const nextStep = () => {
    const nextSection = getNextSection();
    if (nextSection) {
      dispatch({
        type: 'UPDATE_FLOW',
        payload: {
          currentSection: nextSection,
          completedSections: [...state.flow.completedSections, state.flow.currentSection],
        },
      });
      dispatch({
        type: 'SET_PROGRESS',
        payload: Math.round(
          (state.flow.completedSections.length + 1) / getTotalSteps() * 100
        ),
      });
    }
  };

  const prevStep = () => {
    const { flow } = state;
    const prevSection = flow.completedSections[flow.completedSections.length - 1];
    
    if (prevSection) {
      dispatch({
        type: 'UPDATE_FLOW',
        payload: {
          currentSection: prevSection,
          completedSections: flow.completedSections.slice(0, -1),
          branchingPath: flow.branchingPath.slice(0, -1),
        },
      });
      dispatch({
        type: 'SET_PROGRESS',
        payload: Math.round(
          (flow.completedSections.length - 1) / getTotalSteps() * 100
        ),
      });
    }
  };

  const updateData = (data: Partial<ListingState['data']>) => {
    dispatch({ type: 'UPDATE_DATA', payload: data });
  };

  const validateStep = () => {
    // Implement step-specific validation logic
    const isValid = true; // Replace with actual validation
    dispatch({ 
      type: 'SET_VALIDATION', 
      payload: { [state.step]: isValid } 
    });
    return isValid;
  };

  const isStepValid = (step: number) => {
    return state.validation[step] || false;
  };

  const value = {
    state,
    dispatch,
    nextStep,
    prevStep,
    updateData,
    validateStep,
    isStepValid,
    getTotalSteps,
    getNextSection,
    getBranchingOptions,
    selectBranch,
  };

  return (
    <ListingContext.Provider value={value}>
      {children}
    </ListingContext.Provider>
  );
}

// Custom Hook
export function useListingCreation() {
  const context = useContext(ListingContext);
  if (context === undefined) {
    throw new Error('useListingCreation must be used within a ListingProvider');
  }
  return context;
}