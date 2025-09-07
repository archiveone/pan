import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://greia.ie'

  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/properties',
        '/services',
        '/leisure',
        '/about',
        '/contact',
      ],
      disallow: [
        '/dashboard',
        '/api',
        '/admin',
        '/verification',
        '/create-listing',
        '/properties/create',
        '/properties/edit',
        '/*.json',
        '/*?*', // Disallow URL parameters for cleaner indexing
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}