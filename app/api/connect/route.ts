import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { pusher } from '@/lib/pusher'

// Create social post or CRM group
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { type } = body // POST or GROUP

    if (type === 'POST') {
      const { 
        content,
        media,
        visibility, // PUBLIC, CONNECTIONS, PRIVATE
        tags,
        linkedItems, // Properties, Services, Leisure items
        location,
      } = body

      // Create social post with Dublin region tracking
      const post = await prisma.post.create({
        data: {
          userId: session.user.id,
          content,
          media,
          visibility,
          tags,
          linkedItems,
          location: location ? {
            ...location,
            county: 'Dublin',
            dublinRegion: location.dublinRegion,
          } : undefined,
          // Track post activity
          activities: {
            create: {
              type: 'POST_CREATED',
              userId: session.user.id,
              description: 'Social post created',
              metadata: {
                visibility,
                tags,
                dublinRegion: location?.dublinRegion,
              },
            }
          },
        },
        include: {
          user: {
            select: {
              name: true,
              image: true,
              role: true,
              agentProfile: true,
              professionalProfile: true,
            }
          },
        },
      })

      // Notify connections based on visibility
      if (visibility !== 'PRIVATE') {
        const connections = await prisma.connection.findMany({
          where: {
            OR: [
              { followerId: session.user.id },
              { followingId: session.user.id },
            ],
            status: 'ACCEPTED',
          },
          select: {
            followerId: true,
            followingId: true,
          },
        })

        const connectionIds = connections
          .map(c => c.followerId === session.user.id ? c.followingId : c.followerId)

        await Promise.all(connectionIds.map(userId =>
          pusher.trigger(
            `private-user-${userId}`,
            'new-post',
            {
              postId: post.id,
              userName: session.user.name,
              content: content.substring(0, 100),
              timestamp: new Date().toISOString(),
            }
          )
        ))
      }

      return NextResponse.json({
        success: true,
        post,
      })

    } else if (type === 'GROUP') {
      const {
        name,
        description,
        category, // PROPERTY_NETWORK, TRADE_GUILD, COMMUNITY
        visibility, // PUBLIC, PRIVATE, INVITE_ONLY
        location,
        rules,
        initialMembers,
      } = body

      // Create CRM group with Dublin focus
      const group = await prisma.crmGroup.create({
        data: {
          name,
          description,
          category,
          visibility,
          location: {
            ...location,
            county: 'Dublin',
            dublinRegion: location.dublinRegion,
          },
          rules,
          // Add creator as admin
          members: {
            create: [
              {
                userId: session.user.id,
                role: 'ADMIN',
                status: 'ACTIVE',
              },
              ...initialMembers.map((member: any) => ({
                userId: member.userId,
                role: member.role || 'MEMBER',
                status: 'PENDING',
              })),
            ],
          },
          // Track group activity
          activities: {
            create: {
              type: 'GROUP_CREATED',
              userId: session.user.id,
              description: 'CRM group created',
              metadata: {
                category,
                visibility,
                dublinRegion: location.dublinRegion,
              },
            }
          },
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                  image: true,
                  role: true,
                },
              },
            },
          },
        },
      })

      // Send invitations to initial members
      await Promise.all(initialMembers.map((member: any) =>
        Promise.all([
          pusher.trigger(
            `private-user-${member.userId}`,
            'group-invitation',
            {
              groupId: group.id,
              groupName: name,
              invitedBy: session.user.name,
              timestamp: new Date().toISOString(),
            }
          ),
          prisma.notification.create({
            data: {
              userId: member.userId,
              type: 'GROUP_INVITATION',
              title: 'New Group Invitation',
              content: `${session.user.name} has invited you to join "${name}"`,
              metadata: {
                groupId: group.id,
                category,
                dublinRegion: location.dublinRegion,
              },
            },
          }),
        ])
      ))

      return NextResponse.json({
        success: true,
        group,
      })
    }

  } catch (error) {
    console.error('[CREATE_CONNECT_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Update post/group or manage connections
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { type, action } = body

    if (type === 'POST') {
      const { postId, content, visibility, tags } = body

      const post = await prisma.post.update({
        where: {
          id: postId,
          userId: session.user.id,
        },
        data: {
          content,
          visibility,
          tags,
          activities: {
            create: {
              type: 'POST_UPDATED',
              userId: session.user.id,
              description: 'Post updated',
              metadata: { visibility, tags },
            }
          },
        },
      })

      return NextResponse.json({
        success: true,
        post,
      })

    } else if (type === 'GROUP') {
      const { groupId } = body

      if (action === 'UPDATE') {
        const { name, description, visibility, rules } = body

        const group = await prisma.crmGroup.update({
          where: {
            id: groupId,
            members: {
              some: {
                userId: session.user.id,
                role: 'ADMIN',
              },
            },
          },
          data: {
            name,
            description,
            visibility,
            rules,
            activities: {
              create: {
                type: 'GROUP_UPDATED',
                userId: session.user.id,
                description: 'Group settings updated',
                metadata: { visibility },
              }
            },
          },
        })

        return NextResponse.json({
          success: true,
          group,
        })

      } else if (action === 'MANAGE_MEMBER') {
        const { memberId, role, status } = body

        const membership = await prisma.groupMember.update({
          where: {
            groupId_userId: {
              groupId,
              userId: memberId,
            },
          },
          data: {
            role,
            status,
            activities: {
              create: {
                type: 'MEMBER_UPDATED',
                userId: session.user.id,
                description: `Member ${status.toLowerCase()}`,
                metadata: { role, status },
              }
            },
          },
        })

        return NextResponse.json({
          success: true,
          membership,
        })
      }
    } else if (type === 'CONNECTION') {
      const { userId, action } = body

      if (action === 'CONNECT') {
        const connection = await prisma.connection.create({
          data: {
            followerId: session.user.id,
            followingId: userId,
            status: 'PENDING',
          },
        })

        await Promise.all([
          pusher.trigger(
            `private-user-${userId}`,
            'connection-request',
            {
              connectionId: connection.id,
              userName: session.user.name,
              timestamp: new Date().toISOString(),
            }
          ),
          prisma.notification.create({
            data: {
              userId,
              type: 'CONNECTION_REQUEST',
              title: 'New Connection Request',
              content: `${session.user.name} wants to connect with you`,
              metadata: {
                connectionId: connection.id,
                userRole: session.user.role,
              },
            },
          }),
        ])

        return NextResponse.json({
          success: true,
          connection,
        })

      } else if (action === 'ACCEPT' || action === 'REJECT') {
        const connection = await prisma.connection.update({
          where: {
            followerId_followingId: {
              followerId: userId,
              followingId: session.user.id,
            },
            status: 'PENDING',
          },
          data: {
            status: action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED',
          },
        })

        if (action === 'ACCEPT') {
          await Promise.all([
            pusher.trigger(
              `private-user-${userId}`,
              'connection-accepted',
              {
                connectionId: connection.id,
                userName: session.user.name,
                timestamp: new Date().toISOString(),
              }
            ),
            prisma.notification.create({
              data: {
                userId,
                type: 'CONNECTION_ACCEPTED',
                title: 'Connection Request Accepted',
                content: `${session.user.name} has accepted your connection request`,
                metadata: {
                  connectionId: connection.id,
                  userRole: session.user.role,
                },
              },
            }),
          ])
        }

        return NextResponse.json({
          success: true,
          connection,
        })
      }
    }

  } catch (error) {
    console.error('[UPDATE_CONNECT_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Get social feed, group content, or connections
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') // FEED, GROUP, CONNECTIONS
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (type === 'FEED') {
      // Get posts from connections and public posts
      const connections = await prisma.connection.findMany({
        where: {
          OR: [
            { followerId: session.user.id },
            { followingId: session.user.id },
          ],
          status: 'ACCEPTED',
        },
        select: {
          followerId: true,
          followingId: true,
        },
      })

      const connectionIds = connections
        .map(c => c.followerId === session.user.id ? c.followingId : c.followerId)

      const posts = await prisma.post.findMany({
        where: {
          OR: [
            { userId: { in: [...connectionIds, session.user.id] } },
            { visibility: 'PUBLIC' },
          ],
        },
        include: {
          user: {
            select: {
              name: true,
              image: true,
              role: true,
              agentProfile: true,
              professionalProfile: true,
            }
          },
          reactions: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
          comments: {
            include: {
              user: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 3,
          },
          _count: {
            select: {
              reactions: true,
              comments: true,
            }
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      })

      return NextResponse.json({
        posts,
        pagination: {
          page,
          limit,
          hasMore: posts.length === limit,
        },
      })

    } else if (type === 'GROUP') {
      const groupId = searchParams.get('groupId')
      if (!groupId) {
        return new NextResponse('Group ID required', { status: 400 })
      }

      const group = await prisma.crmGroup.findUnique({
        where: { id: groupId },
        include: {
          members: {
            include: {
              user: {
                select: {
                  name: true,
                  image: true,
                  role: true,
                },
              },
            },
          },
          posts: {
            orderBy: {
              createdAt: 'desc',
            },
            take: limit,
            skip: (page - 1) * limit,
            include: {
              user: {
                select: {
                  name: true,
                  image: true,
                },
              },
              comments: {
                include: {
                  user: {
                    select: {
                      name: true,
                      image: true,
                    },
                  },
                },
                orderBy: {
                  createdAt: 'desc',
                },
                take: 3,
              },
              _count: {
                select: {
                  comments: true,
                },
              },
            },
          },
          activities: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 10,
          },
        },
      })

      if (!group) {
        return new NextResponse('Group not found', { status: 404 })
      }

      return NextResponse.json({
        group,
        pagination: {
          page,
          limit,
          hasMore: group.posts.length === limit,
        },
      })

    } else if (type === 'CONNECTIONS') {
      const connections = await prisma.connection.findMany({
        where: {
          OR: [
            { followerId: session.user.id },
            { followingId: session.user.id },
          ],
        },
        include: {
          follower: {
            select: {
              name: true,
              image: true,
              role: true,
              agentProfile: true,
              professionalProfile: true,
            },
          },
          following: {
            select: {
              name: true,
              image: true,
              role: true,
              agentProfile: true,
              professionalProfile: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      return NextResponse.json({
        connections: connections.map(c => ({
          ...c,
          user: c.followerId === session.user.id ? c.following : c.follower,
        })),
      })
    }

  } catch (error) {
    console.error('[GET_CONNECT_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}