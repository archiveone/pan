import { validateS3Config } from '@/lib/storage/s3';

// Production configuration validation
export function validateProductionConfig() {
  const requiredEnvVars = [
    // Database
    'DATABASE_URL',
    
    // Authentication
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    
    // Stripe
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    
    // Email
    'RESEND_API_KEY',
    
    // Pusher
    'PUSHER_APP_ID',
    'PUSHER_KEY',
    'PUSHER_SECRET',
    'NEXT_PUBLIC_PUSHER_KEY',
    'NEXT_PUBLIC_PUSHER_CLUSTER',
    
    // App URLs
    'NEXT_PUBLIC_APP_URL',
    
    // Feature Flags
    'ENABLE_PROPERTY_SUBMISSIONS',
    'ENABLE_AGENT_VERIFICATION',
    'ENABLE_SERVICE_LISTINGS',
    'ENABLE_LEISURE_LISTINGS',
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  // Validate S3 configuration
  validateS3Config();

  // Validate database URL format
  const dbUrl = new URL(process.env.DATABASE_URL!);
  if (!dbUrl.protocol || !dbUrl.host || !dbUrl.pathname) {
    throw new Error('Invalid DATABASE_URL format');
  }

  // Validate app URL format
  const appUrl = new URL(process.env.NEXT_PUBLIC_APP_URL!);
  if (!appUrl.protocol || !appUrl.host) {
    throw new Error('Invalid NEXT_PUBLIC_APP_URL format');
  }

  // Validate Stripe keys format
  if (!process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_')) {
    throw new Error('Production requires live Stripe secret key');
  }
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_live_')) {
    throw new Error('Production requires live Stripe publishable key');
  }

  return true;
}

// Production feature flags
export const FEATURE_FLAGS = {
  PROPERTY_SUBMISSIONS: process.env.ENABLE_PROPERTY_SUBMISSIONS === 'true',
  AGENT_VERIFICATION: process.env.ENABLE_AGENT_VERIFICATION === 'true',
  SERVICE_LISTINGS: process.env.ENABLE_SERVICE_LISTINGS === 'true',
  LEISURE_LISTINGS: process.env.ENABLE_LEISURE_LISTINGS === 'true',
};

// Production constants
export const PRODUCTION_CONFIG = {
  // Rate limits
  RATE_LIMITS: {
    PROPERTY_CREATION: 10, // per day
    SERVICE_CREATION: 5,   // per day
    LEISURE_CREATION: 5,   // per day
    API_REQUESTS: 1000,    // per hour
  },

  // Cache durations (in seconds)
  CACHE_DURATIONS: {
    PROPERTY_LIST: 300,    // 5 minutes
    SERVICE_LIST: 300,     // 5 minutes
    LEISURE_LIST: 300,     // 5 minutes
    USER_PROFILE: 3600,    // 1 hour
    STATIC_PAGES: 86400,   // 24 hours
  },

  // Upload limits
  UPLOAD_LIMITS: {
    MAX_FILE_SIZE: 5 * 1024 * 1024,  // 5MB
    MAX_FILES_PER_LISTING: 10,
    ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  },

  // Security
  SECURITY: {
    MAX_LOGIN_ATTEMPTS: 5,
    LOGIN_BLOCK_DURATION: 900,  // 15 minutes
    PASSWORD_MIN_LENGTH: 12,
    REQUIRE_2FA: true,
  },

  // Email settings
  EMAIL: {
    FROM_ADDRESS: 'notifications@greia.ie',
    FROM_NAME: 'GREIA',
    SUPPORT_EMAIL: 'support@greia.ie',
  },
};

// Initialize production monitoring
export function initializeProductionMonitoring() {
  // Remove any development logs
  if (process.env.NODE_ENV === 'production') {
    console.log = () => {};
    console.debug = () => {};
  }

  // Validate production configuration
  validateProductionConfig();

  // Log successful initialization
  console.info('Production configuration validated successfully');
}