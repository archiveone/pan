import PusherServer from 'pusher'
import PusherClient from 'pusher-js'

// Server-side Pusher instance for real-time notifications
export const pusher = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
})

// Client-side Pusher instance for real-time updates
export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY!,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    authEndpoint: '/api/pusher/auth',
  }
)

// Channel Types for Property Lead Generation System
export type PropertyChannelTypes = 
  | `private-user-${string}` // Individual user notifications
  | `presence-property-${string}` // Property submission updates
  | `presence-agent-${string}` // Agent-specific updates
  | `presence-valuation-${string}` // Valuation request updates

// Event Types for Lead Generation and Valuation System
export type PropertyEventTypes = 
  | 'new-property-submission' // New property uploaded by landlord
  | 'agent-interest' // Agent expresses interest (5% commission)
  | 'property-assigned' // Property assigned to agent
  | 'new-valuation-request' // Property owner requests valuation
  | 'valuation-offer' // Agent submits valuation
  | 'referral-created' // Agent referral (20% split)
  | 'verification-update' // User verification status change
  | 'listing-update' // Property listing status change

// Helper Functions for Channel Management
export const getChannels = {
  // User-specific private channel
  userPrivate: (userId: string) => 
    `private-user-${userId}` as const,
  
  // Property submission presence channel
  propertySubmission: (submissionId: string) => 
    `presence-property-${submissionId}` as const,
  
  // Agent presence channel for area-based notifications
  agentArea: (areaCode: string) => 
    `presence-agent-${areaCode}` as const,
  
  // Valuation request presence channel
  valuationRequest: (requestId: string) => 
    `presence-valuation-${requestId}` as const,
}

// Notification Types for Different Features
export type NotificationType = 
  | 'PROPERTY_SUBMISSION' // New property submission
  | 'AGENT_INTEREST' // Agent shows interest
  | 'VALUATION_REQUEST' // New valuation request
  | 'VALUATION_OFFER' // Agent submits valuation
  | 'REFERRAL' // Agent referral
  | 'VERIFICATION' // User verification
  | 'LISTING_UPDATE' // Property listing update
  | 'COMMISSION' // Commission-related updates
  | 'MESSAGE' // Direct messages

// Helper function to trigger notifications with proper typing
export const triggerNotification = async (
  channelType: PropertyChannelTypes,
  eventType: PropertyEventTypes,
  data: any
) => {
  try {
    await pusher.trigger(channelType, eventType, data)
    return true
  } catch (error) {
    console.error('[PUSHER_NOTIFICATION_ERROR]', error)
    return false
  }
}

// Subscribe to channels with proper error handling
export const subscribeToChannel = (
  channelType: PropertyChannelTypes,
  handlers: {
    [key in PropertyEventTypes]?: (data: any) => void
  }
) => {
  try {
    const channel = pusherClient.subscribe(channelType)
    
    Object.entries(handlers).forEach(([event, handler]) => {
      channel.bind(event, handler)
    })

    return () => {
      Object.keys(handlers).forEach(event => {
        channel.unbind(event)
      })
      pusherClient.unsubscribe(channelType)
    }
  } catch (error) {
    console.error('[PUSHER_SUBSCRIPTION_ERROR]', error)
    return () => {}
  }
}