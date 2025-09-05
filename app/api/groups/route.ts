import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { pusher } from '@/lib/pusher';

// Get groups
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const privacy = searchParams.get('privacy');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (type) where.type = type;
    if (privacy) where.privacy = privacy;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get groups with members count
    const groups = await prisma.group.findMany({
      where,
      include: {
        _count: {
          select: { members: true }
        },
        members: {
          where: { userId: session.user.id },
          select: { role: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    // Get total count for pagination
    const totalCount = await prisma.group.count({ where });

    return NextResponse.json({
      groups,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      { error: 'Error fetching groups' },
      { status: 500 }
    );
  }
}

// Create a new group
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, type, privacy, image } = body;

    // Create group and add creator as admin
    const group = await prisma.group.create({
      data: {
        name,
        description,
        type,
        privacy,
        image,
        members: {
          create: {
            userId: session.user.id,
            role: 'admin'
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                username: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({ group });
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json(
      { error: 'Error creating group' },
      { status: 500 }
    );
  }
}

// Update group details
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { groupId, name, description, type, privacy, image } = body;

    // Check if user is admin
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: session.user.id,
        role: 'admin'
      }
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Only group admins can update group details' },
        { status: 403 }
      );
    }

    // Update group
    const group = await prisma.group.update({
      where: { id: groupId },
      data: {
        name,
        description,
        type,
        privacy,
        image
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                username: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({ group });
  } catch (error) {
    console.error('Error updating group:', error);
    return NextResponse.json(
      { error: 'Error updating group' },
      { status: 500 }
    );
  }
}

// Delete group
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get('groupId');

    if (!groupId) {
      return NextResponse.json(
        { error: 'Group ID is required' },
        { status: 400 }
      );
    }

    // Check if user is admin
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: session.user.id,
        role: 'admin'
      }
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Only group admins can delete groups' },
        { status: 403 }
      );
    }

    // Delete group and all related data
    await prisma.$transaction([
      prisma.groupPost.deleteMany({ where: { groupId } }),
      prisma.groupMember.deleteMany({ where: { groupId } }),
      prisma.event.deleteMany({ where: { groupId } }),
      prisma.group.delete({ where: { id: groupId } })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting group:', error);
    return NextResponse.json(
      { error: 'Error deleting group' },
      { status: 500 }
    );
  }
}