import PusherServer from 'pusher';
import PusherClient from 'pusher-js';
import prisma from '@/lib/prisma';

// Initialize Pusher server instance
const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

// Initialize Pusher client instance
export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY!,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  }
);

export class NotificationService {
  /**
   * Send a new inquiry notification to property owner
   */
  static async sendInquiryNotification(
    ownerId: string,
    inquiryId: string,
    listingId: string
  ) {
    try {
      // Get inquiry details
      const inquiry = await prisma.listingEnquiry.findUnique({
        where: { id: inquiryId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              isVerified: true,
            },
          },
          listing: {
            select: {
              title: true,
            },
          },
        },
      });

      if (!inquiry) return;

      // Send real-time notification
      await pusherServer.trigger(`private-user-${ownerId}`, 'new-inquiry', {
        type: 'NEW_INQUIRY',
        inquiryId,
        listingId,
        agent: {
          id: inquiry.user.id,
          name: inquiry.user.name,
          image: inquiry.user.image,
          isVerified: inquiry.user.isVerified,
        },
        listing: {
          title: inquiry.listing.title,
        },
        timestamp: new Date().toISOString(),
      });

      // Store notification in database
      await prisma.notification.create({
        data: {
          userId: ownerId,
          type: 'NEW_INQUIRY',
          title: 'New Agent Inquiry',
          message: `${inquiry.user.name} has inquired about ${inquiry.listing.title}`,
          data: {
            inquiryId,
            listingId,
            agentId: inquiry.user.id,
          },
        },
      });

      // Update inquiry notification status
      await prisma.listingEnquiry.update({
        where: { id: inquiryId },
        data: { notified: true },
      });
    } catch (error) {
      console.error('Error sending inquiry notification:', error);
    }
  }

  /**
   * Send a notification when an agent is selected
   */
  static async sendAgentSelectionNotification(
    agentId: string,
    inquiryId: string,
    listingId: string
  ) {
    try {
      // Get listing details
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        select: {
          title: true,
          owner: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      if (!listing) return;

      // Send real-time notification
      await pusherServer.trigger(`private-user-${agentId}`, 'inquiry-accepted', {
        type: 'INQUIRY_ACCEPTED',
        inquiryId,
        listingId,
        owner: {
          id: listing.owner.id,
          name: listing.owner.name,
          image: listing.owner.image,
        },
        listing: {
          title: listing.title,
        },
        timestamp: new Date().toISOString(),
      });

      // Store notification in database
      await prisma.notification.create({
        data: {
          userId: agentId,
          type: 'INQUIRY_ACCEPTED',
          title: 'Inquiry Accepted',
          message: `Your inquiry for ${listing.title} has been accepted`,
          data: {
            inquiryId,
            listingId,
            ownerId: listing.owner.id,
          },
        },
      });
    } catch (error) {
      console.error('Error sending agent selection notification:', error);
    }
  }

  /**
   * Send a commission payment notification
   */
  static async sendCommissionNotification(
    agentId: string,
    commissionId: string,
    amount: number
  ) {
    try {
      // Send real-time notification
      await pusherServer.trigger(`private-user-${agentId}`, 'commission-paid', {
        type: 'COMMISSION_PAID',
        commissionId,
        amount,
        timestamp: new Date().toISOString(),
      });

      // Store notification in database
      await prisma.notification.create({
        data: {
          userId: agentId,
          type: 'COMMISSION_PAID',
          title: 'Commission Payment',
          message: `Commission payment of £${amount.toLocaleString()} has been processed`,
          data: {
            commissionId,
            amount,
          },
        },
      });
    } catch (error) {
      console.error('Error sending commission notification:', error);
    }
  }

  /**
   * Get user's notifications
   */
  static async getUserNotifications(
    userId: string,
    page = 1,
    limit = 20
  ) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({
        where: { userId },
      }),
    ]);

    return {
      notifications,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    };
  }

  /**
   * Mark notifications as read
   */
  static async markNotificationsAsRead(userId: string, notificationIds: string[]) {
    await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(userId: string) {
    return await prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });
  }
}