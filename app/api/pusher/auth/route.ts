import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { pusher } from '@/lib/pusher'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const data = await req.json()
    const { channel_name, socket_id } = data

    // Validate channel access based on user role and verification status
    if (channel_name.startsWith('presence-')) {
      // For presence channels, provide user info for real-time features
      const presenceData = {
        user_id: session.user.id,
        user_info: {
          name: session.user.name,
          email: session.user.email,
          isVerified: session.user.isVerified,
          role: session.user.role,
        },
      }

      // Channel-specific access validation
      if (channel_name.startsWith('presence-agent-')) {
        // Only verified agents can access agent-specific channels
        if (session.user.role !== 'AGENT' || !session.user.isVerified) {
          return new NextResponse('Unauthorized - Verified agents only', { status: 403 })
        }
      }

      if (channel_name.startsWith('presence-property-')) {
        const propertyId = channel_name.split('presence-property-')[1]
        // Validate property access
        const property = await prisma.propertySubmission.findUnique({
          where: { id: propertyId },
          include: {
            agentInterests: {
              where: { userId: session.user.id }
            }
          }
        })

        // Allow access only to property owner or interested agents
        if (!property || (
          property.userId !== session.user.id && 
          property.agentInterests.length === 0 &&
          session.user.role !== 'ADMIN'
        )) {
          return new NextResponse('Unauthorized - No property access', { status: 403 })
        }
      }

      if (channel_name.startsWith('presence-valuation-')) {
        const valuationId = channel_name.split('presence-valuation-')[1]
        // Validate valuation access
        const valuation = await prisma.valuationRequest.findUnique({
          where: { id: valuationId },
          include: {
            offers: {
              where: { userId: session.user.id }
            }
          }
        })

        // Allow access only to valuation owner or offering agents
        if (!valuation || (
          valuation.userId !== session.user.id && 
          valuation.offers.length === 0 &&
          session.user.role !== 'ADMIN'
        )) {
          return new NextResponse('Unauthorized - No valuation access', { status: 403 })
        }
      }

      // Authorize channel with presence data
      const auth = pusher.authorizeChannel(socket_id, channel_name, presenceData)
      return NextResponse.json(auth)
    }

    // Private channel authorization (user-specific channels)
    if (channel_name.startsWith('private-user-')) {
      const userId = channel_name.split('private-user-')[1]
      
      // Users can only subscribe to their own private channel
      if (userId !== session.user.id && session.user.role !== 'ADMIN') {
        return new NextResponse('Unauthorized - Invalid user channel', { status: 403 })
      }

      const auth = pusher.authorizeChannel(socket_id, channel_name)
      return NextResponse.json(auth)
    }

    // Invalid channel type
    return new NextResponse('Invalid channel type', { status: 400 })

  } catch (error) {
    console.error('[PUSHER_AUTH_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}