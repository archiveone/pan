'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Types
type ListingType = 'property' | 'service' | 'leisure' | 'connect';

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
    price?: number;
    
    // Property specific
    property?: {
      type: string;
      status: 'FOR_SALE' | 'FOR_RENT';
      bedrooms?: number;
      bathrooms?: number;
      size?: number;
      features: string[];
      specifications: Record<string, any>;
    };
    
    // Service specific
    service?: {
      category: string;
      expertise: string[];
      availability: string[];
      rateType: 'HOURLY' | 'FIXED' | 'PROJECT';
      rate: number;
    };
    
    // Leisure specific
    leisure?: {
      category: string;
      duration: string;
      groupSize?: number;
      included: string[];
      requirements: string[];
      availability: string[];
    };
    
    // Connect specific
    connect?: {
      category: string;
      privacy: 'PUBLIC' | 'PRIVATE' | 'INVITE';
      rules: string[];
      topics: string[];
    };
  };
  validation: {
    [key: string]: boolean;
  };
}

type Action =
  | { type: 'SET_TYPE'; payload: ListingType }
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SET_PROGRESS'; payload: number }
  | { type: 'UPDATE_DATA'; payload: Partial<ListingState['data']> }
  | { type: 'SET_VALIDATION'; payload: { [key: string]: boolean } }
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
  },
  validation: {},
};

// Reducer
function listingReducer(state: ListingState, action: Action): ListingState {
  switch (action.type) {
    case 'SET_TYPE':
      return {
        ...state,
        type: action.payload,
        progress: 10,
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
}

const ListingContext = createContext<ListingContextType | undefined>(undefined);

// Provider Component
interface ListingProviderProps {
  children: ReactNode;
}

export function ListingProvider({ children }: ListingProviderProps) {
  const [state, dispatch] = useReducer(listingReducer, initialState);

  const getTotalSteps = () => {
    switch (state.type) {
      case 'property':
        return 7; // Basic, Details, Features, Location, Photos, Price, Review
      case 'service':
        return 6; // Basic, Expertise, Availability, Photos, Pricing, Review
      case 'leisure':
        return 6; // Basic, Details, Requirements, Photos, Pricing, Review
      case 'connect':
        return 5; // Basic, Details, Rules, Photos, Review
      default:
        return 0;
    }
  };

  const nextStep = () => {
    const totalSteps = getTotalSteps();
    if (state.step < totalSteps) {
      dispatch({ type: 'SET_STEP', payload: state.step + 1 });
      dispatch({ 
        type: 'SET_PROGRESS', 
        payload: Math.round(((state.step + 1) / totalSteps) * 100) 
      });
    }
  };

  const prevStep = () => {
    if (state.step > 1) {
      dispatch({ type: 'SET_STEP', payload: state.step - 1 });
      dispatch({ 
        type: 'SET_PROGRESS', 
        payload: Math.round(((state.step - 1) / getTotalSteps()) * 100) 
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