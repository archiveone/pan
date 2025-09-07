import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotifications } from './NotificationProvider';
import { cn } from '@/lib/utils';

export function NotificationBell() {
  const { notifications, markAsRead } = useNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    if (notification.data.actionUrl) {
      window.location.href = notification.data.actionUrl;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`${unreadCount} unread notifications`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No notifications
          </div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={cn(
                'flex flex-col items-start p-4 gap-1',
                !notification.read && 'bg-muted/50'
              )}
            >
              <div className="font-medium">
                {getNotificationTitle(notification.type)}
              </div>
              <div className="text-sm text-muted-foreground">
                {getNotificationDescription(notification.type, notification.data)}
              </div>
              <div className="text-xs text-muted-foreground">
                {getRelativeTime(notification.id)}
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Helper function to get notification title
function getNotificationTitle(type: string): string {
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
function getNotificationDescription(type: string, data: any): string {
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

// Helper function to get relative time
function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ago`;
  }
  if (hours > 0) {
    return `${hours}h ago`;
  }
  if (minutes > 0) {
    return `${minutes}m ago`;
  }
  return 'Just now';
}