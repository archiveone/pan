import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import twilio from 'twilio';

const AccessToken = twilio.jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

// Initialize the Twilio client
const twilioClient = twilio(
  process.env.TWILIO_API_KEY,
  process.env.TWILIO_API_SECRET,
  { accountSid: process.env.TWILIO_ACCOUNT_SID }
);

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { roomName } = body;

    if (!roomName) {
      return NextResponse.json(
        { error: 'Room name is required' },
        { status: 400 }
      );
    }

    // Create or get room
    let room;
    try {
      // Try to create new room
      room = await twilioClient.video.v1.rooms.create({
        uniqueName: roomName,
        type: 'group',
        maxParticipants: Number(process.env.TWILIO_MAX_PARTICIPANTS) || 4,
      });
    } catch (error: any) {
      // If room already exists, fetch it
      if (error.code === 53113) {
        room = await twilioClient.video.v1.rooms(roomName).fetch();
      } else {
        throw error;
      }
    }

    // Create an access token
    const token = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_API_KEY!,
      process.env.TWILIO_API_SECRET!,
      {
        identity: session.user.id,
        ttl: 14400 // Token expires in 4 hours
      }
    );

    // Create a video grant for this specific room
    const videoGrant = new VideoGrant({
      room: roomName
    });

    // Add the grant to the token
    token.addGrant(videoGrant);

    // Return the token
    return NextResponse.json({
      token: token.toJwt(),
      room: {
        sid: room.sid,
        name: room.uniqueName,
        maxParticipants: room.maxParticipants,
        type: room.type,
        status: room.status
      }
    });
  } catch (error) {
    console.error('Error generating video token:', error);
    return NextResponse.json(
      { error: 'Failed to generate video token' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get active rooms
    const rooms = await twilioClient.video.v1.rooms
      .list({
        status: 'in-progress',
        limit: 20
      });

    return NextResponse.json({
      rooms: rooms.map(room => ({
        sid: room.sid,
        name: room.uniqueName,
        maxParticipants: room.maxParticipants,
        type: room.type,
        status: room.status,
        duration: room.duration
      }))
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { roomName } = body;

    if (!roomName) {
      return NextResponse.json(
        { error: 'Room name is required' },
        { status: 400 }
      );
    }

    // Complete (close) the room
    await twilioClient.video.v1.rooms(roomName)
      .update({ status: 'completed' });

    return NextResponse.json({
      message: 'Room closed successfully'
    });
  } catch (error) {
    console.error('Error closing room:', error);
    return NextResponse.json(
      { error: 'Failed to close room' },
      { status: 500 }
    );
  }
}