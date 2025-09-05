import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { pusher } from '@/lib/pusher';

// Get group members
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get('groupId');
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    if (!groupId) {
      return NextResponse.json(
        { error: 'Group ID is required' },
        { status: 400 }
      );
    }

    // Check if user is a member
    const userMembership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: session.user.id
      }
    });

    if (!userMembership) {
      return NextResponse.json(
        { error: 'You must be a member to view group members' },
        { status: 403 }
      );
    }

    // Build where clause
    const where: any = { groupId };
    if (role) where.role = role;
    if (search) {
      where.user = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { username: { contains: search, mode: 'insensitive' } }
        ]
      };
    }

    // Get members
    const members = await prisma.groupMember.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
            bio: true
          }
        }
      },
      orderBy: [
        { role: 'asc' },
        { joinedAt: 'desc' }
      ],
      skip,
      take: limit
    });

    // Get total count for pagination
    const totalCount = await prisma.groupMember.count({ where });

    return NextResponse.json({
      members,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching group members:', error);
    return NextResponse.json(
      { error: 'Error fetching group members' },
      { status: 500 }
    );
  }
}

// Add member to group
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { groupId, userId, role = 'member' } = body;

    // Check if user is admin
    const adminMembership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: session.user.id,
        role: 'admin'
      }
    });

    if (!adminMembership) {
      return NextResponse.json(
        { error: 'Only group admins can add members' },
        { status: 403 }
      );
    }

    // Check if user is already a member
    const existingMember = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId
      }
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this group' },
        { status: 400 }
      );
    }

    // Add member
    const member = await prisma.groupMember.create({
      data: {
        groupId,
        userId,
        role
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true
          }
        },
        group: true
      }
    });

    // Create notification for added user
    await prisma.notification.create({
      data: {
        type: 'group_invite',
        content: \`You have been added to \${member.group.name}\`,
        userId,
        senderId: session.user.id
      }
    });

    // Trigger real-time update
    await pusher.trigger(\`private-group-\${groupId}\`, 'member-added', {
      member
    });

    return NextResponse.json({ member });
  } catch (error) {
    console.error('Error adding group member:', error);
    return NextResponse.json(
      { error: 'Error adding group member' },
      { status: 500 }
    );
  }
}

// Update member role
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { groupId, userId, role } = body;

    // Check if user is admin
    const adminMembership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: session.user.id,
        role: 'admin'
      }
    });

    if (!adminMembership) {
      return NextResponse.json(
        { error: 'Only group admins can update member roles' },
        { status: 403 }
      );
    }

    // Update member role
    const member = await prisma.groupMember.update({
      where: {
        groupId_userId: {
          groupId,
          userId
        }
      },
      data: { role },
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
    });

    // Trigger real-time update
    await pusher.trigger(\`private-group-\${groupId}\`, 'member-updated', {
      member
    });

    return NextResponse.json({ member });
  } catch (error) {
    console.error('Error updating group member:', error);
    return NextResponse.json(
      { error: 'Error updating group member' },
      { status: 500 }
    );
  }
}

// Remove member from group
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get('groupId');
    const userId = searchParams.get('userId');

    if (!groupId || !userId) {
      return NextResponse.json(
        { error: 'Group ID and User ID are required' },
        { status: 400 }
      );
    }

    // Check if user is admin or removing themselves
    const userMembership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: session.user.id
      }
    });

    if (!userMembership || (userMembership.role !== 'admin' && session.user.id !== userId)) {
      return NextResponse.json(
        { error: 'Only group admins can remove members' },
        { status: 403 }
      );
    }

    // Remove member
    await prisma.groupMember.delete({
      where: {
        groupId_userId: {
          groupId,
          userId
        }
      }
    });

    // Trigger real-time update
    await pusher.trigger(\`private-group-\${groupId}\`, 'member-removed', {
      userId
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing group member:', error);
    return NextResponse.json(
      { error: 'Error removing group member' },
      { status: 500 }
    );
  }
}