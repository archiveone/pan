import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getDistance } from 'geolib';

export class PropertyService {
  async searchProperties(params: any) {
    const {
      type,
      listingType,
      minPrice,
      maxPrice,
      minBedrooms,
      maxBedrooms,
      minBathrooms,
      maxBathrooms,
      minSize,
      maxSize,
      features,
      energyRating,
      location,
      radius,
      isVerified,
      sortBy,
      page = 1,
      limit = 10,
    } = params;

    // Build where clause
    const where: Prisma.PropertyWhereInput = {
      AND: [
        type ? { type } : {},
        listingType ? { listingType } : {},
        minPrice ? { price: { gte: minPrice } } : {},
        maxPrice ? { price: { lte: maxPrice } } : {},
        minBedrooms ? { bedrooms: { gte: minBedrooms } } : {},
        maxBedrooms ? { bedrooms: { lte: maxBedrooms } } : {},
        minBathrooms ? { bathrooms: { gte: minBathrooms } } : {},
        maxBathrooms ? { bathrooms: { lte: maxBathrooms } } : {},
        minSize ? { size: { gte: minSize } } : {},
        maxSize ? { size: { lte: maxSize } } : {},
        features ? { features: { hasEvery: features } } : {},
        energyRating ? { energyRating } : {},
        isVerified ? { isVerified } : {},
        { status: 'ACTIVE' },
      ],
    };

    // Handle location-based search
    if (location && radius) {
      // Get coordinates for the search location using a geocoding service
      const coordinates = await this.getCoordinates(location);
      if (coordinates) {
        const propertiesWithinRadius = await this.findPropertiesWithinRadius(
          coordinates,
          radius
        );
        where.id = { in: propertiesWithinRadius };
      }
    }

    // Build orderBy
    let orderBy: Prisma.PropertyOrderByWithRelationInput = { createdAt: 'desc' };
    if (sortBy) {
      switch (sortBy) {
        case 'price_asc':
          orderBy = { price: 'asc' };
          break;
        case 'price_desc':
          orderBy = { price: 'desc' };
          break;
        case 'date_asc':
          orderBy = { createdAt: 'asc' };
          break;
        case 'date_desc':
          orderBy = { createdAt: 'desc' };
          break;
        case 'size_asc':
          orderBy = { size: 'asc' };
          break;
        case 'size_desc':
          orderBy = { size: 'desc' };
          break;
      }
    }

    // Execute query
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          images: true,
          documents: true,
          reviews: {
            include: {
              user: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
          },
          _count: {
            select: {
              favorites: true,
              viewings: true,
              offers: true,
              reviews: true,
            },
          },
        },
      }),
      prisma.property.count({ where }),
    ]);

    return {
      properties,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    };
  }

  async createProperty(data: any) {
    const {
      address,
      images,
      documents,
      features,
      ...propertyData
    } = data;

    // Get coordinates for the address if not provided
    if (!address.latitude || !address.longitude) {
      const coordinates = await this.getCoordinates(
        `${address.street}, ${address.city}, ${address.country}`
      );
      if (coordinates) {
        address.latitude = coordinates.latitude;
        address.longitude = coordinates.longitude;
      }
    }

    return prisma.property.create({
      data: {
        ...propertyData,
        address: {
          create: address,
        },
        images: images ? {
          createMany: {
            data: images,
          },
        } : undefined,
        documents: documents ? {
          createMany: {
            data: documents,
          },
        } : undefined,
        features: features ? {
          set: features,
        } : undefined,
      },
      include: {
        images: true,
        documents: true,
      },
    });
  }

  async updateProperty(id: string, data: any) {
    const {
      address,
      images,
      documents,
      features,
      ...propertyData
    } = data;

    // Update address if provided
    if (address) {
      if (!address.latitude || !address.longitude) {
        const coordinates = await this.getCoordinates(
          `${address.street}, ${address.city}, ${address.country}`
        );
        if (coordinates) {
          address.latitude = coordinates.latitude;
          address.longitude = coordinates.longitude;
        }
      }

      await prisma.address.update({
        where: { propertyId: id },
        data: address,
      });
    }

    // Update images if provided
    if (images) {
      await prisma.propertyImage.deleteMany({
        where: { propertyId: id },
      });
      await prisma.propertyImage.createMany({
        data: images.map((image: any) => ({
          ...image,
          propertyId: id,
        })),
      });
    }

    // Update documents if provided
    if (documents) {
      await prisma.propertyDocument.deleteMany({
        where: { propertyId: id },
      });
      await prisma.propertyDocument.createMany({
        data: documents.map((doc: any) => ({
          ...doc,
          propertyId: id,
        })),
      });
    }

    return prisma.property.update({
      where: { id },
      data: {
        ...propertyData,
        features: features ? {
          set: features,
        } : undefined,
      },
      include: {
        images: true,
        documents: true,
      },
    });
  }

  async deleteProperty(id: string, userId: string) {
    // Check if user owns the property
    const property = await prisma.property.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!property) {
      throw new Error('Property not found or unauthorized');
    }

    // Delete related records
    await Promise.all([
      prisma.propertyImage.deleteMany({
        where: { propertyId: id },
      }),
      prisma.propertyDocument.deleteMany({
        where: { propertyId: id },
      }),
      prisma.address.delete({
        where: { propertyId: id },
      }),
    ]);

    // Delete the property
    return prisma.property.delete({
      where: { id },
    });
  }

  private async getCoordinates(address: string) {
    try {
      // Implement geocoding using your preferred service (Google Maps, Mapbox, etc.)
      // For now, returning null as placeholder
      return null;
    } catch (error) {
      console.error('Error getting coordinates:', error);
      return null;
    }
  }

  private async findPropertiesWithinRadius(
    center: { latitude: number; longitude: number },
    radiusKm: number
  ) {
    // Get all properties with coordinates
    const properties = await prisma.property.findMany({
      select: {
        id: true,
        address: {
          select: {
            latitude: true,
            longitude: true,
          },
        },
      },
      where: {
        address: {
          latitude: { not: null },
          longitude: { not: null },
        },
      },
    });

    // Filter properties within radius
    const propertiesWithinRadius = properties.filter((property) => {
      if (!property.address?.latitude || !property.address?.longitude) return false;

      const distance = getDistance(
        { latitude: center.latitude, longitude: center.longitude },
        { latitude: property.address.latitude, longitude: property.address.longitude }
      );

      return distance <= radiusKm * 1000; // Convert km to meters
    });

    return propertiesWithinRadius.map((p) => p.id);
  }

  // Analytics methods
  async getPropertyAnalytics(propertyId: string) {
    const [
      property,
      viewings,
      offers,
      reviews,
      favorites,
    ] = await Promise.all([
      prisma.property.findUnique({
        where: { id: propertyId },
        include: {
          _count: {
            select: {
              viewings: true,
              offers: true,
              reviews: true,
              favorites: true,
            },
          },
        },
      }),
      prisma.propertyViewing.findMany({
        where: { propertyId },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.propertyOffer.findMany({
        where: { propertyId },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.propertyReview.findMany({
        where: { propertyId },
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      }),
      prisma.propertyFavorite.count({
        where: { propertyId },
      }),
    ]);

    if (!property) throw new Error('Property not found');

    // Calculate average rating
    const averageRating = reviews.length
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
      : 0;

    // Group viewings by month
    const viewingsByMonth = this.groupByMonth(viewings);

    // Group offers by month with average amount
    const offersByMonth = this.groupByMonth(offers, (group) => ({
      count: group.length,
      averageAmount: group.reduce((acc, offer) => acc + offer.amount, 0) / group.length,
    }));

    return {
      property,
      stats: {
        totalViews: property._count.viewings,
        totalOffers: property._count.offers,
        totalReviews: property._count.reviews,
        totalFavorites: favorites,
        averageRating,
      },
      viewingStats: viewingsByMonth,
      offerStats: offersByMonth,
      reviews,
    };
  }

  private groupByMonth<T extends { createdAt: Date }>(
    items: T[],
    reducer: (group: T[]) => any = (group) => group.length
  ) {
    const groups = items.reduce((acc, item) => {
      const month = item.createdAt.toISOString().slice(0, 7); // YYYY-MM
      if (!acc[month]) acc[month] = [];
      acc[month].push(item);
      return acc;
    }, {} as Record<string, T[]>);

    return Object.entries(groups).map(([month, group]) => ({
      month,
      ...reducer(group),
    }));
  }
}