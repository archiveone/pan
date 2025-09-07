import React, { createContext, useContext, useEffect, useState } from 'react';
import Pusher from 'pusher-js';
import { useSession } from 'next-auth/react';
import { toast } from '@/components/ui/use-toast';
import { NotificationType } from '@/lib/notifications';

// Initialize Pusher
const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
});

// Create notification context
type NotificationContextType = {
  notifications: any[];
  markAsRead: (id: string) => void;
};

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  markAsRead: () => {},
});

// Notification sounds
const notificationSounds = {
  NEW_LEAD: new Audio('/sounds/new-lead.mp3'),
  NEW_TASK: new Audio('/sounds/new-task.mp3'),
  LEAD_UPDATE: new Audio('/sounds/lead-update.mp3'),
  TASK_UPDATE: new Audio('/sounds/task-update.mp3'),
};

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!session?.user?.id) return;

    // Subscribe to user's notification channel
    const channel = pusher.subscribe(`user-${session.user.id}`);

    // Handle different notification types
    const handleNotification = (type: NotificationType, data: any) => {
      // Play notification sound
      notificationSounds[type]?.play().catch(() => {});

      // Add notification to state
      setNotifications((prev) => [{ id: Date.now(), type, data, read: false }, ...prev]);

      // Show toast notification
      toast({
        title: getNotificationTitle(type),
        description: getNotificationDescription(type, data),
        action: data.actionUrl ? {
          label: 'View',
          onClick: () => window.location.href = data.actionUrl,
        } : undefined,
      });
    };

    // Subscribe to different notification types
    channel.bind('NEW_LEAD', (data: any) => handleNotification('NEW_LEAD', data));
    channel.bind('NEW_TASK', (data: any) => handleNotification('NEW_TASK', data));
    channel.bind('LEAD_UPDATE', (data: any) => handleNotification('LEAD_UPDATE', data));
    channel.bind('TASK_UPDATE', (data: any) => handleNotification('TASK_UPDATE', data));

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [session?.user?.id]);

  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  return (
    <NotificationContext.Provider value={{ notifications, markAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

// Helper function to get notification title
function getNotificationTitle(type: NotificationType): string {
  switch (type) {
    case 'NEW_LEAD':
      return 'New Lead Received';
    case 'NEW_TASK':
      return 'New Task Assigned';
    case 'LEAD_UPDATE':
      return 'Lead Status Updated';
    case 'TASK_UPDATE':
      return 'Task Status Updated';
    default:
      return 'New Notification';
  }
}

// Helper function to get notification description
function getNotificationDescription(type: NotificationType, data: any): string {
  switch (type) {
    case 'NEW_LEAD':
      return `New lead from ${data.contactName}`;
    case 'NEW_TASK':
      return `${data.title} - Due: ${new Date(data.dueDate).toLocaleDateString()}`;
    case 'LEAD_UPDATE':
      return `Lead "${data.title}" is now ${data.status}`;
    case 'TASK_UPDATE':
      return `Task "${data.title}" status changed to ${data.status}`;
    default:
      return '';
  }
}

// Custom hook to use notifications
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}