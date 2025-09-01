import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import sharp from 'sharp'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File
    const purpose = data.get('purpose') as string // 'listing', 'passport', 'license', 'identity'

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
    const filepath = join(process.cwd(), 'public/uploads', filename)

    // Process image if it's for listings
    if (purpose === 'listing' && file.type.startsWith('image/')) {
      const processedBuffer = await sharp(buffer)
        .resize(1200, 800, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer()
      
      await writeFile(filepath, processedBuffer)
    } else {
      await writeFile(filepath, buffer)
    }

    // Save document record if it's for verification
    if (purpose !== 'listing') {
      await prisma.document.create({
        data: {
          userId: session.user.id,
          filename: file.name,
          filepath: `/uploads/${filename}`,
          fileType: file.type,
          purpose
        }
      })
    }

    return NextResponse.json({
      success: true,
      filename,
      url: `/uploads/${filename}`
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
