import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video as TwilioVideo } from 'twilio-video';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Users,
  MessageSquare,
  Settings,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface VideoCallProps {
  roomName: string;
  token: string;
  participants: {
    id: string;
    name: string;
    image?: string;
  }[];
  onClose: () => void;
}

export function VideoCall({ roomName, token, participants, onClose }: VideoCallProps) {
  const [room, setRoom] = useState<any>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeParticipants, setActiveParticipants] = useState(participants);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<{ [key: string]: HTMLVideoElement }>({});

  useEffect(() => {
    // Connect to Twilio room
    TwilioVideo.connect(token, {
      name: roomName,
      audio: true,
      video: true,
    }).then(room => {
      setRoom(room);
      setupLocalVideo(room);
      setupParticipantHandlers(room);
    }).catch(error => {
      console.error('Failed to connect to video room:', error);
    });

    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [roomName, token]);

  const setupLocalVideo = (room: any) => {
    if (localVideoRef.current) {
      const localVideoTrack = Array.from(room.localParticipant.videoTracks.values())[0].track;
      localVideoTrack.attach(localVideoRef.current);
    }
  };

  const setupParticipantHandlers = (room: any) => {
    room.on('participantConnected', (participant: any) => {
      handleParticipantConnected(participant);
    });

    room.on('participantDisconnected', (participant: any) => {
      handleParticipantDisconnected(participant);
    });

    // Connect existing participants
    room.participants.forEach(handleParticipantConnected);
  };

  const handleParticipantConnected = (participant: any) => {
    participant.tracks.forEach((publication: any) => {
      if (publication.isSubscribed) {
        handleTrackSubscribed(publication.track, participant);
      }
    });

    participant.on('trackSubscribed', (track: any) => {
      handleTrackSubscribed(track, participant);
    });
  };

  const handleTrackSubscribed = (track: any, participant: any) => {
    if (track.kind === 'video') {
      const videoElement = remoteVideoRefs.current[participant.sid];
      if (videoElement) {
        track.attach(videoElement);
      }
    }
  };

  const handleParticipantDisconnected = (participant: any) => {
    setActiveParticipants(prev => 
      prev.filter(p => p.id !== participant.sid)
    );
  };

  const toggleAudio = () => {
    if (room) {
      room.localParticipant.audioTracks.forEach((publication: any) => {
        if (isAudioEnabled) {
          publication.track.disable();
        } else {
          publication.track.enable();
        }
      });
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const toggleVideo = () => {
    if (room) {
      room.localParticipant.videoTracks.forEach((publication: any) => {
        if (isVideoEnabled) {
          publication.track.disable();
        } else {
          publication.track.enable();
        }
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const handleEndCall = () => {
    if (room) {
      room.disconnect();
    }
    onClose();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <Card className={`${isFullscreen ? 'fixed inset-0 z-50' : 'relative'}`}>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Video className="h-5 w-5" />
            <span>{roomName}</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? (
                <Minimize2 className="h-5 w-5" />
              ) : (
                <Maximize2 className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {}}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {/* Local Video */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative aspect-video bg-black rounded-lg overflow-hidden"
          >
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4">
              <p className="text-white text-sm font-medium">You</p>
            </div>
          </motion.div>

          {/* Remote Videos */}
          <AnimatePresence>
            {activeParticipants.map((participant) => (
              <motion.div
                key={participant.id}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative aspect-video bg-black rounded-lg overflow-hidden"
              >
                <video
                  ref={el => {
                    if (el) remoteVideoRefs.current[participant.id] = el;
                  }}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4">
                  <p className="text-white text-sm font-medium">
                    {participant.name}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
          <div className="flex items-center justify-center space-x-4">
            <Button
              variant={isAudioEnabled ? 'default' : 'destructive'}
              size="icon"
              onClick={toggleAudio}
            >
              {isAudioEnabled ? (
                <Mic className="h-5 w-5" />
              ) : (
                <MicOff className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant={isVideoEnabled ? 'default' : 'destructive'}
              size="icon"
              onClick={toggleVideo}
            >
              {isVideoEnabled ? (
                <Video className="h-5 w-5" />
              ) : (
                <VideoOff className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={handleEndCall}
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
            >
              <Users className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}