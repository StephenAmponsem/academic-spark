import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff,
  Monitor,
  MonitorOff,
  Users,
  MessageSquare,
  Send,
  Settings,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  Hand,
  HandMetal,
  Camera,
  CameraOff,
  Share2,
  Download,
  Upload,
  Grid3X3,
  User,
  Crown,
  Pin,
  PinOff,
  Fullscreen,
  MoreHorizontal,
  Copy,
  Link,
  Clock,
  Circle,
  Square,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Zap,
  Wifi,
  WifiOff,
  Signal,
  Headphones,
  Smartphone,
  Monitor as MonitorIcon,
  Tablet
} from 'lucide-react';
import { cn } from '@/lib/utils';
import useAuth from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  role: 'host' | 'moderator' | 'participant';
  isVideoOn: boolean;
  isAudioOn: boolean;
  isScreenSharing: boolean;
  isHandRaised: boolean;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
  device: 'desktop' | 'mobile' | 'tablet';
  joinedAt: Date;
  isSpeaking: boolean;
  isPinned: boolean;
}

interface ChatMessage {
  id: string;
  participantId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'system' | 'private';
  isPrivate?: boolean;
  targetId?: string;
}

interface ConferenceSettings {
  allowParticipantVideo: boolean;
  allowParticipantAudio: boolean;
  allowParticipantScreenShare: boolean;
  allowParticipantChat: boolean;
  requireApprovalToJoin: boolean;
  recordSession: boolean;
  maxParticipants: number;
  autoMuteOnJoin: boolean;
}

interface AdvancedVideoConferenceProps {
  meetingId: string;
  isHost?: boolean;
  className?: string;
}

