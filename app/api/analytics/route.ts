import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

// GET /api/analytics - Get analytics data
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
    const period = searchParams.get('period') || '6'; // Default 6 months
    const type = searchParams.get('type') || 'all';

    const endDate = endOfMonth(new Date());
    const startDate = startOfMonth(subMonths(endDate, parseInt(period)));

    // Get all required analytics data
    const [
      propertyStats,
      leadStats,
      taskStats,
      fileStats,
      messageStats,
      revenueStats,
    ] = await Promise.all([
      getPropertyStats(session.user.id, startDate, endDate),
      getLeadStats(session.user.id, startDate, endDate),
      getTaskStats(session.user.id, startDate, endDate),
      getFileStats(session.user.id, startDate, endDate),
      getMessageStats(session.user.id, startDate, endDate),
      getRevenueStats(session.user.id, startDate, endDate),
    ]);

    // Return specific stats based on type
    switch (type) {
      case 'properties':
        return NextResponse.json(propertyStats);
      case 'leads':
        return NextResponse.json(leadStats);
      case 'tasks':
        return NextResponse.json(taskStats);
      case 'files':
        return NextResponse.json(fileStats);
      case 'messages':
        return NextResponse.json(messageStats);
      case 'revenue':
        return NextResponse.json(revenueStats);
      default:
        return NextResponse.json({
          properties: propertyStats,
          leads: leadStats,
          tasks: taskStats,
          files: fileStats,
          messages: messageStats,
          revenue: revenueStats,
        });
    }
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

