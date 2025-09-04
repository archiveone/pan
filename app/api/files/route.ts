import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// GET /api/files - Get all files for the current user
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
    const folder = searchParams.get('folder');
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    const files = await prisma.file.findMany({
      where: {
        userId: session.user.id,
        ...(folder && { folder }),
        ...(type && { type }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
        deleted: false,
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
          },
        },
        lead: {
          select: {
            id: true,
            name: true,
          },
        },
        contact: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(files);
  } catch (error) {
    console.error('Files fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}

// POST /api/files - Create a new file record
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
      name,
      url,
      type,
      size,
      folder,
      description,
      propertyId,
      leadId,
      contactId,
    } = body;

    // Validate required fields
    if (!name || !url || !type) {
      return NextResponse.json(
        { error: 'Name, URL, and type are required' },
        { status: 400 }
      );
    }

    // Create file record
    const file = await prisma.file.create({
      data: {
        name,
        url,
        type,
        size,
        folder: folder || 'general',
        description,
        userId: session.user.id,
        ...(propertyId && { propertyId }),
        ...(leadId && { leadId }),
        ...(contactId && { contactId }),
      },
    });

    return NextResponse.json(file);
  } catch (error) {
    console.error('File creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create file record' },
      { status: 500 }
    );
  }
}

// PATCH /api/files/[id] - Update a file record
export async function PATCH(
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

    const body = await req.json();
    const { name, description, folder } = body;

    // Verify ownership
    const existingFile = await prisma.file.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });

    if (!existingFile || existingFile.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this file' },
        { status: 403 }
      );
    }

    // Update file record
    const file = await prisma.file.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(folder && { folder }),
      },
    });

    return NextResponse.json(file);
  } catch (error) {
    console.error('File update error:', error);
    return NextResponse.json(
      { error: 'Failed to update file' },
      { status: 500 }
    );
  }
}

// DELETE /api/files/[id] - Delete a file
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
    const existingFile = await prisma.file.findUnique({
      where: { id: params.id },
      select: { userId: true, url: true },
    });

    if (!existingFile || existingFile.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to delete this file' },
        { status: 403 }
      );
    }

    // Extract S3 key from URL
    const url = new URL(existingFile.url);
    const key = url.pathname.substring(1); // Remove leading slash

    // Delete from S3
    try {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET!,
          Key: key,
        })
      );
    } catch (error) {
      console.error('S3 deletion error:', error);
      // Continue with database deletion even if S3 deletion fails
    }

    // Soft delete in database
    await prisma.file.update({
      where: { id: params.id },
      data: {
        deleted: true,
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('File deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}