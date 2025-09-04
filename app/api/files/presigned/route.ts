import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import path from 'path';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_FILE_TYPES = [
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // Others
  'text/plain',
  'text/csv',
];

// POST /api/files/presigned - Get presigned URL for file upload
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
    const { fileName, fileType, folder = 'general' } = body;

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(fileType)) {
      return NextResponse.json(
        { error: 'File type not allowed' },
        { status: 400 }
      );
    }

    // Generate unique file key
    const fileExtension = path.extname(fileName);
    const randomString = crypto.randomBytes(16).toString('hex');
    const key = `${folder}/${session.user.id}/${Date.now()}-${randomString}${fileExtension}`;

    // Create command for S3 upload
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      ContentType: fileType,
      Metadata: {
        userId: session.user.id,
        originalName: fileName,
        uploadedAt: new Date().toISOString(),
      },
      // Set maximum file size
      ContentLength: MAX_FILE_SIZE,
    });

    // Generate presigned URL
    const url = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // URL expires in 1 hour
    });

    // Return presigned URL and fields
    return NextResponse.json({
      url,
      fields: {
        key,
        'Content-Type': fileType,
        'x-amz-meta-userid': session.user.id,
        'x-amz-meta-originalname': fileName,
        'x-amz-meta-uploadedat': new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Presigned URL generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}

// Utility function to validate file size (used by client)
export function validateFileSize(size: number): boolean {
  return size <= MAX_FILE_SIZE;
}

// Utility function to validate file type (used by client)
export function validateFileType(type: string): boolean {
  return ALLOWED_FILE_TYPES.includes(type);
}

// Utility function to format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// Utility function to get file type category
export function getFileCategory(type: string): string {
  if (type.startsWith('image/')) return 'image';
  if (type.includes('pdf')) return 'pdf';
  if (type.includes('word')) return 'document';
  if (type.includes('excel') || type.includes('spreadsheet')) return 'spreadsheet';
  if (type.includes('text')) return 'text';
  return 'other';
}

// Utility function to get file icon name (for use with Lucide icons)
export function getFileIcon(type: string): string {
  const category = getFileCategory(type);
  switch (category) {
    case 'image':
      return 'image';
    case 'pdf':
      return 'file-text';
    case 'document':
      return 'file-text';
    case 'spreadsheet':
      return 'table';
    case 'text':
      return 'file-text';
    default:
      return 'file';
  }
}