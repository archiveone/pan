import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Reference site inspirations
const DESIGN_INSPIRATIONS = {
  GREIA_MVP: 'https://d4rent.github.io/greia-mvp/',
  AIRBNB: 'https://www.airbnb.com',
  STEVE_IVES: 'https://www.steve.io'
}

// Global styling configuration
export const GLOBAL_STYLES = {
  colors: {
    primary: {
      DEFAULT: '#0F172A',
      foreground: '#FFFFFF',
      hover: '#1E293B',
      muted: '#334155'
    },
    secondary: {
      DEFAULT: '#F8FAFC',
      foreground: '#0F172A',
      hover: '#F1F5F9',
      muted: '#E2E8F0'
    },
    accent: {
      DEFAULT: '#2563EB',
      foreground: '#FFFFFF',
      hover: '#1D4ED8',
      muted: '#BFDBFE'
    }
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    heading: {
      fontWeight: '600',
      lineHeight: '1.2'
    },
    body: {
      fontWeight: '400',
      lineHeight: '1.5'
    }
  },
  spacing: {
    container: {
      padding: '2rem',
      maxWidth: '1400px'
    }
  },
  animation: {
    default: '0.2s ease-in-out',
    slow: '0.3s ease-in-out',
    fast: '0.1s ease-in-out'
  }
}

// Page configurations with required components and layouts
export const PAGE_CONFIGS = {
  // Landing Page
  home: {
    path: '/',
    components: [
      'Hero',
      'Features',
      'PropertyShowcase',
      'ServicesGrid',
      'LeisureHighlights',
      'ConnectPreview',
      'CTASection'
    ],
    layout: 'MarketingLayout'
  },
  
  // Properties Section
  properties: {
    path: '/properties',
    components: [
      'PropertySearch',
      'PropertyFilters',
      'PropertyGrid',
      'PropertyMap',
      'SaveProperty'
    ],
    layout: 'DashboardLayout'
  },

  // Services Section
  services: {
    path: '/services',
    components: [
      'ServiceCategories',
      'ServiceSearch',
      'ServiceGrid',
      'ServiceFilters'
    ],
    layout: 'DashboardLayout'
  },

  // Leisure Section
  leisure: {
    path: '/leisure',
    components: [
      'LeisureCategories',
      'LeisureSearch',
      'LeisureGrid',
      'LeisureMap'
    ],
    layout: 'DashboardLayout'
  },

  // Connect Section
  connect: {
    path: '/connect',
    components: [
      'SocialFeed',
      'NetworkGrid',
      'MessageCenter',
      'ProfileCards'
    ],
    layout: 'DashboardLayout'
  },

  // Dashboard
  dashboard: {
    path: '/dashboard',
    components: [
      'StatCards',
      'ActivityFeed',
      'TaskManager',
      'Notifications',
      'QuickActions'
    ],
    layout: 'DashboardLayout'
  },

  // Profile
  profile: {
    path: '/profile',
    components: [
      'ProfileHeader',
      'ProfileDetails',
      'ListingManager',
      'ActivityLog'
    ],
    layout: 'DashboardLayout'
  },

  // Verification
  verification: {
    path: '/verification',
    components: [
      'VerificationStatus',
      'IdentityForm',
      'DocumentUpload',
      'VerificationSteps'
    ],
    layout: 'DashboardLayout'
  },

  // Messages
  messages: {
    path: '/messages',
    components: [
      'ConversationList',
      'MessageThread',
      'MessageComposer',
      'ContactInfo'
    ],
    layout: 'DashboardLayout'
  },

  // Settings
  settings: {
    path: '/settings',
    components: [
      'AccountSettings',
      'NotificationPreferences',
      'PrivacySettings',
      'BillingInfo'
    ],
    layout: 'DashboardLayout'
  },

  // Create Listing
  createListing: {
    path: '/create-listing',
    components: [
      'ListingForm',
      'MediaUpload',
      'LocationPicker',
      'PricingCalculator'
    ],
    layout: 'DashboardLayout'
  },

  // Private Marketplace
  privateMarketplace: {
    path: '/private-marketplace',
    components: [
      'SubmissionForm',
      'AgentList',
      'OfferManager',
      'PropertyDetails'
    ],
    layout: 'DashboardLayout'
  },

  // Valuation Marketplace
  valuationMarketplace: {
    path: '/valuation-marketplace',
    components: [
      'ValuationRequest',
      'ValuationOffers',
      'PaymentProcessor',
      'ReportViewer'
    ],
    layout: 'DashboardLayout'
  }
}

// Shared component configurations
export const SHARED_COMPONENTS = {
  navigation: {
    components: [
      'Navbar',
      'Sidebar',
      'MobileMenu',
      'SearchBar',
      'UserMenu'
    ]
  },
  layout: {
    components: [
      'MarketingLayout',
      'DashboardLayout',
      'AuthLayout'
    ]
  },
  forms: {
    components: [
      'Input',
      'Select',
      'Checkbox',
      'RadioGroup',
      'DatePicker',
      'FileUpload'
    ]
  },
  feedback: {
    components: [
      'Toast',
      'Alert',
      'Modal',
      'LoadingSpinner',
      'ProgressBar'
    ]
  }
}

// Animation configurations
export const ANIMATIONS = {
  pageTransition: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
  },
  listItem: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.2 }
  },
  modal: {
    overlay: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 }
    },
    content: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
      transition: { duration: 0.2 }
    }
  }
}

// Utility function for merging Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Responsive breakpoints
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
}

// Feature flags for progressive enhancement
export const FEATURE_FLAGS = {
  enableNewNavigation: true,
  enableAnimations: true,
  enableDarkMode: true,
  enableRealTimeUpdates: true,
  enableMapFeatures: true
}

// Backend integration points
export const API_ENDPOINTS = {
  auth: '/api/auth',
  properties: '/api/properties',
  services: '/api/services',
  leisure: '/api/leisure',
  connect: '/api/connect',
  messages: '/api/messages',
  verification: '/api/verification',
  valuation: '/api/valuation',
  privateMarketplace: '/api/private-marketplace'
}