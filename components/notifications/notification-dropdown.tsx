'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Bell } from 'lucide-react';
import { pusherClient } from '@/lib/services/notifications';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  read: boolean;
  createdAt: string;
}

export default function NotificationDropdown() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) return;

    // Fetch initial notifications
    fetchNotifications();

    // Subscribe to user's private channel
    const channel = pusherClient.subscribe(`private-user-${session.user.id}`);

    // Handle new inquiry notifications
    channel.bind('new-inquiry', (data: any) => {
      setNotifications(prev => [createNotificationFromEvent(data), ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    // Handle inquiry accepted notifications
    channel.bind('inquiry-accepted', (data: any) => {
      setNotifications(prev => [createNotificationFromEvent(data), ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    // Handle commission paid notifications
    channel.bind('commission-paid', (data: any) => {
      setNotifications(prev => [createNotificationFromEvent(data), ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [session?.user?.id]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      setNotifications(data.notifications);
      setUnreadCount(data.notifications.filter((n: Notification) => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const createNotificationFromEvent = (event: any): Notification => {
    let title = '';
    let message = '';

    switch (event.type) {
      case 'NEW_INQUIRY':
        title = 'New Agent Inquiry';
        message = `${event.agent.name} has inquired about ${event.listing.title}`;
        break;
      case 'INQUIRY_ACCEPTED':
        title = 'Inquiry Accepted';
        message = `Your inquiry for ${event.listing.title} has been accepted`;
        break;
      case 'COMMISSION_PAID':
        title = 'Commission Payment';
        message = `Commission payment of £${event.amount.toLocaleString()} has been processed`;
        break;
    }

    return {
      id: crypto.randomUUID(),
      type: event.type,
      title,
      message,
      data: event,
      read: false,
      createdAt: event.timestamp,
    };
  };

  const markAsRead = async (notificationIds: string[]) => {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds }),
      });

      setNotifications(prev =>
        prev.map(n =>
          notificationIds.includes(n.id) ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => prev - notificationIds.length);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead([notification.id]);
    }

    // Handle navigation based on notification type
    switch (notification.type) {
      case 'NEW_INQUIRY':
        window.location.href = `/private-marketplace?listing=${notification.data.listingId}`;
        break;
      case 'INQUIRY_ACCEPTED':
        window.location.href = `/private-marketplace?inquiry=${notification.data.inquiryId}`;
        break;
      case 'COMMISSION_PAID':
        window.location.href = `/dashboard/commissions`;
        break;
    }

    setIsOpen(false);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAsRead(notifications.filter(n => !n.read).map(n => n.id))}
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          <DropdownMenuGroup>
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`p-4 cursor-pointer ${!notification.read ? 'bg-gray-50' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-4">
                    {notification.data.agent?.image || notification.data.owner?.image ? (
                      <Avatar>
                        <AvatarImage src={notification.data.agent?.image || notification.data.owner?.image} />
                        <AvatarFallback>
                          {(notification.data.agent?.name?.[0] || notification.data.owner?.name?.[0] || 'U').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bell className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{notification.title}</div>
                      <div className="text-sm text-gray-500">{notification.message}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {formatTimeAgo(notification.createdAt)}
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    )}
                  </div>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuGroup>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}