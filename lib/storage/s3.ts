import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.S3_REGION || 'eu-west-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

// Allowed file types and their corresponding MIME types
const ALLOWED_FILE_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
};

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Generate a unique filename with original extension
function generateUniqueFilename(originalFilename: string, contentType: string): string {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(16).toString('hex');
  const extension = ALLOWED_FILE_TYPES[contentType as keyof typeof ALLOWED_FILE_TYPES];
  return `${timestamp}-${randomString}.${extension}`;
}

// Validate file type and size
export function validateFile(contentType: string, fileSize: number): boolean {
  if (!ALLOWED_FILE_TYPES[contentType as keyof typeof ALLOWED_FILE_TYPES]) {
    throw new Error('Invalid file type');
  }
  if (fileSize > MAX_FILE_SIZE) {
    throw new Error('File size exceeds limit');
  }
  return true;
}

// Generate presigned URL for file upload
export async function generatePresignedUploadUrl(
  contentType: string,
  fileSize: number,
  prefix: string = 'uploads'
): Promise<{ url: string; key: string }> {
  try {
    validateFile(contentType, fileSize);

    const key = `${prefix}/${generateUniqueFilename('file', contentType)}`;
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return { url, key };
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw error;
  }
}

// Delete file from S3
export async function deleteFile(key: string): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

// Get public URL for a file
export function getPublicUrl(key: string): string {
  return `https://${BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${key}`;
}

// Utility function to organize files by type
export function getFilePrefix(type: 'property' | 'service' | 'leisure' | 'profile'): string {
  const environment = process.env.NODE_ENV;
  return `${environment}/${type}`;
}

// Configuration validation
export function validateS3Config(): boolean {
  const requiredEnvVars = [
    'S3_BUCKET_NAME',
    'S3_ACCESS_KEY',
    'S3_SECRET_KEY',
    'S3_REGION',
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required S3 environment variables: ${missingVars.join(', ')}`);
  }

  return true;
}