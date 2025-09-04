'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Settings, Loader2, X, Check } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import Pusher from 'pusher-js';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

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

interface NotificationsViewProps {
  initialNotifications: Notification[];
  initialUnreadCount: number;
  initialPreferences: Record<string, boolean>;
}

export const NotificationsView = ({
  initialNotifications,
  initialUnreadCount,
  initialPreferences,
}: NotificationsViewProps) => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [loading, setLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [preferences, setPreferences] = useState(initialPreferences);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [ref, inView] = useInView();
  const router = useRouter();
  const { toast } = useToast();

  // Load more notifications when scrolling
  useEffect(() => {
    if (inView && nextCursor) {
      fetchNotifications(nextCursor);
    }
  }, [inView]);

  const fetchNotifications = async (cursor?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (cursor) params.append('cursor', cursor);

      const response = await axios.get(`/api/notifications?${params.toString()}`);
      const { notifications: newNotifications, nextCursor: newCursor } = response.data;

      if (cursor) {
        setNotifications(prev => [...prev, ...newNotifications]);
      } else {
        setNotifications(newNotifications);
      }
      setNextCursor(newCursor);
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

      router.push(notification.link);
    } catch (error) {
      console.error('Error handling notification:', error);
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

  const updatePreferences = async (key: string, value: boolean) => {
    try {
      const newPreferences = {
        ...preferences,
        [key]: value,
      };

      await axios.patch('/api/notifications', {
        preferences: newPreferences,
      });

      setPreferences(newPreferences);
      toast({
        title: "Success",
        description: "Notification preferences updated",
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not update preferences",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Notification Settings</SheetTitle>
            </SheetHeader>
            <div className="py-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="font-medium">Messages</h4>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for new messages
                  </p>
                </div>
                <Switch
                  checked={preferences.messages}
                  onCheckedChange={(checked) => updatePreferences('messages', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="font-medium">Property Updates</h4>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for property status changes
                  </p>
                </div>
                <Switch
                  checked={preferences.propertyUpdates}
                  onCheckedChange={(checked) => updatePreferences('propertyUpdates', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="font-medium">Social Activity</h4>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for likes, comments, and follows
                  </p>
                </div>
                <Switch
                  checked={preferences.socialActivity}
                  onCheckedChange={(checked) => updatePreferences('socialActivity', checked)}
                />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <ScrollArea className="h-[calc(100vh-12rem)]">
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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteNotification(notification.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}

          {!loading && notifications.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No notifications to show
            </div>
          )}

          {nextCursor && <div ref={ref} className="h-1" />}
        </div>
      </ScrollArea>
    </div>
  );
};