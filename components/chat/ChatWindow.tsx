'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useChat } from '@/hooks/use-real-time'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import { Send, Loader2 } from 'lucide-react'

interface ChatWindowProps {
  chatId: string
  title?: string
  className?: string
}

export function ChatWindow({
  chatId,
  title,
  className = '',
}: ChatWindowProps) {
  const { data: session } = useSession()
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const {
    messages,
    isTyping,
    sendMessage,
    sendTypingIndicator,
  } = useChat(chatId)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isSending) return

    try {
      setIsSending(true)
      await sendMessage(message)
      setMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsSending(false)
    }
  }

  const handleTyping = () => {
    sendTypingIndicator()
  }

  return (
    <div className={\`flex flex-col h-full \${className}\`}>
      {title && (
        <div className="px-4 py-3 border-b">
          <h3 className="font-semibold">{title}</h3>
        </div>
      )}

      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg) => {
            const isSender = msg.sender.id === session?.user?.id
            return (
              <div
                key={msg.id}
                className={\`flex \${isSender ? 'justify-end' : 'justify-start'}\`}
              >
                <div className={\`flex items-start gap-2 max-w-[70%]\`}>
                  {!isSender && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={msg.sender.image || undefined} />
                      <AvatarFallback>
                        {msg.sender.name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    {!isSender && (
                      <p className="text-sm text-muted-foreground mb-1">
                        {msg.sender.name}
                      </p>
                    )}
                    <div
                      className={\`
                        rounded-lg p-3
                        \${
                          isSender
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }
                      \`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(msg.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
          {isTyping && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {isTyping} is typing...
            </div>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSend} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleTyping}
            placeholder="Type a message..."
            disabled={isSending}
          />
          <Button type="submit" disabled={isSending || !message.trim()}>
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}