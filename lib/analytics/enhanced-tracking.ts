import { analyticsService } from './index';
import { prisma } from '@/lib/prisma';
import type { ListingType } from './index';

interface EnhancedTrackingEvent extends Record<string, any> {
  userId?: string;
  sessionId: string;
  timestamp: Date;
  eventType: string;
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

interface CRMEvent {
  userId?: string;
  listingId?: string;
  listingType?: ListingType;
  eventType: 'VIEW' | 'INQUIRY' | 'BOOKING' | 'MESSAGE' | 'FAVORITE' | 'SHARE';
  status: 'NEW' | 'IN_PROGRESS' | 'FOLLOW_UP' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  assignedTo?: string;
  dueDate?: Date;
  notes?: string;
}

class EnhancedAnalyticsTracker {
  // Track user navigation
  async trackNavigation(event: EnhancedTrackingEvent) {
    try {
      await prisma.analyticsEvent.create({
        data: {
          userId: event.userId,
          sessionId: event.sessionId,
          eventType: 'NAVIGATION',
          path: event.path,
          referrer: event.referrer,
          deviceType: event.deviceType,
          timestamp: event.timestamp,
          city: event.location?.city,
          region: event.location?.region,
          country: event.location?.country,
          metadata: event,
        },
      });
    } catch (error) {
      console.error('Error tracking navigation:', error);
    }
  }

  // Track user interactions
  async trackInteraction(event: EnhancedTrackingEvent) {
    try {
      await prisma.analyticsEvent.create({
        data: {
          userId: event.userId,
          sessionId: event.sessionId,
          eventType: 'INTERACTION',
          interactionType: event.interactionType,
          elementId: event.elementId,
          deviceType: event.deviceType,
          timestamp: event.timestamp,
          city: event.location?.city,
          region: event.location?.region,
          country: event.location?.country,
          metadata: event,
        },
      });
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  }

  // Track search behavior
  async trackSearch(event: EnhancedTrackingEvent) {
    try {
      await prisma.analyticsEvent.create({
        data: {
          userId: event.userId,
          sessionId: event.sessionId,
          eventType: 'SEARCH',
          searchQuery: event.query,
          filters: event.filters,
          resultCount: event.resultCount,
          category: event.category,
          deviceType: event.deviceType,
          timestamp: event.timestamp,
          city: event.location?.city,
          region: event.location?.region,
          country: event.location?.country,
          metadata: event,
        },
      });
    } catch (error) {
      console.error('Error tracking search:', error);
    }
  }

  // Track CRM events and create Kanban cards
  async trackCRMEvent(event: CRMEvent) {
    try {
      // Create analytics event
      await prisma.analyticsEvent.create({
        data: {
          userId: event.userId,
          eventType: 'CRM',
          timestamp: new Date(),
          metadata: event,
        },
      });

      // Create or update Kanban card
      const kanbanCard = await prisma.kanbanCard.upsert({
        where: {
          uniqueConstraint: {
            userId: event.userId || '',
            listingId: event.listingId || '',
            eventType: event.eventType,
          },
        },
        update: {
          status: event.status,
          priority: event.priority,
          assignedTo: event.assignedTo,
          dueDate: event.dueDate,
          notes: event.notes,
          lastUpdated: new Date(),
        },
        create: {
          userId: event.userId,
          listingId: event.listingId,
          listingType: event.listingType,
          eventType: event.eventType,
          status: event.status,
          priority: event.priority,
          assignedTo: event.assignedTo,
          dueDate: event.dueDate,
          notes: event.notes,
          createdAt: new Date(),
          lastUpdated: new Date(),
        },
      });

      return kanbanCard;
    } catch (error) {
      console.error('Error tracking CRM event:', error);
    }
  }

  // Track user engagement metrics
  async trackEngagement(event: EnhancedTrackingEvent) {
    try {
      await prisma.analyticsEvent.create({
        data: {
          userId: event.userId,
          sessionId: event.sessionId,
          eventType: 'ENGAGEMENT',
          engagementType: event.engagementType,
          duration: event.duration,
          deviceType: event.deviceType,
          timestamp: event.timestamp,
          city: event.location?.city,
          region: event.location?.region,
          country: event.location?.country,
          metadata: event,
        },
      });
    } catch (error) {
      console.error('Error tracking engagement:', error);
    }
  }

  // Track conversion events
  async trackConversion(event: EnhancedTrackingEvent) {
    try {
      await prisma.analyticsEvent.create({
        data: {
          userId: event.userId,
          sessionId: event.sessionId,
          eventType: 'CONVERSION',
          conversionType: event.conversionType,
          value: event.value,
          currency: event.currency,
          deviceType: event.deviceType,
          timestamp: event.timestamp,
          city: event.location?.city,
          region: event.location?.region,
          country: event.location?.country,
          metadata: event,
        },
      });

      // If this is a lead conversion, create a CRM event
      if (event.conversionType === 'LEAD') {
        await this.trackCRMEvent({
          userId: event.userId,
          listingId: event.listingId,
          listingType: event.listingType,
          eventType: 'INQUIRY',
          status: 'NEW',
          priority: 'MEDIUM',
          notes: event.notes,
        });
      }
    } catch (error) {
      console.error('Error tracking conversion:', error);
    }
  }

  // Get analytics for CRM dashboard
  async getCRMAnalytics(userId: string, period: 'day' | 'week' | 'month' | 'year' = 'month') {
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
        totalLeads,
        leadsByStatus,
        leadsByType,
        conversionRate,
        averageResponseTime,
        topSources,
      ] = await Promise.all([
        // Total leads
        prisma.kanbanCard.count({
          where: {
            userId,
            createdAt: { gte: startDate },
          },
        }),
        // Leads by status
        prisma.kanbanCard.groupBy({
          by: ['status'],
          where: {
            userId,
            createdAt: { gte: startDate },
          },
          _count: true,
        }),
        // Leads by type
        prisma.kanbanCard.groupBy({
          by: ['eventType'],
          where: {
            userId,
            createdAt: { gte: startDate },
          },
          _count: true,
        }),
        // Conversion rate
        prisma.analyticsEvent.findMany({
          where: {
            userId,
            eventType: 'CONVERSION',
            timestamp: { gte: startDate },
          },
        }),
        // Average response time
        prisma.kanbanCard.findMany({
          where: {
            userId,
            createdAt: { gte: startDate },
          },
          select: {
            createdAt: true,
            lastUpdated: true,
          },
        }),
        // Top lead sources
        prisma.analyticsEvent.groupBy({
          by: ['metadata.source'],
          where: {
            userId,
            eventType: 'CONVERSION',
            timestamp: { gte: startDate },
          },
          _count: true,
        }),
      ]);

      return {
        totalLeads,
        leadsByStatus,
        leadsByType,
        conversionRate,
        averageResponseTime,
        topSources,
        period,
      };
    } catch (error) {
      console.error('Error getting CRM analytics:', error);
      throw error;
    }
  }

  // Get detailed user journey
  async getUserJourney(userId: string) {
    try {
      const events = await prisma.analyticsEvent.findMany({
        where: { userId },
        orderBy: { timestamp: 'asc' },
      });

      const journey = events.reduce((acc: any, event) => {
        const date = event.timestamp.toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(event);
        return acc;
      }, {});

      return journey;
    } catch (error) {
      console.error('Error getting user journey:', error);
      throw error;
    }
  }
}

export const enhancedAnalytics = new EnhancedAnalyticsTracker();