export function AdvancedVideoConference({ meetingId, isHost = false, className }: AdvancedVideoConferenceProps) {
  const { user } = useAuth();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'gallery' | 'speaker' | 'grid'>('gallery');
  const [chatMessage, setChatMessage] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<'camera' | 'screen' | 'microphone'>('camera');
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good');
  const [meetingDuration, setMeetingDuration] = useState(0);
  const [participantCount, setParticipantCount] = useState(1);

  // Mock participants
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: '1',
      name: user?.user_metadata?.full_name || 'You',
      avatar: user?.user_metadata?.avatar_url,
      role: isHost ? 'host' : 'participant',
      isVideoOn: true,
      isAudioOn: true,
      isScreenSharing: false,
      isHandRaised: false,
      connectionQuality: 'excellent',
      device: 'desktop',
      joinedAt: new Date(),
      isSpeaking: false,
      isPinned: false
    },
    {
      id: '2',
      name: 'Sarah Chen',
      avatar: '/avatars/sarah.jpg',
      role: 'moderator',
      isVideoOn: true,
      isAudioOn: true,
      isScreenSharing: false,
      isHandRaised: false,
      connectionQuality: 'good',
      device: 'desktop',
      joinedAt: new Date(Date.now() - 5 * 60 * 1000),
      isSpeaking: true,
      isPinned: false
    },
    {
      id: '3',
      name: 'Mike Rodriguez',
      avatar: '/avatars/mike.jpg',
      role: 'participant',
      isVideoOn: false,
      isAudioOn: true,
      isScreenSharing: false,
      isHandRaised: true,
      connectionQuality: 'fair',
      device: 'mobile',
      joinedAt: new Date(Date.now() - 3 * 60 * 1000),
      isSpeaking: false,
      isPinned: false
    },
    {
      id: '4',
      name: 'Emma Wilson',
      avatar: '/avatars/emma.jpg',
      role: 'participant',
      isVideoOn: true,
      isAudioOn: false,
      isScreenSharing: true,
      isHandRaised: false,
      connectionQuality: 'excellent',
      device: 'tablet',
      joinedAt: new Date(Date.now() - 8 * 60 * 1000),
      isSpeaking: false,
      isPinned: true
    }
  ]);

  // Mock chat messages
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      participantId: '2',
      content: 'Welcome everyone to the React learning session!',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      type: 'text'
    },
    {
      id: '2',
      participantId: 'system',
      content: 'Mike Rodriguez joined the meeting',
      timestamp: new Date(Date.now() - 8 * 60 * 1000),
      type: 'system'
    },
    {
      id: '3',
      participantId: '3',
      content: 'Thanks! Excited to learn about hooks today.',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      type: 'text'
    }
  ]);

  const [conferenceSettings, setConferenceSettings] = useState<ConferenceSettings>({
    allowParticipantVideo: true,
    allowParticipantAudio: true,
    allowParticipantScreenShare: isHost,
    allowParticipantChat: true,
    requireApprovalToJoin: false,
    recordSession: false,
    maxParticipants: 50,
    autoMuteOnJoin: true
  });

  // Initialize media stream
  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setIsConnected(true);
      } catch (error) {
        console.error('Error accessing media devices:', error);
        toast.error('Failed to access camera/microphone');
      }
    };

    initializeMedia();

    // Cleanup
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Update meeting duration
  useEffect(() => {
    const interval = setInterval(() => {
      setMeetingDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const toggleVideo = useCallback(async () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
        
        // Update participant state
        setParticipants(prev => prev.map(p => 
          p.id === '1' ? { ...p, isVideoOn: videoTrack.enabled } : p
        ));
      }
    }
  }, []);

  const toggleAudio = useCallback(async () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
        
        // Update participant state
        setParticipants(prev => prev.map(p => 
          p.id === '1' ? { ...p, isAudioOn: audioTrack.enabled } : p
        ));
      }
    }
  }, []);

  const toggleScreenShare = useCallback(async () => {
    try {
      if (isScreenSharing) {
        // Stop screen sharing
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setIsScreenSharing(false);
        toast.success('Screen sharing stopped');
      } else {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        localStreamRef.current = screenStream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        setIsScreenSharing(true);
        toast.success('Screen sharing started');

        // Handle screen share end
        screenStream.getVideoTracks()[0].onended = () => {
          toggleScreenShare();
        };
      }
      
      // Update participant state
      setParticipants(prev => prev.map(p => 
        p.id === '1' ? { ...p, isScreenSharing: !isScreenSharing } : p
      ));
    } catch (error) {
      console.error('Error toggling screen share:', error);
      toast.error('Failed to toggle screen sharing');
    }
  }, [isScreenSharing]);

  const toggleHandRaise = () => {
    setIsHandRaised(!isHandRaised);
    setParticipants(prev => prev.map(p => 
      p.id === '1' ? { ...p, isHandRaised: !isHandRaised } : p
    ));
    
    if (!isHandRaised) {
      toast.success('Hand raised');
    } else {
      toast.success('Hand lowered');
    }
  };

  const sendChatMessage = () => {
    if (!chatMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      participantId: '1',
      content: chatMessage,
      timestamp: new Date(),
      type: 'text'
    };

    setChatMessages(prev => [...prev, newMessage]);
    setChatMessage('');
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast.success('Recording started');
    } else {
      toast.success('Recording stopped and saved');
    }
  };

  const leaveMeeting = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    toast.success('Left the meeting');
    // Navigate back or close meeting
  };

  const copyMeetingLink = () => {
    const meetingUrl = `${window.location.origin}/video-conference/${meetingId}`;
    navigator.clipboard.writeText(meetingUrl);
    toast.success('Meeting link copied to clipboard');
  };

  const getConnectionIcon = (quality: string) => {
    switch (quality) {
      case 'excellent': return <Signal className="h-3 w-3 text-green-500" />;
      case 'good': return <Signal className="h-3 w-3 text-blue-500" />;
      case 'fair': return <Signal className="h-3 w-3 text-yellow-500" />;
      case 'poor': return <WifiOff className="h-3 w-3 text-red-500" />;
      default: return <Wifi className="h-3 w-3 text-gray-500" />;
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'desktop': return <MonitorIcon className="h-3 w-3" />;
      case 'mobile': return <Smartphone className="h-3 w-3" />;
      case 'tablet': return <Tablet className="h-3 w-3" />;
      default: return <MonitorIcon className="h-3 w-3" />;
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const ParticipantVideo = ({ participant }: { participant: Participant }) => (
    <div className={cn(
      "relative bg-gray-900 rounded-lg overflow-hidden aspect-video",
      participant.isPinned && "ring-2 ring-blue-500",
      participant.isSpeaking && "ring-2 ring-green-400 ring-opacity-75"
    )}>
      {participant.isVideoOn ? (
        <video 
          className="w-full h-full object-cover"
          autoPlay
          muted={participant.id === '1'}
          style={{ transform: participant.id === '1' ? 'scaleX(-1)' : 'none' }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          <Avatar className="h-16 w-16">
            <AvatarImage src={participant.avatar} />
            <AvatarFallback className="bg-gray-600 text-white text-lg">
              {participant.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      {/* Participant Info Overlay */}
      <div className="absolute bottom-2 left-2 right-2">
        <div className="bg-black bg-opacity-50 rounded px-2 py-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white text-sm font-medium truncate">
              {participant.name}
            </span>
            {participant.role === 'host' && <Crown className="h-3 w-3 text-yellow-400" />}
            {participant.role === 'moderator' && <Badge className="h-3 w-3 text-blue-400" />}
          </div>
          
          <div className="flex items-center gap-1">
            {getConnectionIcon(participant.connectionQuality)}
            {getDeviceIcon(participant.device)}
            {!participant.isAudioOn && <MicOff className="h-3 w-3 text-red-400" />}
            {participant.isScreenSharing && <Monitor className="h-3 w-3 text-blue-400" />}
            {participant.isHandRaised && <Hand className="h-3 w-3 text-yellow-400" />}
          </div>
        </div>
      </div>

      {/* Screen sharing indicator */}
      {participant.isScreenSharing && (
        <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
          Sharing Screen
        </div>
      )}
    </div>
  );

  return (
    <div className={cn("h-screen flex flex-col bg-gray-900", className)}>
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-white font-semibold">Video Conference</h1>
            <div className="flex items-center gap-2 text-gray-300 text-sm">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(meetingDuration)}</span>
              <Separator orientation="vertical" className="bg-gray-600 h-4" />
              <Users className="h-4 w-4" />
              <span>{participants.length} participants</span>
              {isRecording && (
                <>
                  <Separator orientation="vertical" className="bg-gray-600 h-4" />
                  <Circle className="h-4 w-4 text-red-400" />
                  <span className="text-red-400">Recording</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={copyMeetingLink} className="text-white hover:bg-gray-700">
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
            
            <Button variant="ghost" size="sm" onClick={() => setIsSettingsOpen(true)} className="text-white hover:bg-gray-700">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Grid */}
        <div className="flex-1 p-4">
          {viewMode === 'gallery' && (
            <div className={cn(
              "grid gap-4 h-full",
              participants.length <= 2 ? "grid-cols-1 md:grid-cols-2" :
              participants.length <= 4 ? "grid-cols-2" :
              participants.length <= 9 ? "grid-cols-3" : "grid-cols-4"
            )}>
              {participants.map((participant) => (
                <ParticipantVideo key={participant.id} participant={participant} />
              ))}
            </div>
          )}

          {viewMode === 'speaker' && (
            <div className="h-full flex flex-col gap-4">
              {/* Main speaker */}
              <div className="flex-1">
                <ParticipantVideo participant={participants.find(p => p.isSpeaking) || participants[0]} />
              </div>
              
              {/* Participant thumbnails */}
              <div className="h-24 flex gap-2 overflow-x-auto">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex-shrink-0 w-32">
                    <ParticipantVideo participant={participant} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chat Sidebar */}
        {isChatOpen && (
          <Card className="w-80 rounded-none border-l-0 border-gray-700 bg-gray-800">
            <CardHeader className="pb-3 border-b border-gray-700">
              <CardTitle className="text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Chat
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsChatOpen(false)}
                  className="text-white hover:bg-gray-700"
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex flex-col h-[calc(100vh-8rem)]">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.map((message) => {
                  const sender = participants.find(p => p.id === message.participantId);
                  
                  return (
                    <div key={message.id} className={cn(
                      "text-sm",
                      message.type === 'system' && "text-center text-gray-400 italic"
                    )}>
                      {message.type === 'text' && (
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-white">{sender?.name || 'Unknown'}</span>
                            <span className="text-xs text-gray-400">
                              {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-gray-300">{message.content}</p>
                        </div>
                      )}
                      {message.type === 'system' && (
                        <p>{message.content}</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Chat Input */}
              <div className="border-t border-gray-700 p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                  <Button onClick={sendChatMessage} size="sm" disabled={!chatMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Controls Bar */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="flex items-center justify-center gap-4">
          {/* Media Controls */}
          <div className="flex items-center gap-2">
            <Button
              onClick={toggleVideo}
              className={cn(
                "rounded-full h-12 w-12 p-0",
                isVideoOn ? "bg-gray-600 hover:bg-gray-500" : "bg-red-600 hover:bg-red-500"
              )}
            >
              {isVideoOn ? <Video className="h-5 w-5 text-white" /> : <VideoOff className="h-5 w-5 text-white" />}
            </Button>

            <Button
              onClick={toggleAudio}
              className={cn(
                "rounded-full h-12 w-12 p-0",
                isAudioOn ? "bg-gray-600 hover:bg-gray-500" : "bg-red-600 hover:bg-red-500"
              )}
            >
              {isAudioOn ? <Mic className="h-5 w-5 text-white" /> : <MicOff className="h-5 w-5 text-white" />}
            </Button>

            <Button
              onClick={toggleScreenShare}
              className={cn(
                "rounded-full h-12 w-12 p-0",
                isScreenSharing ? "bg-blue-600 hover:bg-blue-500" : "bg-gray-600 hover:bg-gray-500"
              )}
            >
              {isScreenSharing ? <MonitorOff className="h-5 w-5 text-white" /> : <Monitor className="h-5 w-5 text-white" />}
            </Button>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2">
            <Button
              onClick={toggleHandRaise}
              className={cn(
                "rounded-full h-12 w-12 p-0",
                isHandRaised ? "bg-yellow-600 hover:bg-yellow-500" : "bg-gray-600 hover:bg-gray-500"
              )}
            >
              {isHandRaised ? <HandMetal className="h-5 w-5 text-white" /> : <Hand className="h-5 w-5 text-white" />}
            </Button>

            <Button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={cn(
                "rounded-full h-12 w-12 p-0",
                isChatOpen ? "bg-blue-600 hover:bg-blue-500" : "bg-gray-600 hover:bg-gray-500"
              )}
            >
              <MessageSquare className="h-5 w-5 text-white" />
            </Button>

            {isHost && (
              <Button
                onClick={toggleRecording}
                className={cn(
                  "rounded-full h-12 w-12 p-0",
                  isRecording ? "bg-red-600 hover:bg-red-500" : "bg-gray-600 hover:bg-gray-500"
                )}
              >
                {isRecording ? <Square className="h-5 w-5 text-white" /> : <Circle className="h-5 w-5 text-white" />}
              </Button>
            )}
          </div>

          {/* Leave Meeting */}
          <Button
            onClick={leaveMeeting}
            className="bg-red-600 hover:bg-red-500 rounded-full h-12 px-6"
          >
            <PhoneOff className="h-5 w-5 mr-2" />
            Leave
          </Button>
        </div>

        {/* Connection Quality */}
        <div className="flex items-center justify-center mt-2">
          <div className="flex items-center gap-2 text-gray-400 text-xs">
            {getConnectionIcon(connectionQuality)}
            <span>Connection: {connectionQuality}</span>
          </div>
        </div>
      </div>

      {/* Hidden video element for local stream */}
      <video
        ref={localVideoRef}
        autoPlay
        muted
        className="hidden"
      />
    </div>
  );
}

export default AdvancedVideoConference;