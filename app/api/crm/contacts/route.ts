import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { pusher } from '@/lib/pusher'

// Create new contact with integrated verification system
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { 
      name, 
      email, 
      phone, 
      type, // CLIENT, AGENT, VENDOR, OTHER
      category, // PROPERTY, SERVICE, LEISURE
      notes,
      companyName,
      position,
      source, // MANUAL, PROPERTY_SUBMISSION, VALUATION_REQUEST, REFERRAL
      tags,
      areaServed, // For agents
      specializations, // For agents/vendors
    } = body

    // Create new contact with extended details
    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        phone,
        type,
        category,
        notes,
        companyName,
        position,
        source: source || 'MANUAL',
        tags: tags || [],
        userId: session.user.id,
        // Agent-specific fields
        areaServed: type === 'AGENT' ? areaServed : null,
        specializations: ['AGENT', 'VENDOR'].includes(type) ? specializations : [],
        // Verification status for agents
        verificationStatus: type === 'AGENT' ? 'PENDING' : null,
        // Commission settings for agents
        commissionSettings: type === 'AGENT' ? {
          create: {
            standardRate: 5, // 5% standard commission
            referralSplit: 20, // 20% referral split
            isActive: false, // Requires verification
          }
        } : undefined,
      },
      include: {
        commissionSettings: true,
      },
    })

    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        type: 'CONTACT_CREATED',
        entityType: 'CONTACT',
        entityId: contact.id,
        description: `New ${type.toLowerCase()} contact created: ${contact.name}`,
        metadata: {
          contactId: contact.id,
          type,
          category,
          source,
          isAgent: type === 'AGENT',
          areaServed: areaServed || null,
        },
      },
    })

    // If it's an agent, create verification request
    if (type === 'AGENT') {
      await prisma.verificationRequest.create({
        data: {
          userId: session.user.id,
          contactId: contact.id,
          type: 'AGENT_VERIFICATION',
          status: 'PENDING',
          metadata: {
            areaServed,
            specializations,
            companyName,
          },
        },
      })
    }

    // Send real-time notification
    await pusher.trigger(
      `private-user-${session.user.id}`,
      'crm-update',
      {
        type: 'CONTACT_CREATED',
        contact,
        timestamp: new Date().toISOString(),
      }
    )

    return NextResponse.json(contact)

  } catch (error) {
    console.error('[CREATE_CONTACT_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Update contact with verification and commission handling
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { 
      contactId,
      name,
      email,
      phone,
      type,
      category,
      notes,
      companyName,
      position,
      tags,
      areaServed,
      specializations,
      isVerified,
      commissionSettings,
    } = body

    // Verify contact ownership
    const existingContact = await prisma.contact.findUnique({
      where: { id: contactId },
      include: {
        commissionSettings: true,
      },
    })

    if (!existingContact || existingContact.userId !== session.user.id) {
      return new NextResponse('Not found', { status: 404 })
    }

    // Update contact with verification and commission handling
    const updatedContact = await prisma.contact.update({
      where: { id: contactId },
      data: {
        name,
        email,
        phone,
        type,
        category,
        notes,
        companyName,
        position,
        tags,
        areaServed: type === 'AGENT' ? areaServed : null,
        specializations: ['AGENT', 'VENDOR'].includes(type) ? specializations : [],
        // Handle verification status for agents
        verificationStatus: type === 'AGENT' ? 
          (isVerified ? 'VERIFIED' : 'PENDING') : 
          null,
        // Update commission settings if provided
        commissionSettings: type === 'AGENT' && commissionSettings ? {
          upsert: {
            create: {
              standardRate: commissionSettings.standardRate || 5,
              referralSplit: commissionSettings.referralSplit || 20,
              isActive: isVerified || false,
            },
            update: {
              standardRate: commissionSettings.standardRate || 5,
              referralSplit: commissionSettings.referralSplit || 20,
              isActive: isVerified || false,
            },
          },
        } : undefined,
        updatedAt: new Date(),
      },
      include: {
        commissionSettings: true,
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        type: 'CONTACT_UPDATED',
        entityType: 'CONTACT',
        entityId: contactId,
        description: `Contact updated: ${updatedContact.name}`,
        metadata: {
          contactId,
          type,
          category,
          verificationStatus: updatedContact.verificationStatus,
          isAgent: type === 'AGENT',
          commissionUpdated: !!commissionSettings,
        },
      },
    })

    // Send real-time notification
    await pusher.trigger(
      `private-user-${session.user.id}`,
      'crm-update',
      {
        type: 'CONTACT_UPDATED',
        contact: updatedContact,
        timestamp: new Date().toISOString(),
      }
    )

    return NextResponse.json(updatedContact)

  } catch (error) {
    console.error('[UPDATE_CONTACT_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Get contacts with advanced filtering and statistics
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')
    const tag = searchParams.get('tag')
    const verificationStatus = searchParams.get('verificationStatus')
    const areaServed = searchParams.get('areaServed')
    const hasActiveCommission = searchParams.get('hasActiveCommission') === 'true'

    // Build comprehensive filter conditions
    const where = {
      userId: session.user.id,
      ...(type && { type }),
      ...(category && { category }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { companyName: { contains: search, mode: 'insensitive' } },
          { areaServed: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(tag && {
        tags: {
          has: tag,
        },
      }),
      ...(verificationStatus && {
        verificationStatus,
      }),
      ...(areaServed && {
        areaServed: {
          contains: areaServed,
          mode: 'insensitive',
        },
      }),
      ...(hasActiveCommission && {
        commissionSettings: {
          isActive: true,
        },
      }),
    }

    // Get contacts with related data
    const contacts = await prisma.contact.findMany({
      where,
      include: {
        leads: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        commissionSettings: true,
        _count: {
          select: {
            leads: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    })

    // Get total count for pagination
    const total = await prisma.contact.count({ where })

    // Get comprehensive contact statistics
    const stats = await prisma.$transaction([
      // Count by type
      prisma.contact.groupBy({
        by: ['type'],
        where: { userId: session.user.id },
        _count: true,
      }),
      // Count by verification status (agents only)
      prisma.contact.groupBy({
        by: ['verificationStatus'],
        where: { 
          userId: session.user.id,
          type: 'AGENT',
        },
        _count: true,
      }),
      // Count by category
      prisma.contact.groupBy({
        by: ['category'],
        where: { userId: session.user.id },
        _count: true,
      }),
      // Active commission agents count
      prisma.contact.count({
        where: {
          userId: session.user.id,
          type: 'AGENT',
          commissionSettings: {
            isActive: true,
          },
        },
      }),
    ])

    return NextResponse.json({
      contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: {
        byType: stats[0].reduce((acc, curr) => ({
          ...acc,
          [curr.type]: curr._count,
        }), {}),
        byVerificationStatus: stats[1].reduce((acc, curr) => ({
          ...acc,
          [curr.verificationStatus || 'NONE']: curr._count,
        }), {}),
        byCategory: stats[2].reduce((acc, curr) => ({
          ...acc,
          [curr.category]: curr._count,
        }), {}),
        activeCommissionAgents: stats[3],
      },
    })

  } catch (error) {
    console.error('[GET_CONTACTS_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}