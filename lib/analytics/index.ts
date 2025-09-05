import { Session } from 'next-auth';
import { prisma } from '@/lib/prisma';

export type ListingType = 'PROPERTY' | 'SERVICE' | 'LEISURE';

export interface ViewEvent {
  listingId: string;
  listingType: ListingType;
  userId?: string;
  sessionId: string;
  duration?: number;
  source?: string;
  medium?: string;
  campaign?: string;
  searchQuery?: string;
  filters?: Record<string, any>;
  deviceType: string;
  location?: {
    city?: string;
    region?: string;
    country?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
}

export interface SearchEvent {
  userId?: string;
  sessionId: string;
  query: string;
  filters: Record<string, any>;
  resultCount: number;
  category?: ListingType;
  location?: {
    city?: string;
    region?: string;
    country?: string;
    radius?: number;
  };
  deviceType: string;
  duration?: number;
}

export interface UserDemographics {
  userId: string;
  age?: number;
  gender?: string;
  interests?: string[];
  location?: {
    city?: string;
    region?: string;
    country?: string;
  };
  preferredCategories?: ListingType[];
  searchHistory?: string[];
  viewHistory?: string[];
  lastActive?: Date;
}

class AnalyticsService {
  // Track listing view
  async trackListingView(event: ViewEvent) {
    try {
      const view = await prisma.listingView.create({
        data: {
          listingId: event.listingId,
          listingType: event.listingType,
          userId: event.userId,
          sessionId: event.sessionId,
          duration: event.duration,
          source: event.source,
          medium: event.medium,
          campaign: event.campaign,
          searchQuery: event.searchQuery,
          filters: event.filters,
          deviceType: event.deviceType,
          city: event.location?.city,
          region: event.location?.region,
          country: event.location?.country,
          latitude: event.location?.coordinates?.latitude,
          longitude: event.location?.coordinates?.longitude,
          timestamp: new Date(),
        },
      });

      // Update listing view count
      await prisma.$transaction([
        prisma.listing.update({
          where: { id: event.listingId },
          data: {
            viewCount: { increment: 1 },
            lastViewed: new Date(),
          },
        }),
        // If user is logged in, update their view history
        event.userId ? prisma.user.update({
          where: { id: event.userId },
          data: {
            viewHistory: {
              push: event.listingId,
            },
            lastActive: new Date(),
          },
        }) : prisma.$queryRaw\`SELECT 1\`,
      ]);

      return view;
    } catch (error) {
      console.error('Error tracking listing view:', error);
      throw error;
    }
  }

  // Track search event
  async trackSearch(event: SearchEvent) {
    try {
      const search = await prisma.searchEvent.create({
        data: {
          userId: event.userId,
          sessionId: event.sessionId,
          query: event.query,
          filters: event.filters,
          resultCount: event.resultCount,
          category: event.category,
          city: event.location?.city,
          region: event.location?.region,
          country: event.location?.country,
          searchRadius: event.location?.radius,
          deviceType: event.deviceType,
          duration: event.duration,
          timestamp: new Date(),
        },
      });

      // Update user search history if logged in
      if (event.userId) {
        await prisma.user.update({
          where: { id: event.userId },
          data: {
            searchHistory: {
              push: event.query,
            },
            lastActive: new Date(),
          },
        });
      }

      return search;
    } catch (error) {
      console.error('Error tracking search:', error);
      throw error;
    }
  }

  // Update user demographics
  async updateUserDemographics(data: UserDemographics) {
    try {
      const user = await prisma.user.update({
        where: { id: data.userId },
        data: {
          age: data.age,
          gender: data.gender,
          interests: data.interests,
          city: data.location?.city,
          region: data.location?.region,
          country: data.location?.country,
          preferredCategories: data.preferredCategories,
          lastActive: new Date(),
        },
      });

      return user;
    } catch (error) {
      console.error('Error updating user demographics:', error);
      throw error;
    }
  }

  // Get listing analytics
  async getListingAnalytics(listingId: string, period: 'day' | 'week' | 'month' | 'year' = 'month') {
    try {
      const startDate = new Date();
      switch (period) {
        case 'day':
          startDate.setDate(startDate.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      const [
        views,
        uniqueVisitors,
        averageDuration,
        deviceBreakdown,
        locationBreakdown,
        searchTerms,
      ] = await Promise.all([
        // Total views
        prisma.listingView.count({
          where: {
            listingId,
            timestamp: { gte: startDate },
          },
        }),
        // Unique visitors
        prisma.listingView.groupBy({
          by: ['sessionId'],
          where: {
            listingId,
            timestamp: { gte: startDate },
          },
        }).then(result => result.length),
        // Average view duration
        prisma.listingView.aggregate({
          where: {
            listingId,
            timestamp: { gte: startDate },
            duration: { not: null },
          },
          _avg: {
            duration: true,
          },
        }),
        // Device breakdown
        prisma.listingView.groupBy({
          by: ['deviceType'],
          where: {
            listingId,
            timestamp: { gte: startDate },
          },
          _count: true,
        }),
        // Location breakdown
        prisma.listingView.groupBy({
          by: ['city', 'region', 'country'],
          where: {
            listingId,
            timestamp: { gte: startDate },
          },
          _count: true,
        }),
        // Search terms that led to views
        prisma.listingView.groupBy({
          by: ['searchQuery'],
          where: {
            listingId,
            timestamp: { gte: startDate },
            searchQuery: { not: null },
          },
          _count: true,
        }),
      ]);

      return {
        views,
        uniqueVisitors,
        averageDuration: averageDuration._avg.duration || 0,
        deviceBreakdown,
        locationBreakdown,
        searchTerms,
        period,
      };
    } catch (error) {
      console.error('Error getting listing analytics:', error);
      throw error;
    }
  }

  // Get user analytics for CRM
  async getUserAnalytics(userId: string) {
    try {
      const [
        viewHistory,
        searchHistory,
        preferences,
        demographics,
        engagement,
      ] = await Promise.all([
        // View history with details
        prisma.listingView.findMany({
          where: { userId },
          include: {
            listing: true,
          },
          orderBy: { timestamp: 'desc' },
          take: 50,
        }),
        // Search history
        prisma.searchEvent.findMany({
          where: { userId },
          orderBy: { timestamp: 'desc' },
          take: 50,
        }),
        // User preferences
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            preferredCategories: true,
            interests: true,
          },
        }),
        // Demographics
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            age: true,
            gender: true,
            city: true,
            region: true,
            country: true,
          },
        }),
        // Engagement metrics
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            lastActive: true,
            createdAt: true,
            _count: {
              select: {
                listings: true,
                bookings: true,
                reviews: true,
              },
            },
          },
        }),
      ]);

      return {
        viewHistory,
        searchHistory,
        preferences,
        demographics,
        engagement,
      };
    } catch (error) {
      console.error('Error getting user analytics:', error);
      throw error;
    }
  }

  // Get agent analytics
  async getAgentAnalytics(agentId: string, period: 'day' | 'week' | 'month' | 'year' = 'month') {
    try {
      const startDate = new Date();
      switch (period) {
        case 'day':
          startDate.setDate(startDate.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      const [
        listingViews,
        listingPerformance,
        inquiries,
        demographics,
        topSearchTerms,
      ] = await Promise.all([
        // Total views across all listings
        prisma.listingView.count({
          where: {
            listing: {
              userId: agentId,
            },
            timestamp: { gte: startDate },
          },
        }),
        // Performance by listing
        prisma.listing.findMany({
          where: {
            userId: agentId,
          },
          select: {
            id: true,
            title: true,
            viewCount: true,
            _count: {
              select: {
                inquiries: true,
                bookings: true,
              },
            },
          },
        }),
        // Inquiries received
        prisma.inquiry.findMany({
          where: {
            listing: {
              userId: agentId,
            },
            createdAt: { gte: startDate },
          },
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
            listing: {
              select: {
                title: true,
              },
            },
          },
        }),
        // Viewer demographics
        prisma.listingView.groupBy({
          by: ['city', 'region', 'country'],
          where: {
            listing: {
              userId: agentId,
            },
            timestamp: { gte: startDate },
          },
          _count: true,
        }),
        // Top search terms leading to views
        prisma.listingView.groupBy({
          by: ['searchQuery'],
          where: {
            listing: {
              userId: agentId,
            },
            timestamp: { gte: startDate },
            searchQuery: { not: null },
          },
          _count: true,
          orderBy: {
            _count: {
              searchQuery: 'desc',
            },
          },
          take: 10,
        }),
      ]);

      return {
        listingViews,
        listingPerformance,
        inquiries,
        demographics,
        topSearchTerms,
        period,
      };
    } catch (error) {
      console.error('Error getting agent analytics:', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();