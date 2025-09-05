import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import { v4 as uuidv4 } from 'uuid';
import { uploadToS3 } from './s3';

interface ProcessedMedia {
  url: string;
  type: string;
  width?: number;
  height?: number;
  duration?: number;
  thumbnailUrl?: string;
}

// Image processing configurations
const imageConfigs = {
  standard: {
    width: 1200,
    height: 1200,
    fit: 'inside' as const,
    withoutEnlargement: true
  },
  thumbnail: {
    width: 400,
    height: 400,
    fit: 'cover' as const
  },
  profile: {
    width: 400,
    height: 400,
    fit: 'cover' as const
  },
  banner: {
    width: 1500,
    height: 500,
    fit: 'cover' as const
  }
};

// Video processing configurations
const videoConfigs = {
  standard: {
    width: 1280,
    height: 720,
    videoBitrate: '2000k',
    audioBitrate: '128k'
  },
  thumbnail: {
    width: 400,
    height: 400
  }
};

// Supported formats
const supportedImageFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const supportedVideoFormats = ['video/mp4', 'video/quicktime', 'video/webm'];

/**
 * Process and optimize images
 */
export async function processImage(
  buffer: Buffer,
  mimeType: string,
  type: 'standard' | 'thumbnail' | 'profile' | 'banner' = 'standard'
): Promise<ProcessedMedia> {
  try {
    const config = imageConfigs[type];
    const format = mimeType === 'image/png' ? 'png' : 'jpeg';
    const quality = format === 'jpeg' ? 80 : undefined;

    // Process image
    const processedBuffer = await sharp(buffer)
      .resize(config.width, config.height, {
        fit: config.fit,
        withoutEnlargement: config.withoutEnlargement
      })
      [format]({ quality })
      .toBuffer();

    // Get dimensions
    const metadata = await sharp(processedBuffer).metadata();

    // Upload to S3
    const filename = \`\${uuidv4()}.\${format}\`;
    const url = await uploadToS3(
      processedBuffer,
      \`images/\${type}/\${filename}\`,
      \`image/\${format}\`
    );

    return {
      url,
      type: 'image',
      width: metadata.width,
      height: metadata.height
    };
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Failed to process image');
  }
}

/**
 * Process and optimize videos
 */
export async function processVideo(
  buffer: Buffer,
  mimeType: string
): Promise<ProcessedMedia> {
  try {
    const config = videoConfigs.standard;
    const tempPath = `/tmp/\${uuidv4()}`;
    const outputPath = \`\${tempPath}-processed.mp4\`;
    const thumbnailPath = \`\${tempPath}-thumbnail.jpg\`;

    // Save buffer to temp file
    await require('fs').promises.writeFile(tempPath, buffer);

    // Process video
    await new Promise((resolve, reject) => {
      ffmpeg(tempPath)
        .size(\`\${config.width}x\${config.height}\`)
        .videoBitrate(config.videoBitrate)
        .audioBitrate(config.audioBitrate)
        .format('mp4')
        .on('end', resolve)
        .on('error', reject)
        .save(outputPath);
    });

    // Generate thumbnail
    await new Promise((resolve, reject) => {
      ffmpeg(tempPath)
        .screenshots({
          timestamps: ['50%'],
          filename: thumbnailPath,
          size: \`\${videoConfigs.thumbnail.width}x\${videoConfigs.thumbnail.height}\`
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Get video metadata
    const metadata: any = await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(outputPath, (err, metadata) => {
        if (err) reject(err);
        else resolve(metadata);
      });
    });

    // Upload processed video and thumbnail
    const processedBuffer = await require('fs').promises.readFile(outputPath);
    const thumbnailBuffer = await require('fs').promises.readFile(thumbnailPath);

    const videoUrl = await uploadToS3(
      processedBuffer,
      \`videos/\${uuidv4()}.mp4\`,
      'video/mp4'
    );

    const thumbnailUrl = await uploadToS3(
      thumbnailBuffer,
      \`videos/thumbnails/\${uuidv4()}.jpg\`,
      'image/jpeg'
    );

    // Clean up temp files
    await Promise.all([
      require('fs').promises.unlink(tempPath),
      require('fs').promises.unlink(outputPath),
      require('fs').promises.unlink(thumbnailPath)
    ]);

    return {
      url: videoUrl,
      type: 'video',
      width: metadata.streams[0].width,
      height: metadata.streams[0].height,
      duration: metadata.format.duration,
      thumbnailUrl
    };
  } catch (error) {
    console.error('Error processing video:', error);
    throw new Error('Failed to process video');
  }
}

/**
 * Process any media file
 */
export async function processMedia(
  file: File,
  type: 'standard' | 'thumbnail' | 'profile' | 'banner' = 'standard'
): Promise<ProcessedMedia> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type.toLowerCase();

  // Validate file type
  if (!supportedImageFormats.includes(mimeType) && !supportedVideoFormats.includes(mimeType)) {
    throw new Error('Unsupported file type');
  }

  // Process based on type
  if (supportedImageFormats.includes(mimeType)) {
    return processImage(buffer, mimeType, type);
  } else {
    return processVideo(buffer, mimeType);
  }
}

/**
 * Generate blurhash placeholder for images
 */
export async function generateBlurhash(buffer: Buffer): Promise<string> {
  try {
    const { encode } = require('blurhash');
    
    // Resize image to smaller dimensions for blurhash
    const { data, info } = await sharp(buffer)
      .resize(32, 32, { fit: 'inside' })
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Generate blurhash
    const blurhash = encode(
      new Uint8ClampedArray(data),
      info.width,
      info.height,
      4,
      4
    );

    return blurhash;
  } catch (error) {
    console.error('Error generating blurhash:', error);
    return '';
  }
}

/**
 * Extract metadata from media
 */
export async function extractMetadata(buffer: Buffer, mimeType: string) {
  try {
    if (supportedImageFormats.includes(mimeType)) {
      const metadata = await sharp(buffer).metadata();
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: buffer.length
      };
    } else if (supportedVideoFormats.includes(mimeType)) {
      const metadata: any = await new Promise((resolve, reject) => {
        ffmpeg.ffprobe(buffer, (err, metadata) => {
          if (err) reject(err);
          else resolve(metadata);
        });
      });

      return {
        width: metadata.streams[0].width,
        height: metadata.streams[0].height,
        duration: metadata.format.duration,
        format: metadata.format.format_name,
        size: buffer.length
      };
    }
  } catch (error) {
    console.error('Error extracting metadata:', error);
    return null;
  }
}