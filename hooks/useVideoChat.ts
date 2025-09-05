import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/use-toast';

interface UseVideoChatProps {
  onError?: (error: Error) => void;
}

interface Room {
  sid: string;
  name: string;
  maxParticipants: number;
  type: string;
  status: string;
  duration?: number;
}

interface VideoTokenResponse {
  token: string;
  room: Room;
}

export function useVideoChat({ onError }: UseVideoChatProps = {}) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [activeRooms, setActiveRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch active rooms
  const fetchActiveRooms = useCallback(async () => {
    try {
      const response = await fetch('/api/video/token');
      if (!response.ok) throw new Error('Failed to fetch rooms');
      
      const data = await response.json();
      setActiveRooms(data.rooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      onError?.(error as Error);
      toast({
        title: 'Error',
        description: 'Failed to fetch active rooms',
        variant: 'destructive',
      });
    }
  }, [onError, toast]);

  // Join or create a room
  const joinRoom = useCallback(async (roomName: string) => {
    if (!session?.user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to join a video chat',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/video/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomName }),
      });

      if (!response.ok) {
        throw new Error('Failed to join room');
      }

      const data: VideoTokenResponse = await response.json();
      setToken(data.token);
      setCurrentRoom(data.room);

      return data;
    } catch (error) {
      console.error('Error joining room:', error);
      onError?.(error as Error);
      toast({
        title: 'Error',
        description: 'Failed to join video chat room',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [session, onError, toast]);

  // Leave/close room
  const leaveRoom = useCallback(async () => {
    if (!currentRoom) return;

    try {
      const response = await fetch('/api/video/token', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomName: currentRoom.name }),
      });

      if (!response.ok) {
        throw new Error('Failed to close room');
      }

      setCurrentRoom(null);
      setToken(null);

      toast({
        title: 'Success',
        description: 'Left video chat room',
      });
    } catch (error) {
      console.error('Error leaving room:', error);
      onError?.(error as Error);
      toast({
        title: 'Error',
        description: 'Failed to leave video chat room properly',
        variant: 'destructive',
      });
    }
  }, [currentRoom, onError, toast]);

  // Generate a unique room name
  const generateRoomName = useCallback((prefix: string = 'room') => {
    const timestamp = new Date().getTime();
    const random = Math.random().toString(36).substring(2, 15);
    return \`\${prefix}-\${timestamp}-\${random}\`;
  }, []);

  // Check if user can join a specific room
  const canJoinRoom = useCallback((room: Room) => {
    if (!session?.user) return false;
    if (room.status !== 'in-progress') return false;
    if (room.maxParticipants && room.maxParticipants <= 0) return false;
    return true;
  }, [session]);

  // Refresh active rooms periodically
  useEffect(() => {
    if (!session?.user) return;

    fetchActiveRooms();
    const interval = setInterval(fetchActiveRooms, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [session, fetchActiveRooms]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentRoom) {
        leaveRoom();
      }
    };
  }, [currentRoom, leaveRoom]);

  return {
    isLoading,
    activeRooms,
    currentRoom,
    token,
    joinRoom,
    leaveRoom,
    generateRoomName,
    canJoinRoom,
    fetchActiveRooms,
  };
}

// Types for external use
export type { Room };