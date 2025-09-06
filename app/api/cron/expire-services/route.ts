import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// This endpoint should be called by a cron job every hour
export async function POST(request: Request) {
  try {
    // Verify cron secret to ensure only authorized calls
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find all active services that have expired
    const expiredServices = await prisma.service.findMany({
      where: {
        status: 'ACTIVE',
        paidUntil: {
          lt: new Date(),
        },
      },
    });

    // Update their status to EXPIRED
    const updatePromises = expiredServices.map((service) =>
      prisma.service.update({
        where: { id: service.id },
        data: { status: 'EXPIRED' },
      })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({
      message: `Updated ${expiredServices.length} expired services`,
      expiredCount: expiredServices.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in expire-services cron:', error);
    return NextResponse.json(
      { error: 'Failed to process expired services' },
      { status: 500 }
    );
  }
}

// Only allow POST requests
export async function GET() {
  return new Response('Method not allowed', { status: 405 });
}