import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { pusher } from '@/lib/pusher'

// Create CRM Group with integrated social features
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { 
      name,
      type, // PROPERTY_NETWORK, SERVICE_GUILD, LEISURE_CLUB, COMMUNITY
      description,
      privacy, // PUBLIC, PRIVATE, INVITE_ONLY
      location,
      tags,
      rules,
      features, // Array of enabled features
      membershipCriteria, // Optional verification requirements
      propertyTypes, // For property networks
      serviceCategories, // For service guilds
      leisureTypes, // For leisure clubs
    } = body

    // Create CRM Group with rich features
    const group = await prisma.crmGroup.create({
      data: {
        name,
        type,
        description,
        privacy,
        location,
        tags: tags || [],
        rules: rules || [],
        features: features || ['POSTS', 'COMMENTS', 'EVENTS'],
        membershipCriteria: membershipCriteria || {},
        propertyTypes: type === 'PROPERTY_NETWORK' ? propertyTypes : [],
        serviceCategories: type === 'SERVICE_GUILD' ? serviceCategories : [],
        leisureTypes: type === 'LEISURE_CLUB' ? leisureTypes : [],
        creatorId: session.user.id,
        // Create initial membership for creator as admin
        memberships: {
          create: {
            userId: session.user.id,
            role: 'ADMIN',
            status: 'ACTIVE',
          }
        },
        // Create activity log
        activities: {
          create: {
            type: 'GROUP_CREATED',
            userId: session.user.id,
            description: `Group "${name}" created`,
            metadata: {
              groupType: type,
              privacy,
              features,
            },
          }
        },
        // Create initial feed
        feed: {
          create: {
            name: `${name} Feed`,
            type: 'GROUP',
            visibility: privacy,
          }
        },
      },
      include: {
        creator: {
          select: {
            name: true,
            email: true,
            image: true,
          }
        },
        feed: true,
        _count: {
          select: {
            memberships: true,
          }
        },
      },
    })

    // Create group settings with marketplace integration
    await prisma.groupSettings.create({
      data: {
        groupId: group.id,
        postApprovalRequired: privacy === 'PRIVATE',
        memberPostingEnabled: true,
        eventCreationEnabled: features.includes('EVENTS'),
        listingShareEnabled: features.includes('LISTINGS'),
        valuationShareEnabled: features.includes('VALUATIONS'),
        membershipRequirements: membershipCriteria || {},
        // Marketplace settings
        propertyListingEnabled: type === 'PROPERTY_NETWORK',
        serviceListingEnabled: type === 'SERVICE_GUILD',
        leisureListingEnabled: type === 'LEISURE_CLUB',
        commissionSettings: type === 'PROPERTY_NETWORK' ? {
          standardRate: 5, // 5% standard commission
          referralSplit: 20, // 20% referral split
        } : null,
      },
    })

    // Create welcome post
    await prisma.post.create({
      data: {
        feedId: group.feed.id,
        userId: session.user.id,
        content: `Welcome to ${name}! 👋\n\nThis is a ${type.toLowerCase().replace('_', ' ')} for ${description}.\n\nFeel free to introduce yourself and start connecting with other members!`,
        type: 'WELCOME',
        visibility: privacy,
      },
    })

    // Create notification for creator
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'GROUP_CREATED',
        title: 'Group Created Successfully',
        content: `Your group "${name}" has been created. Start inviting members!`,
        metadata: {
          groupId: group.id,
          groupName: name,
          groupType: type,
          feedId: group.feed.id,
        },
      },
    })

    return NextResponse.json({
      success: true,
      group: {
        id: group.id,
        name: group.name,
        type: group.type,
        privacy: group.privacy,
        memberCount: group._count.memberships,
        feedId: group.feed.id,
        createdAt: group.createdAt,
      },
    })

  } catch (error) {
    console.error('[CREATE_GROUP_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Update CRM Group with marketplace integration
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { 
      groupId,
      name,
      description,
      privacy,
      tags,
      rules,
      features,
      settings,
      propertyTypes,
      serviceCategories,
      leisureTypes,
      marketplaceSettings,
    } = body

    // Verify group admin status
    const membership = await prisma.groupMembership.findFirst({
      where: {
        groupId,
        userId: session.user.id,
        role: 'ADMIN',
      },
    })

    if (!membership) {
      return new NextResponse('Unauthorized - Admin only', { status: 403 })
    }

    // Update group with marketplace integration
    const updatedGroup = await prisma.crmGroup.update({
      where: { id: groupId },
      data: {
        name,
        description,
        privacy,
        tags,
        rules,
        features,
        propertyTypes,
        serviceCategories,
        leisureTypes,
        // Update group settings
        settings: {
          update: {
            ...settings,
            propertyListingEnabled: marketplaceSettings?.propertyListingEnabled,
            serviceListingEnabled: marketplaceSettings?.serviceListingEnabled,
            leisureListingEnabled: marketplaceSettings?.leisureListingEnabled,
            commissionSettings: marketplaceSettings?.commissionSettings,
          },
        },
        // Update feed visibility if privacy changes
        feed: privacy ? {
          update: {
            visibility: privacy,
          },
        } : undefined,
        // Log activity
        activities: {
          create: {
            type: 'GROUP_UPDATED',
            userId: session.user.id,
            description: `Group settings updated by ${session.user.name}`,
            metadata: {
              updatedFields: Object.keys({ 
                name, description, privacy, tags, rules, features, 
                settings, propertyTypes, serviceCategories, leisureTypes,
                marketplaceSettings,
              }.filter(field => field !== undefined)),
            },
          }
        },
      },
      include: {
        settings: true,
        feed: true,
        _count: {
          select: {
            memberships: true,
            posts: true,
            events: true,
            listings: true,
          }
        },
      },
    })

    // Notify group admins and moderators
    const staffMembers = await prisma.groupMembership.findMany({
      where: {
        groupId,
        role: { in: ['ADMIN', 'MODERATOR'] },
        userId: { not: session.user.id },
      },
      select: {
        userId: true,
        role: true,
      },
    })

    for (const staff of staffMembers) {
      await pusher.trigger(
        `private-user-${staff.userId}`,
        'group-update',
        {
          groupId,
          updatedBy: session.user.name,
          changes: Object.keys({ 
            name, description, privacy, tags, rules, features,
            settings, marketplaceSettings,
          }.filter(field => field !== undefined)),
          timestamp: new Date().toISOString(),
        }
      )

      await prisma.notification.create({
        data: {
          userId: staff.userId,
          type: 'GROUP_UPDATED',
          title: 'Group Settings Updated',
          content: `${session.user.name} updated settings for "${updatedGroup.name}"`,
          metadata: {
            groupId,
            groupName: updatedGroup.name,
            updatedBy: session.user.id,
            staffRole: staff.role,
          },
        },
      })
    }

    return NextResponse.json({
      success: true,
      group: updatedGroup,
    })

  } catch (error) {
    console.error('[UPDATE_GROUP_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Get CRM Groups with comprehensive filtering and marketplace stats
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const privacy = searchParams.get('privacy')
    const membership = searchParams.get('membership') // 'member', 'admin', 'moderator', 'all'
    const search = searchParams.get('search')
    const location = searchParams.get('location')
    const hasMarketplace = searchParams.get('hasMarketplace') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build comprehensive filter conditions
    const where = {
      ...(type && { type }),
      ...(privacy && { privacy }),
      ...(location && {
        location: {
          contains: location,
          mode: 'insensitive',
        },
      }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { tags: { has: search } },
        ],
      }),
      ...(membership && {
        memberships: {
          some: {
            userId: session.user.id,
            ...(membership !== 'all' && {
              role: membership.toUpperCase(),
            }),
          },
        },
      }),
      ...(hasMarketplace && {
        settings: {
          OR: [
            { propertyListingEnabled: true },
            { serviceListingEnabled: true },
            { leisureListingEnabled: true },
          ],
        },
      }),
    }

    // Get groups with related data and marketplace stats
    const groups = await prisma.crmGroup.findMany({
      where,
      include: {
        creator: {
          select: {
            name: true,
            email: true,
            image: true,
          }
        },
        settings: true,
        feed: {
          select: {
            id: true,
            _count: {
              select: {
                posts: true,
              }
            }
          }
        },
        _count: {
          select: {
            memberships: true,
            posts: true,
            events: true,
            listings: true,
          }
        },
        memberships: {
          where: {
            userId: session.user.id,
          },
          select: {
            role: true,
            status: true,
          }
        },
      },
      orderBy: [
        { type: 'asc' },
        { updatedAt: 'desc' },
      ],
      skip: (page - 1) * limit,
      take: limit,
    })

    // Get comprehensive statistics
    const [total, stats] = await prisma.$transaction([
      prisma.crmGroup.count({ where }),
      prisma.crmGroup.groupBy({
        by: ['type'],
        where: {
          memberships: {
            some: {
              userId: session.user.id,
            },
          },
        },
        _count: {
          _all: true,
          posts: true,
          events: true,
          listings: true,
        },
      }),
    ])

    // Calculate marketplace activity
    const marketplaceStats = await prisma.crmGroup.aggregate({
      where: {
        memberships: {
          some: {
            userId: session.user.id,
          },
        },
        settings: {
          OR: [
            { propertyListingEnabled: true },
            { serviceListingEnabled: true },
            { leisureListingEnabled: true },
          ],
        },
      },
      _count: {
        listings: true,
      },
      _sum: {
        totalTransactions: true,
        totalCommissions: true,
      },
    })

    return NextResponse.json({
      groups: groups.map(group => ({
        ...group,
        isMarketplace: group.settings.propertyListingEnabled ||
                      group.settings.serviceListingEnabled ||
                      group.settings.leisureListingEnabled,
        activityScore: calculateGroupActivityScore(group),
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: {
        byType: stats.reduce((acc, curr) => ({
          ...acc,
          [curr.type]: {
            groups: curr._count._all,
            posts: curr._count.posts,
            events: curr._count.events,
            listings: curr._count.listings,
          },
        }), {}),
        marketplace: {
          totalListings: marketplaceStats._count.listings,
          totalTransactions: marketplaceStats._sum.totalTransactions || 0,
          totalCommissions: marketplaceStats._sum.totalCommissions || 0,
        },
      },
    })

  } catch (error) {
    console.error('[GET_GROUPS_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Helper function to calculate group activity score
function calculateGroupActivityScore(group: any): number {
  const now = new Date()
  const groupAge = now.getTime() - new Date(group.createdAt).getTime()
  const daysOld = groupAge / (1000 * 60 * 60 * 24)

  // Base score from member count and post activity
  let score = (group._count.memberships * 2) + 
              (group._count.posts * 3) +
              (group._count.events * 5) +
              (group._count.listings * 4)

  // Adjust for group age (newer groups get a boost)
  if (daysOld <= 30) {
    score *= 1.5
  } else if (daysOld <= 90) {
    score *= 1.2
  }

  // Marketplace bonus
  if (group.settings.propertyListingEnabled ||
      group.settings.serviceListingEnabled ||
      group.settings.leisureListingEnabled) {
    score *= 1.3
  }

  return Math.round(score)
}