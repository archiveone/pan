import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AutoModerationRule } from '@/lib/types/reviewModeration';

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is a moderator
    const moderator = await prisma.moderator.findUnique({
      where: { userId: session.user.id },
    });

    if (!moderator) {
      return NextResponse.json(
        { error: 'Not authorized to access moderation rules' },
        { status: 403 }
      );
    }

    // Get all rules
    const rules = await prisma.autoModerationRule.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(rules);
  } catch (error) {
    console.error('Error getting moderation rules:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is a moderator
    const moderator = await prisma.moderator.findUnique({
      where: { userId: session.user.id },
    });

    if (!moderator) {
      return NextResponse.json(
        { error: 'Not authorized to create moderation rules' },
        { status: 403 }
      );
    }

    const body: Omit<AutoModerationRule, 'id' | 'createdAt' | 'updatedAt'> =
      await request.json();

    // Validate rule configuration
    if (body.type === 'keyword' && (!body.config.keywords || body.config.keywords.length === 0)) {
      return NextResponse.json(
        { error: 'Keyword rules must include at least one keyword' },
        { status: 400 }
      );
    }

    if (body.type === 'pattern' && !body.config.pattern) {
      return NextResponse.json(
        { error: 'Pattern rules must include a pattern' },
        { status: 400 }
      );
    }

    if (body.type === 'ai' && (!body.config.aiModel || !body.config.threshold)) {
      return NextResponse.json(
        { error: 'AI rules must include a model and threshold' },
        { status: 400 }
      );
    }

    // Create rule
    const rule = await prisma.autoModerationRule.create({
      data: {
        ...body,
        createdBy: session.user.id,
      },
    });

    // Create audit log
    await prisma.moderationLog.create({
      data: {
        moderatorId: session.user.id,
        action: 'create_rule',
        note: `Created auto-moderation rule: ${rule.name}`,
      },
    });

    return NextResponse.json(rule);
  } catch (error) {
    console.error('Error creating moderation rule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is a moderator
    const moderator = await prisma.moderator.findUnique({
      where: { userId: session.user.id },
    });

    if (!moderator) {
      return NextResponse.json(
        { error: 'Not authorized to update moderation rules' },
        { status: 403 }
      );
    }

    const { id, ...updates }: Partial<AutoModerationRule> & { id: string } =
      await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Rule ID is required' },
        { status: 400 }
      );
    }

    // Get existing rule
    const existingRule = await prisma.autoModerationRule.findUnique({
      where: { id },
    });

    if (!existingRule) {
      return NextResponse.json(
        { error: 'Rule not found' },
        { status: 404 }
      );
    }

    // Update rule
    const rule = await prisma.autoModerationRule.update({
      where: { id },
      data: {
        ...updates,
        updatedAt: new Date().toISOString(),
      },
    });

    // Create audit log
    await prisma.moderationLog.create({
      data: {
        moderatorId: session.user.id,
        action: 'update_rule',
        note: `Updated auto-moderation rule: ${rule.name}`,
      },
    });

    return NextResponse.json(rule);
  } catch (error) {
    console.error('Error updating moderation rule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is a moderator
    const moderator = await prisma.moderator.findUnique({
      where: { userId: session.user.id },
    });

    if (!moderator) {
      return NextResponse.json(
        { error: 'Not authorized to delete moderation rules' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Rule ID is required' },
        { status: 400 }
      );
    }

    // Get existing rule
    const existingRule = await prisma.autoModerationRule.findUnique({
      where: { id },
    });

    if (!existingRule) {
      return NextResponse.json(
        { error: 'Rule not found' },
        { status: 404 }
      );
    }

    // Delete rule
    await prisma.autoModerationRule.delete({
      where: { id },
    });

    // Create audit log
    await prisma.moderationLog.create({
      data: {
        moderatorId: session.user.id,
        action: 'delete_rule',
        note: `Deleted auto-moderation rule: ${existingRule.name}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting moderation rule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}