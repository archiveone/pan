import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/crm/tasks - Get all tasks for the current user
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const completed = searchParams.get('completed');
    const priority = searchParams.get('priority');
    const dueDate = searchParams.get('dueDate');

    const tasks = await prisma.task.findMany({
      where: {
        userId: session.user.id,
        ...(completed !== null && { completed: completed === 'true' }),
        ...(priority && { priority: priority as any }),
        ...(dueDate && {
          dueDate: {
            lte: new Date(dueDate),
          },
        }),
      },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        contact: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        property: {
          select: {
            id: true,
            title: true,
            address: true,
          },
        },
      },
      orderBy: [
        {
          completed: 'asc',
        },
        {
          dueDate: 'asc',
        },
      ],
    });

    // Group tasks by due date
    const groupedTasks = tasks.reduce((acc, task) => {
      const date = new Date(task.dueDate).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(task);
      return acc;
    }, {} as Record<string, typeof tasks>);

    return NextResponse.json({
      tasks,
      groupedTasks,
    });
  } catch (error) {
    console.error('Task fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST /api/crm/tasks - Create a new task
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      dueDate,
      priority,
      leadId,
      contactId,
      propertyId,
    } = body;

    // Validate required fields
    if (!title || !dueDate) {
      return NextResponse.json(
        { error: 'Title and due date are required' },
        { status: 400 }
      );
    }

    // Create task
    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        priority: priority || 'MEDIUM',
        completed: false,
        userId: session.user.id,
        ...(leadId && { leadId }),
        ...(contactId && { contactId }),
        ...(propertyId && { propertyId }),
      },
    });

    // Create reminder notification
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'TASK',
        title: 'New Task Created',
        message: `Task "${title}" is due on ${new Date(dueDate).toLocaleDateString()}`,
        isRead: false,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Task creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

// PATCH /api/crm/tasks - Update a task
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id, ...updateData } = body;

    // Verify ownership
    const existingTask = await prisma.task.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingTask || existingTask.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this task' },
        { status: 403 }
      );
    }

    // Update task
    const task = await prisma.task.update({
      where: { id },
      data: updateData,
    });

    // If task is marked as completed, create a notification
    if (updateData.completed) {
      await prisma.notification.create({
        data: {
          userId: session.user.id,
          type: 'TASK',
          title: 'Task Completed',
          message: `Task "${task.title}" has been marked as completed`,
          isRead: false,
        },
      });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Task update error:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE /api/crm/tasks/[id] - Delete a task
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify ownership
    const existingTask = await prisma.task.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });

    if (!existingTask || existingTask.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to delete this task' },
        { status: 403 }
      );
    }

    // Delete task
    await prisma.task.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: 'Task deleted successfully',
      id: params.id,
    });
  } catch (error) {
    console.error('Task deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}