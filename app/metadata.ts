import { Metadata } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://greia.ie'

export const defaultMetadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'GREIA - Life\'s Operating System',
    template: '%s | GREIA',
  },
  description: 'GREIA is Ireland\'s premier platform for property listings, professional services, and leisure experiences. Find your next home, service provider, or experience.',
  keywords: [
    'property listings',
    'real estate ireland',
    'professional services',
    'leisure activities',
    'property management',
    'rental properties',
    'irish real estate',
    'property agents',
    'service providers',
  ],
  authors: [{ name: 'GREIA' }],
  creator: 'GREIA',
  publisher: 'GREIA',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IE',
    url: baseUrl,
    siteName: 'GREIA',
    title: 'GREIA - Life\'s Operating System',
    description: 'Ireland\'s premier platform for property listings, professional services, and leisure experiences.',
    images: [
      {
        url: `${baseUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'GREIA Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GREIA - Life\'s Operating System',
    description: 'Ireland\'s premier platform for property listings, professional services, and leisure experiences.',
    images: [`${baseUrl}/og-image.jpg`],
    creator: '@greia_ie',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
}

// Helper function to generate metadata for property listings
export function generatePropertyMetadata(property: any): Metadata {
  return {
    title: property.title,
    description: property.description,
    openGraph: {
      title: property.title,
      description: property.description,
      images: property.images?.map((img: string) => ({
        url: img,
        width: 1200,
        height: 630,
        alt: property.title,
      })) || [],
      type: 'article',
      locale: 'en_IE',
    },
    twitter: {
      card: 'summary_large_image',
      title: property.title,
      description: property.description,
      images: property.images || [],
    },
  }
}

// Helper function to generate metadata for service listings
export function generateServiceMetadata(service: any): Metadata {
  return {
    title: service.title,
    description: service.description,
    openGraph: {
      title: service.title,
      description: service.description,
      images: service.images?.map((img: string) => ({
        url: img,
        width: 1200,
        height: 630,
        alt: service.title,
      })) || [],
      type: 'article',
      locale: 'en_IE',
    },
    twitter: {
      card: 'summary_large_image',
      title: service.title,
      description: service.description,
      images: service.images || [],
    },
  }
}

// Helper function to generate metadata for leisure listings
export function generateLeisureMetadata(leisure: any): Metadata {
  return {
    title: leisure.title,
    description: leisure.description,
    openGraph: {
      title: leisure.title,
      description: leisure.description,
      images: leisure.images?.map((img: string) => ({
        url: img,
        width: 1200,
        height: 630,
        alt: leisure.title,
      })) || [],
      type: 'article',
      locale: 'en_IE',
    },
    twitter: {
      card: 'summary_large_image',
      title: leisure.title,
      description: leisure.description,
      images: leisure.images || [],
    },
  }
}