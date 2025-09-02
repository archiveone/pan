import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { pusherClient } from '@/lib/pusher'
import {
  getPropertyViewsChannel,
  getUserNotificationsChannel,
  getChatChannel,
  getPresenceChannel,
} from '@/lib/pusher'

// Hook for real-time property views
export function usePropertyViews(propertyId: string) {
  const [viewCount, setViewCount] = useState(0)

  useEffect(() => {
    const channel = pusherClient.subscribe(getPropertyViewsChannel(propertyId))

    channel.bind('view', () => {
      setViewCount((prev) => prev + 1)
    })

    return () => {
      pusherClient.unsubscribe(getPropertyViewsChannel(propertyId))
    }
  }, [propertyId])

  return viewCount
}

// Hook for user notifications
export function useNotifications() {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!session?.user?.id) return

    const channel = pusherClient.subscribe(
      getUserNotificationsChannel(session.user.id)
    )

    channel.bind('notification', (notification: any) => {
      setNotifications((prev) => [notification, ...prev])
      setUnreadCount((prev) => prev + 1)
    })

    return () => {
      if (session?.user?.id) {
        pusherClient.unsubscribe(getUserNotificationsChannel(session.user.id))
      }
    }
  }, [session?.user?.id])

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    )
    setUnreadCount(0)
  }

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  }
}

// Hook for real-time chat
export function useChat(chatId: string) {
  const [messages, setMessages] = useState<any[]>([])
  const [isTyping, setIsTyping] = useState<string | null>(null)
  const { data: session } = useSession()

  useEffect(() => {
    if (!session?.user?.id) return

    const channel = pusherClient.subscribe(getChatChannel(chatId))

    channel.bind('message', (message: any) => {
      setMessages((prev) => [...prev, message])
    })

    channel.bind('typing', (data: { userId: string; name: string }) => {
      if (data.userId !== session.user.id) {
        setIsTyping(data.name)
        // Clear typing indicator after 2 seconds
        setTimeout(() => setIsTyping(null), 2000)
      }
    })

    return () => {
      pusherClient.unsubscribe(getChatChannel(chatId))
    }
  }, [chatId, session?.user?.id])

  const sendMessage = async (content: string) => {
    try {
      await fetch(\`/api/chat/\${chatId}/messages\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const sendTypingIndicator = async () => {
    try {
      await fetch(\`/api/chat/\${chatId}/typing\`, {
        method: 'POST',
      })
    } catch (error) {
      console.error('Failed to send typing indicator:', error)
    }
  }

  return {
    messages,
    isTyping,
    sendMessage,
    sendTypingIndicator,
  }
}

// Hook for user presence
export function usePresence(userId: string) {
  const [isOnline, setIsOnline] = useState(false)
  const [lastSeen, setLastSeen] = useState<Date | null>(null)

  useEffect(() => {
    const channel = pusherClient.subscribe(getPresenceChannel(userId))

    channel.bind('online', () => {
      setIsOnline(true)
      setLastSeen(new Date())
    })

    channel.bind('offline', (data: { lastSeen: string }) => {
      setIsOnline(false)
      setLastSeen(new Date(data.lastSeen))
    })

    return () => {
      pusherClient.unsubscribe(getPresenceChannel(userId))
    }
  }, [userId])

  return { isOnline, lastSeen }
}