// Get property-related statistics
async function getPropertyStats(userId: string, startDate: Date, endDate: Date) {
  const properties = await prisma.property.findMany({
    where: {
      userId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      id: true,
      status: true,
      price: true,
      type: true,
      createdAt: true,
    },
  });

  // Monthly trends
  const monthlyTrends = Array.from({ length: 6 }, (_, i) => {
    const month = subMonths(endDate, i);
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    return {
      month: format(month, 'MMM yyyy'),
      total: properties.filter(p =>
        p.createdAt >= monthStart && p.createdAt <= monthEnd
      ).length,
      value: properties
        .filter(p => p.createdAt >= monthStart && p.createdAt <= monthEnd)
        .reduce((sum, p) => sum + (p.price || 0), 0),
    };
  }).reverse();

  return {
    total: properties.length,
    byStatus: properties.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byType: properties.reduce((acc, p) => {
      acc[p.type] = (acc[p.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    totalValue: properties.reduce((sum, p) => sum + (p.price || 0), 0),
    monthlyTrends,
  };
}

// Get lead-related statistics
async function getLeadStats(userId: string, startDate: Date, endDate: Date) {
  const leads = await prisma.lead.findMany({
    where: {
      userId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      id: true,
      status: true,
      source: true,
      createdAt: true,
      convertedAt: true,
    },
  });

  const monthlyTrends = Array.from({ length: 6 }, (_, i) => {
    const month = subMonths(endDate, i);
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    const monthLeads = leads.filter(l =>
      l.createdAt >= monthStart && l.createdAt <= monthEnd
    );
    
    return {
      month: format(month, 'MMM yyyy'),
      total: monthLeads.length,
      converted: monthLeads.filter(l => l.convertedAt).length,
    };
  }).reverse();

  return {
    total: leads.length,
    converted: leads.filter(l => l.convertedAt).length,
    conversionRate: leads.length
      ? (leads.filter(l => l.convertedAt).length / leads.length) * 100
      : 0,
    byStatus: leads.reduce((acc, l) => {
      acc[l.status] = (acc[l.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    bySource: leads.reduce((acc, l) => {
      acc[l.source] = (acc[l.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    monthlyTrends,
  };
}

// Get task-related statistics
async function getTaskStats(userId: string, startDate: Date, endDate: Date) {
  const tasks = await prisma.task.findMany({
    where: {
      userId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      id: true,
      completed: true,
      priority: true,
      dueDate: true,
      completedAt: true,
      createdAt: true,
    },
  });

  const monthlyTrends = Array.from({ length: 6 }, (_, i) => {
    const month = subMonths(endDate, i);
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    const monthTasks = tasks.filter(t =>
      t.createdAt >= monthStart && t.createdAt <= monthEnd
    );
    
    return {
      month: format(month, 'MMM yyyy'),
      total: monthTasks.length,
      completed: monthTasks.filter(t => t.completed).length,
    };
  }).reverse();

  return {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    completionRate: tasks.length
      ? (tasks.filter(t => t.completed).length / tasks.length) * 100
      : 0,
    byPriority: tasks.reduce((acc, t) => {
      acc[t.priority] = (acc[t.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    overdue: tasks.filter(t =>
      !t.completed && t.dueDate < new Date()
    ).length,
    monthlyTrends,
  };
}

// Get file-related statistics
async function getFileStats(userId: string, startDate: Date, endDate: Date) {
  const files = await prisma.file.findMany({
    where: {
      userId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      id: true,
      type: true,
      size: true,
      folder: true,
      createdAt: true,
    },
  });

  const monthlyTrends = Array.from({ length: 6 }, (_, i) => {
    const month = subMonths(endDate, i);
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    const monthFiles = files.filter(f =>
      f.createdAt >= monthStart && f.createdAt <= monthEnd
    );
    
    return {
      month: format(month, 'MMM yyyy'),
      total: monthFiles.length,
      size: monthFiles.reduce((sum, f) => sum + (f.size || 0), 0),
    };
  }).reverse();

  return {
    total: files.length,
    totalSize: files.reduce((sum, f) => sum + (f.size || 0), 0),
    byType: files.reduce((acc, f) => {
      acc[f.type] = (acc[f.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byFolder: files.reduce((acc, f) => {
      acc[f.folder] = (acc[f.folder] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    monthlyTrends,
  };
}

// Get message-related statistics
async function getMessageStats(userId: string, startDate: Date, endDate: Date) {
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId },
        { receiverId: userId },
      ],
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      id: true,
      senderId: true,
      receiverId: true,
      read: true,
      createdAt: true,
    },
  });

  const monthlyTrends = Array.from({ length: 6 }, (_, i) => {
    const month = subMonths(endDate, i);
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    const monthMessages = messages.filter(m =>
      m.createdAt >= monthStart && m.createdAt <= monthEnd
    );
    
    return {
      month: format(month, 'MMM yyyy'),
      sent: monthMessages.filter(m => m.senderId === userId).length,
      received: monthMessages.filter(m => m.receiverId === userId).length,
    };
  }).reverse();

  return {
    total: messages.length,
    sent: messages.filter(m => m.senderId === userId).length,
    received: messages.filter(m => m.receiverId === userId).length,
    unread: messages.filter(m =>
      m.receiverId === userId && !m.read
    ).length,
    monthlyTrends,
  };
}

// Get revenue-related statistics
async function getRevenueStats(userId: string, startDate: Date, endDate: Date) {
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      id: true,
      amount: true,
      type: true,
      status: true,
      createdAt: true,
    },
  });

  const monthlyTrends = Array.from({ length: 6 }, (_, i) => {
    const month = subMonths(endDate, i);
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    const monthTransactions = transactions.filter(t =>
      t.createdAt >= monthStart && t.createdAt <= monthEnd
    );
    
    return {
      month: format(month, 'MMM yyyy'),
      revenue: monthTransactions.reduce((sum, t) => sum + t.amount, 0),
      count: monthTransactions.length,
    };
  }).reverse();

  return {
    totalRevenue: transactions.reduce((sum, t) => sum + t.amount, 0),
    totalTransactions: transactions.length,
    averageTransaction: transactions.length
      ? transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length
      : 0,
    byType: transactions.reduce((acc, t) => {
      acc[t.type] = (acc[t.type] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>),
    byStatus: transactions.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>),
    monthlyTrends,
  };
}