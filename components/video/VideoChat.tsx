'use client';

import { useState, useEffect, useRef } from 'react';
import { connect, createLocalTracks, Room, LocalTrack, RemoteParticipant } from 'twilio-video';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Mic,
  MicOff,
  VideoOff,
  ScreenShare,
  ScreenShareOff,
  Settings,
  Users,
  MessageSquare,
  Phone,
  PhoneOff,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';

interface VideoChatProps {
  roomName: string;
  token: string;
  onClose: () => void;
  initialAudioEnabled?: boolean;
  initialVideoEnabled?: boolean;
}

interface Participant {
  identity: string;
  audioTrack?: MediaStreamTrack;
  videoTrack?: MediaStreamTrack;
}

export function VideoChat({
  roomName,
  token,
  onClose,
  initialAudioEnabled = true,
  initialVideoEnabled = true,
}: VideoChatProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<Map<string, Participant>>(new Map());
  const [isAudioEnabled, setIsAudioEnabled] = useState(initialAudioEnabled);
  const [isVideoEnabled, setIsVideoEnabled] = useState(initialVideoEnabled);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [availableDevices, setAvailableDevices] = useState({
    audioInput: [],
    videoInput: [],
    audioOutput: [],
  });
  const [selectedDevices, setSelectedDevices] = useState({
    audioInput: '',
    videoInput: '',
    audioOutput: '',
  });
  const [messages, setMessages] = useState<{ sender: string; text: string; timestamp: Date }[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize room and local tracks
  useEffect(() => {
    const initializeRoom = async () => {
      try {
        const tracks = await createLocalTracks({
          audio: initialAudioEnabled,
          video: initialVideoEnabled,
        });

        const newRoom = await connect(token, {
          name: roomName,
          tracks,
          dominantSpeaker: true,
        });

        setRoom(newRoom);

        // Set up event listeners
        newRoom.on('participantConnected', handleParticipantConnected);
        newRoom.on('participantDisconnected', handleParticipantDisconnected);
        newRoom.on('dominantSpeakerChanged', handleDominantSpeakerChanged);

        // Initialize with existing participants
        newRoom.participants.forEach(handleParticipantConnected);

        // Cleanup on unmount
        return () => {
          newRoom.disconnect();
        };
      } catch (error) {
        console.error('Error connecting to room:', error);
        toast({
          title: 'Connection Error',
          description: 'Failed to connect to video room. Please try again.',
          variant: 'destructive',
        });
      }
    };

    initializeRoom();
  }, [token, roomName]);

  // Handle participant events
  const handleParticipantConnected = (participant: RemoteParticipant) => {
    const newParticipant: Participant = {
      identity: participant.identity,
    };

    participant.tracks.forEach(publication => {
      if (publication.isSubscribed) {
        handleTrackSubscribed(publication.track);
      }
    });

    participant.on('trackSubscribed', handleTrackSubscribed);
    participant.on('trackUnsubscribed', handleTrackUnsubscribed);

    setParticipants(prev => new Map(prev.set(participant.identity, newParticipant)));
  };

  const handleParticipantDisconnected = (participant: RemoteParticipant) => {
    setParticipants(prev => {
      const newMap = new Map(prev);
      newMap.delete(participant.identity);
      return newMap;
    });
  };

  const handleTrackSubscribed = (track: LocalTrack) => {
    if (track.kind === 'audio' || track.kind === 'video') {
      setParticipants(prev => {
        const newMap = new Map(prev);
        const participant = newMap.get(track.name);
        if (participant) {
          participant[track.kind + 'Track'] = track;
          newMap.set(track.name, participant);
        }
        return newMap;
      });
    }
  };

  const handleTrackUnsubscribed = (track: LocalTrack) => {
    if (track.kind === 'audio' || track.kind === 'video') {
      setParticipants(prev => {
        const newMap = new Map(prev);
        const participant = newMap.get(track.name);
        if (participant) {
          delete participant[track.kind + 'Track'];
          newMap.set(track.name, participant);
        }
        return newMap;
      });
    }
  };

  const handleDominantSpeakerChanged = (participant: RemoteParticipant | null) => {
    if (participant) {
      // Update UI to highlight the dominant speaker
      const participantElement = document.getElementById(\`participant-\${participant.identity}\`);
      if (participantElement) {
        participantElement.classList.add('ring-2', 'ring-primary');
      }
    }
  };

  // Device management
  useEffect(() => {
    const getAvailableDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setAvailableDevices({
          audioInput: devices.filter(device => device.kind === 'audioinput'),
          videoInput: devices.filter(device => device.kind === 'videoinput'),
          audioOutput: devices.filter(device => device.kind === 'audiooutput'),
        });
      } catch (error) {
        console.error('Error getting devices:', error);
      }
    };

    getAvailableDevices();
    navigator.mediaDevices.addEventListener('devicechange', getAvailableDevices);

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', getAvailableDevices);
    };
  }, []);

  const switchDevice = async (kind: 'audio' | 'video', deviceId: string) => {
    if (!room) return;

    try {
      const track = await createLocalTracks({
        [kind]: { deviceId },
      });

      const currentTrack = Array.from(room.localParticipant.tracks.values())
        .find(publication => publication.track.kind === kind);

      if (currentTrack) {
        await room.localParticipant.unpublishTrack(currentTrack.track);
      }

      await room.localParticipant.publishTrack(track[0]);

      setSelectedDevices(prev => ({
        ...prev,
        [\`\${kind}Input\`]: deviceId,
      }));

      toast({
        title: 'Device Switched',
        description: \`Successfully switched \${kind} device\`,
      });
    } catch (error) {
      console.error(\`Error switching \${kind} device:\`, error);
      toast({
        title: 'Device Switch Failed',
        description: \`Failed to switch \${kind} device\`,
        variant: 'destructive',
      });
    }
  };

  // Media controls
  const toggleAudio = async () => {
    if (!room) return;

    room.localParticipant.tracks.forEach(publication => {
      if (publication.track.kind === 'audio') {
        if (isAudioEnabled) {
          publication.track.disable();
        } else {
          publication.track.enable();
        }
      }
    });

    setIsAudioEnabled(!isAudioEnabled);
  };

  const toggleVideo = async () => {
    if (!room) return;

    room.localParticipant.tracks.forEach(publication => {
      if (publication.track.kind === 'video') {
        if (isVideoEnabled) {
          publication.track.disable();
        } else {
          publication.track.enable();
        }
      }
    });

    setIsVideoEnabled(!isVideoEnabled);
  };

  const toggleScreenShare = async () => {
    if (!room) return;

    try {
      if (isScreenSharing) {
        room.localParticipant.tracks.forEach(publication => {
          if (publication.track.name === 'screen') {
            publication.track.stop();
            room.localParticipant.unpublishTrack(publication.track);
          }
        });
      } else {
        const screenTrack = await navigator.mediaDevices.getDisplayMedia();
        await room.localParticipant.publishTrack(screenTrack.getVideoTracks()[0]);
      }

      setIsScreenSharing(!isScreenSharing);
    } catch (error) {
      console.error('Error toggling screen share:', error);
      toast({
        title: 'Screen Share Error',
        description: 'Failed to toggle screen sharing',
        variant: 'destructive',
      });
    }
  };

  const toggleFullScreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  // Chat functionality
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !room) return;

    const message = {
      sender: room.localParticipant.identity,
      text: newMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, message]);
    // You would also implement the actual message sending to other participants here
    // using Twilio's DataTrack or a separate chat service

    setNewMessage('');
  };

  return (
    <div ref={containerRef} className="relative h-full w-full bg-background">
      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {/* Local Video */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative aspect-video bg-muted rounded-lg overflow-hidden"
        >
          <video
            ref={localVideoRef}
            autoPlay
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 text-white text-sm bg-black/50 px-2 py-1 rounded">
            You
          </div>
        </motion.div>

        {/* Remote Participants */}
        <AnimatePresence>
          {Array.from(participants.values()).map((participant) => (
            <motion.div
              key={participant.identity}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative aspect-video bg-muted rounded-lg overflow-hidden"
              id={`participant-${participant.identity}`}
            >
              {participant.videoTrack && (
                <video
                  autoPlay
                  ref={el => {
                    if (el) {
                      el.srcObject = new MediaStream([participant.videoTrack]);
                    }
                  }}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute bottom-2 left-2 text-white text-sm bg-black/50 px-2 py-1 rounded">
                {participant.identity}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Control Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t p-4">
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant={isAudioEnabled ? 'default' : 'destructive'}
            size="icon"
            onClick={toggleAudio}
          >
            {isAudioEnabled ? <Mic /> : <MicOff />}
          </Button>

          <Button
            variant={isVideoEnabled ? 'default' : 'destructive'}
            size="icon"
            onClick={toggleVideo}
          >
            {isVideoEnabled ? <Camera /> : <VideoOff />}
          </Button>

          <Button
            variant={isScreenSharing ? 'default' : 'outline'}
            size="icon"
            onClick={toggleScreenShare}
          >
            {isScreenSharing ? <ScreenShareOff /> : <ScreenShare />}
          </Button>

          <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Settings</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Microphone</label>
                  <Select
                    value={selectedDevices.audioInput}
                    onValueChange={(value) => switchDevice('audio', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select microphone" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDevices.audioInput.map((device) => (
                        <SelectItem key={device.deviceId} value={device.deviceId}>
                          {device.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Camera</label>
                  <Select
                    value={selectedDevices.videoInput}
                    onValueChange={(value) => switchDevice('video', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select camera" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDevices.videoInput.map((device) => (
                        <SelectItem key={device.deviceId} value={device.deviceId}>
                          {device.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <MessageSquare />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Chat</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col h-full pt-4">
                <ScrollArea className="flex-1 mb-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`mb-2 ${
                        message.sender === room?.localParticipant.identity
                          ? 'text-right'
                          : 'text-left'
                      }`}
                    >
                      <div
                        className={`inline-block rounded-lg px-3 py-2 ${
                          message.sender === room?.localParticipant.identity
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm font-medium">{message.sender}</p>
                        <p className="text-sm">{message.text}</p>
                        <p className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
                <form onSubmit={sendMessage} className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                  />
                  <Button type="submit">Send</Button>
                </form>
              </div>
            </SheetContent>
          </Sheet>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Users />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Participants ({participants.size + 1})</DialogTitle>
              </DialogHeader>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted">
                    <span>You (Host)</span>
                    <div className="flex items-center gap-2">
                      {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                      {isVideoEnabled ? <Camera className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                    </div>
                  </div>
                  {Array.from(participants.values()).map((participant) => (
                    <div
                      key={participant.identity}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted"
                    >
                      <span>{participant.identity}</span>
                      <div className="flex items-center gap-2">
                        {participant.audioTrack ? (
                          <Mic className="h-4 w-4" />
                        ) : (
                          <MicOff className="h-4 w-4" />
                        )}
                        {participant.videoTrack ? (
                          <Camera className="h-4 w-4" />
                        ) : (
                          <VideoOff className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            size="icon"
            onClick={toggleFullScreen}
          >
            {isFullScreen ? <Minimize2 /> : <Maximize2 />}
          </Button>

          <Button
            variant="destructive"
            size="icon"
            onClick={() => {
              room?.disconnect();
              onClose();
            }}
          >
            <PhoneOff />
          </Button>
        </div>
      </div>
    </div>
  );
}