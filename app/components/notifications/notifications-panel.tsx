'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Loader2, X, Check } from 'lucide-react';
import Pusher from 'pusher-js';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

interface Notification {
  id: string;
  type: string;
  title: string;
  content: string;
  link: string;
  read: boolean;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    image: string;
  };
}

export const NotificationsPanel = () => {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const fetchNotifications = async (cursor?: string) => {
    try {
      const params = new URLSearchParams();
      if (cursor) params.append('cursor', cursor);

      const response = await axios.get(`/api/notifications?${params.toString()}`);
      const { notifications: newNotifications, nextCursor: newCursor, unreadCount } = response.data;

      if (cursor) {
        setNotifications(prev => [...prev, ...newNotifications]);
      } else {
        setNotifications(newNotifications);
      }
      setNextCursor(newCursor);
      setUnreadCount(unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load notifications. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time updates
  useEffect(() => {
    if (!session?.user?.id) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      channelAuthorization: {
        endpoint: '/api/pusher/auth',
        transport: 'ajax',
      },
    });

    const channel = pusher.subscribe(`private-user-${session.user.id}`);
    
    channel.bind('new-notification', () => {
      fetchNotifications();
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [session?.user?.id]);

  // Initial fetch
  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (!notification.read) {
        await axios.post('/api/notifications', {
          notificationIds: [notification.id],
        });

        setNotifications(prev =>
          prev.map(n =>
            n.id === notification.id ? { ...n, read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      setOpen(false);
      router.push(notification.link);
    } catch (error) {
      console.error('Error handling notification:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter(n => !n.read)
        .map(n => n.id);

      if (unreadIds.length === 0) return;

      await axios.post('/api/notifications', {
        notificationIds: unreadIds,
      });

      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);

      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not mark notifications as read",
      });
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await axios.delete(`/api/notifications?id=${id}`);
      
      setNotifications(prev =>
        prev.filter(n => n.id !== id)
      );

      toast({
        title: "Success",
        description: "Notification deleted",
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete notification",
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
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
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <div className="flex justify-between items-center">
            <SheetTitle>Notifications</SheetTitle>
            {notifications.some(n => !n.read) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                Mark all as read
              </Button>
            )}
          </div>
        </SheetHeader>

        {loading ? (
          <div className="flex justify-center items-center h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`relative p-4 rounded-lg ${
                    notification.read ? 'bg-background' : 'bg-muted'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {notification.sender && (
                      <Avatar>
                        <AvatarImage src={notification.sender.image} alt={notification.sender.name} />
                        <AvatarFallback>{notification.sender.name[0]}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex-1">
                      <div
                        onClick={() => handleNotificationClick(notification)}
                        className="cursor-pointer"
                      >
                        <h4 className="font-semibold">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground">{notification.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {notifications.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No notifications to show
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
};