import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { PropertyCreateInput, PropertyUpdateInput, PropertySearchParams } from '@/lib/types/property';

export class PropertyService {
  /**
   * Create a new property listing
   */
  async createProperty(data: PropertyCreateInput) {
    const property = await prisma.property.create({
      data: {
        ...data,
        features: {
          connect: data.featureIds?.map(id => ({ id })) || [],
        },
        images: {
          create: data.images?.map((image, index) => ({
            ...image,
            order: index,
          })) || [],
        },
        documents: {
          create: data.documents || [],
        },
      },
      include: {
        features: true,
        images: true,
        documents: true,
        address: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        agent: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return property;
  }

  /**
   * Update an existing property
   */
  async updateProperty(id: string, data: PropertyUpdateInput) {
    const property = await prisma.property.update({
      where: { id },
      data: {
        ...data,
        features: data.featureIds ? {
          set: data.featureIds.map(id => ({ id })),
        } : undefined,
        images: data.images ? {
          deleteMany: {},
          create: data.images.map((image, index) => ({
            ...image,
            order: index,
          })),
        } : undefined,
        documents: data.documents ? {
          deleteMany: {},
          create: data.documents,
        } : undefined,
      },
      include: {
        features: true,
        images: true,
        documents: true,
        address: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        agent: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return property;
  }

  /**
   * Delete a property
   */
  async deleteProperty(id: string) {
    await prisma.property.delete({
      where: { id },
    });
  }

  /**
   * Get a property by ID
   */
  async getProperty(id: string) {
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        features: true,
        images: {
          orderBy: { order: 'asc' },
        },
        documents: true,
        address: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        agent: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            favorites: true,
            viewings: true,
            offers: true,
          },
        },
      },
    });

    return property;
  }

  /**
   * Search properties with filters
   */
  async searchProperties(params: PropertySearchParams) {
    const {
      type,
      listingType,
      status,
      minPrice,
      maxPrice,
      minBedrooms,
      maxBedrooms,
      minBathrooms,
      maxBathrooms,
      features,
      location,
      radius,
      sortBy,
      sortOrder,
      page = 1,
      limit = 10,
      includePrivate = false,
      agentId,
      ownerId,
    } = params;

    const where: Prisma.PropertyWhereInput = {
      type: type,
      listingType: listingType,
      status: status || 'AVAILABLE',
      isPrivate: includePrivate ? undefined : false,
      price: {
        gte: minPrice,
        lte: maxPrice,
      },
      bedrooms: {
        gte: minBedrooms,
        lte: maxBedrooms,
      },
      bathrooms: {
        gte: minBathrooms,
        lte: maxBathrooms,
      },
      features: features?.length ? {
        some: {
          id: { in: features },
        },
      } : undefined,
      agentId: agentId,
      ownerId: ownerId,
    };

    // Add location-based search if coordinates provided
    if (location?.latitude && location?.longitude && radius) {
      where.address = {
        latitude: {
          gte: location.latitude - radius,
          lte: location.latitude + radius,
        },
        longitude: {
          gte: location.longitude - radius,
          lte: location.longitude + radius,
        },
      };
    }

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          features: true,
          images: {
            orderBy: { order: 'asc' },
            take: 1,
          },
          address: true,
          owner: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          agent: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              favorites: true,
              reviews: true,
            },
          },
        },
        orderBy: sortBy ? {
          [sortBy]: sortOrder || 'desc',
        } : {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.property.count({ where }),
    ]);

    return {
      properties,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get featured properties
   */
  async getFeaturedProperties(limit = 6) {
    const properties = await prisma.property.findMany({
      where: {
        status: 'AVAILABLE',
        isPrivate: false,
      },
      include: {
        images: {
          orderBy: { order: 'asc' },
          take: 1,
        },
        address: true,
        _count: {
          select: {
            favorites: true,
            reviews: true,
          },
        },
      },
      orderBy: [
        { isVerified: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    });

    return properties;
  }

  /**
   * Get similar properties
   */
  async getSimilarProperties(propertyId: string, limit = 4) {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        type: true,
        listingType: true,
        price: true,
        bedrooms: true,
        address: {
          select: {
            latitude: true,
            longitude: true,
          },
        },
      },
    });

    if (!property) return [];

    const similarProperties = await prisma.property.findMany({
      where: {
        id: { not: propertyId },
        status: 'AVAILABLE',
        isPrivate: false,
        type: property.type,
        listingType: property.listingType,
        price: {
          gte: property.price * BigInt(0.8),
          lte: property.price * BigInt(1.2),
        },
        bedrooms: property.bedrooms ? {
          gte: property.bedrooms - 1,
          lte: property.bedrooms + 1,
        } : undefined,
        address: property.address ? {
          latitude: {
            gte: property.address.latitude - 0.1,
            lte: property.address.latitude + 0.1,
          },
          longitude: {
            gte: property.address.longitude - 0.1,
            lte: property.address.longitude + 0.1,
          },
        } : undefined,
      },
      include: {
        images: {
          orderBy: { order: 'asc' },
          take: 1,
        },
        address: true,
        _count: {
          select: {
            favorites: true,
            reviews: true,
          },
        },
      },
      take: limit,
    });

    return similarProperties;
  }

  /**
   * Toggle property favorite status for a user
   */
  async toggleFavorite(propertyId: string, userId: string) {
    const favorite = await prisma.favorite.findUnique({
      where: {
        propertyId_userId: {
          propertyId,
          userId,
        },
      },
    });

    if (favorite) {
      await prisma.favorite.delete({
        where: { id: favorite.id },
      });
      return false;
    } else {
      await prisma.favorite.create({
        data: {
          propertyId,
          userId,
        },
      });
      return true;
    }
  }

  /**
   * Schedule a property viewing
   */
  async scheduleViewing(propertyId: string, userId: string, datetime: Date, notes?: string) {
    const viewing = await prisma.viewing.create({
      data: {
        propertyId,
        userId,
        datetime,
        notes,
        status: 'pending',
      },
      include: {
        property: {
          include: {
            address: true,
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            agent: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // TODO: Send notifications to property owner/agent and user

    return viewing;
  }

  /**
   * Submit an offer for a property
   */
  async submitOffer(propertyId: string, userId: string, amount: number, message?: string, validUntil?: Date) {
    const offer = await prisma.offer.create({
      data: {
        propertyId,
        userId,
        amount,
        message,
        validUntil,
        status: 'pending',
      },
      include: {
        property: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            agent: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // TODO: Send notifications to property owner/agent and user

    return offer;
  }

  /**
   * Request a property valuation
   */
  async requestValuation(propertyId: string, agentId: string, notes?: string) {
    const valuation = await prisma.valuation.create({
      data: {
        propertyId,
        agentId,
        notes,
        amount: 0, // Will be updated by agent later
      },
      include: {
        property: true,
        agent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // TODO: Send notifications to agent

    return valuation;
  }
}