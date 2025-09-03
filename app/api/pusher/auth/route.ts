import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { pusher } from '@/lib/pusher'

// Authenticate Pusher channels with comprehensive role-based access
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { 
      socket_id,
      channel_name,
    } = body

    // Get comprehensive user details for presence data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        agentProfile: {
          select: {
            isActive: true,
            rating: true,
            totalDeals: true,
            totalValuations: true,
            areasServed: true,
            specializations: true,
            commissionSettings: true,
          }
        },
        professionalProfile: {
          select: {
            isActive: true,
            rating: true,
            totalServices: true,
            specializations: true,
            areasServed: true,
            businessDetails: true,
          }
        },
      },
    })

    if (!user) {
      return new NextResponse('User not found', { status: 404 })
    }

    // Handle different channel types with specific access controls
    if (channel_name.startsWith('private-user-')) {
      // Private user channels - strict user ID verification
      const channelUserId = channel_name.replace('private-user-', '')
      if (channelUserId !== user.id) {
        return new NextResponse('Unauthorized channel access', { status: 403 })
      }

      const auth = pusher.authorizeChannel(socket_id, channel_name)
      return NextResponse.json(auth)
    }

    if (channel_name.startsWith('presence-property-')) {
      // Property channels - verify property access and agent status
      const propertyId = channel_name.replace('presence-property-', '')
      const property = await prisma.propertySubmission.findUnique({
        where: { id: propertyId },
        include: {
          agentInterests: {
            where: { agentId: user.id },
          },
        },
      })

      if (!property) {
        return new NextResponse('Property not found', { status: 404 })
      }

      // Check comprehensive access conditions
      const hasAccess = 
        property.userId === user.id || // Property owner
        (user.role === 'AGENT' && 
         user.isVerified && 
         user.agentProfile?.isActive && 
         (property.agentInterests.length > 0 || // Interested agent
          property.assignedAgentId === user.id)) // Assigned agent

      if (!hasAccess) {
        return new NextResponse('Unauthorized property access', { status: 403 })
      }

      const presenceData = {
        user_id: user.id,
        user_info: {
          name: user.name,
          role: user.role,
          isVerified: user.isVerified,
          ...(user.role === 'AGENT' && {
            rating: user.agentProfile?.rating,
            totalDeals: user.agentProfile?.totalDeals,
            areasServed: user.agentProfile?.areasServed,
            specializations: user.agentProfile?.specializations,
          }),
          propertyRole: property.userId === user.id ? 'OWNER' : 
                       property.assignedAgentId === user.id ? 'ASSIGNED_AGENT' : 
                       'INTERESTED_AGENT',
        },
      }

      const auth = pusher.authorizeChannel(socket_id, channel_name, presenceData)
      return NextResponse.json(auth)
    }

    if (channel_name.startsWith('presence-valuation-')) {
      // Valuation channels - verify valuation access and agent qualifications
      const valuationId = channel_name.replace('presence-valuation-', '')
      const valuation = await prisma.valuationRequest.findUnique({
        where: { id: valuationId },
        include: {
          bids: {
            where: { agentId: user.id },
          },
        },
      })

      if (!valuation) {
        return new NextResponse('Valuation not found', { status: 404 })
      }

      // Check comprehensive access conditions
      const hasAccess = 
        valuation.userId === user.id || // Valuation requester
        (user.role === 'AGENT' && 
         user.isVerified && 
         user.agentProfile?.isActive && 
         (valuation.bids.length > 0 || // Bidding agent
          valuation.assignedAgentId === user.id)) // Assigned agent

      if (!hasAccess) {
        return new NextResponse('Unauthorized valuation access', { status: 403 })
      }

      const presenceData = {
        user_id: user.id,
        user_info: {
          name: user.name,
          role: user.role,
          isVerified: user.isVerified,
          ...(user.role === 'AGENT' && {
            rating: user.agentProfile?.rating,
            totalValuations: user.agentProfile?.totalValuations,
            areasServed: user.agentProfile?.areasServed,
            specializations: user.agentProfile?.specializations,
          }),
          valuationRole: valuation.userId === user.id ? 'REQUESTER' : 
                        valuation.assignedAgentId === user.id ? 'ASSIGNED_AGENT' : 
                        'BIDDING_AGENT',
        },
      }

      const auth = pusher.authorizeChannel(socket_id, channel_name, presenceData)
      return NextResponse.json(auth)
    }

    if (channel_name.startsWith('presence-group-')) {
      // CRM Group channels - verify active membership and role
      const groupId = channel_name.replace('presence-group-', '')
      const membership = await prisma.groupMembership.findFirst({
        where: {
          groupId,
          userId: user.id,
          status: 'ACTIVE',
        },
        include: {
          group: {
            select: {
              type: true,
              visibility: true,
            },
          },
        },
      })

      if (!membership) {
        return new NextResponse('Unauthorized group access', { status: 403 })
      }

      const presenceData = {
        user_id: user.id,
        user_info: {
          name: user.name,
          role: user.role,
          isVerified: user.isVerified,
          memberRole: membership.role,
          groupType: membership.group.type,
          ...(user.role === 'AGENT' && {
            rating: user.agentProfile?.rating,
            totalDeals: user.agentProfile?.totalDeals,
            specializations: user.agentProfile?.specializations,
          }),
          ...(user.role === 'PROFESSIONAL' && {
            rating: user.professionalProfile?.rating,
            totalServices: user.professionalProfile?.totalServices,
            specializations: user.professionalProfile?.specializations,
            businessDetails: user.professionalProfile?.businessDetails,
          }),
        },
      }

      const auth = pusher.authorizeChannel(socket_id, channel_name, presenceData)
      return NextResponse.json(auth)
    }

    if (channel_name.startsWith('presence-agents-')) {
      // Agent-only channels - strict verification and active status check
      if (user.role !== 'AGENT' || 
          !user.isVerified || 
          !user.agentProfile?.isActive) {
        return new NextResponse('Unauthorized - Active verified agents only', { status: 403 })
      }

      const presenceData = {
        user_id: user.id,
        user_info: {
          name: user.name,
          rating: user.agentProfile.rating,
          totalDeals: user.agentProfile.totalDeals,
          totalValuations: user.agentProfile.totalValuations,
          areasServed: user.agentProfile.areasServed,
          specializations: user.agentProfile.specializations,
          commissionSettings: user.agentProfile.commissionSettings,
        },
      }

      const auth = pusher.authorizeChannel(socket_id, channel_name, presenceData)
      return NextResponse.json(auth)
    }

    if (channel_name.startsWith('presence-professionals-')) {
      // Professional-only channels - strict verification and active status check
      if (user.role !== 'PROFESSIONAL' || 
          !user.isVerified || 
          !user.professionalProfile?.isActive) {
        return new NextResponse('Unauthorized - Active verified professionals only', { status: 403 })
      }

      const presenceData = {
        user_id: user.id,
        user_info: {
          name: user.name,
          rating: user.professionalProfile.rating,
          totalServices: user.professionalProfile.totalServices,
          specializations: user.professionalProfile.specializations,
          areasServed: user.professionalProfile.areasServed,
          businessDetails: user.professionalProfile.businessDetails,
        },
      }

      const auth = pusher.authorizeChannel(socket_id, channel_name, presenceData)
      return NextResponse.json(auth)
    }

    // Default private channel authorization with basic user info
    const auth = pusher.authorizeChannel(socket_id, channel_name)
    return NextResponse.json(auth)

  } catch (error) {
    console.error('[PUSHER_AUTH_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}