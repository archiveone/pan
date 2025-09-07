import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://greia.ie'

  // Get all public properties
  const properties = await prisma.property.findMany({
    where: {
      status: 'ACTIVE',
      isVerified: true,
    },
    select: {
      id: true,
      updatedAt: true,
    },
  })

  // Get all public services
  const services = await prisma.service.findMany({
    where: {
      status: 'ACTIVE',
      paidUntil: {
        gt: new Date(),
      },
    },
    select: {
      id: true,
      updatedAt: true,
    },
  })

  // Get all public leisure listings
  const leisure = await prisma.leisure.findMany({
    where: {
      status: 'ACTIVE',
    },
    select: {
      id: true,
      updatedAt: true,
    },
  })

  // Static routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/properties`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/leisure`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/verification`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ] as MetadataRoute.Sitemap

  // Dynamic routes for properties
  const propertyRoutes = properties.map((property) => ({
    url: `${baseUrl}/properties/${property.id}`,
    lastModified: property.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  // Dynamic routes for services
  const serviceRoutes = services.map((service) => ({
    url: `${baseUrl}/services/${service.id}`,
    lastModified: service.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  // Dynamic routes for leisure
  const leisureRoutes = leisure.map((item) => ({
    url: `${baseUrl}/leisure/${item.id}`,
    lastModified: item.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  return [
    ...staticRoutes,
    ...propertyRoutes,
    ...serviceRoutes,
    ...leisureRoutes,
  ]
}