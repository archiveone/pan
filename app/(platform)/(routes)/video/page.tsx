'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Video, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useVideoChat, type Room } from '@/hooks/useVideoChat';
import { VideoChat } from '@/components/video/VideoChat';

export default function VideoPage() {
  const { data: session } = useSession();
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [roomNameInput, setRoomNameInput] = useState('');
  const {
    isLoading,
    activeRooms,
    currentRoom,
    token,
    joinRoom,
    leaveRoom,
    generateRoomName,
    canJoinRoom,
  } = useVideoChat();

  const handleCreateRoom = async () => {
    const roomName = generateRoomName(session?.user?.name?.split(' ')[0].toLowerCase());
    const result = await joinRoom(roomName);
    if (result) {
      setIsJoinDialogOpen(false);
    }
  };

  const handleJoinRoom = async (roomName: string) => {
    const result = await joinRoom(roomName);
    if (result) {
      setIsJoinDialogOpen(false);
      setRoomNameInput('');
    }
  };

  return (
    <div className="h-full p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Video Chat</h1>
        <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Call
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start or Join a Video Call</DialogTitle>
              <DialogDescription>
                Create a new room or join an existing one by entering the room name.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Room Name</label>
                <Input
                  placeholder="Enter room name to join..."
                  value={roomNameInput}
                  onChange={(e) => setRoomNameInput(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsJoinDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  disabled={!roomNameInput}
                  onClick={() => handleJoinRoom(roomNameInput)}
                >
                  Join Room
                </Button>
                <Button
                  variant="default"
                  onClick={handleCreateRoom}
                >
                  Create New Room
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <AnimatePresence>
        {currentRoom && token ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="h-[calc(100vh-12rem)] rounded-lg overflow-hidden border"
          >
            <VideoChat
              roomName={currentRoom.name}
              token={token}
              onClose={leaveRoom}
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Quick Join Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Video className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Quick Join</h3>
                    <p className="text-sm text-muted-foreground">
                      Join a video call instantly
                    </p>
                  </div>
                </div>
                <Button
                  className="w-full mt-4"
                  onClick={handleCreateRoom}
                  disabled={isLoading}
                >
                  Start New Call
                </Button>
              </motion.div>

              {/* Active Rooms Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Active Rooms</h3>
                    <p className="text-sm text-muted-foreground">
                      {activeRooms.length} rooms available
                    </p>
                  </div>
                </div>
                <ScrollArea className="h-[200px] mt-4">
                  <div className="space-y-2">
                    {activeRooms.map((room: Room) => (
                      <div
                        key={room.sid}
                        className="p-3 rounded-lg border bg-background"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{room.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {room.maxParticipants} max participants
                            </p>
                          </div>
                          <Button
                            size="sm"
                            disabled={!canJoinRoom(room)}
                            onClick={() => handleJoinRoom(room.name)}
                          >
                            Join
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}