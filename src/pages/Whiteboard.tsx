import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { VirtualWhiteboard } from '@/components/collaboration/VirtualWhiteboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Settings, 
  Share2, 
  Users, 
  Clock,
  Save,
  Download,
  MessageSquare,
  Video,
  Mic,
  Phone
} from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import { toast } from 'sonner';

interface WhiteboardSession {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  participants: number;
  isPublic: boolean;
  tags: string[];
}

export default function Whiteboard() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<WhiteboardSession | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  // Mock session data
  useEffect(() => {
    setTimeout(() => {
      setSession({
        id: roomId || 'default',
        title: 'React Study Session',
        description: 'Learning React hooks and state management',
        createdBy: 'Alice Johnson',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        participants: 3,
        isPublic: false,
        tags: ['React', 'JavaScript', 'Programming']
      });
      setIsLoading(false);
    }, 1000);
  }, [roomId]);

  const shareSession = async () => {
    const shareUrl = `${window.location.origin}/whiteboard/${roomId}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy share link');
    }
  };

  const saveSession = () => {
    toast.success('Whiteboard session saved!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading whiteboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold mb-2">Session not found</h2>
            <p className="text-muted-foreground mb-4">
              The whiteboard session you're looking for doesn't exist or has been deleted.
            </p>
            <Button onClick={() => navigate('/collaboration')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Collaboration
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <Card className="rounded-none border-x-0 border-t-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/collaboration')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              <div>
                <h1 className="font-semibold text-lg">{session.title}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Created by {session.createdBy}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {session.createdAt.toLocaleTimeString()}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {session.participants} participants
                  </span>
                </div>
              </div>

              <div className="flex gap-1">
                {session.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Communication Tools */}
              <Button 
                variant={showChat ? "default" : "ghost"} 
                size="sm"
                onClick={() => setShowChat(!showChat)}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
              
              <Button 
                variant={showVideo ? "default" : "ghost"} 
                size="sm"
                onClick={() => setShowVideo(!showVideo)}
              >
                <Video className="h-4 w-4" />
              </Button>
              
              <Button variant="ghost" size="sm">
                <Mic className="h-4 w-4" />
              </Button>

              {/* Actions */}
              <div className="h-6 w-px bg-border mx-2" />
              
              <Button variant="ghost" size="sm" onClick={saveSession}>
                <Save className="h-4 w-4" />
              </Button>
              
              <Button variant="ghost" size="sm" onClick={shareSession}>
                <Share2 className="h-4 w-4" />
              </Button>
              
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Whiteboard */}
        <div className="flex-1">
          <VirtualWhiteboard 
            roomId={roomId || 'default'} 
            showParticipants={!showChat && !showVideo}
          />
        </div>

        {/* Side Panel - Chat or Video */}
        {(showChat || showVideo) && (
          <Card className="w-80 rounded-none border-y-0 border-r-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {showChat ? (
                    <>
                      <MessageSquare className="h-4 w-4" />
                      Chat
                    </>
                  ) : (
                    <>
                      <Video className="h-4 w-4" />
                      Video Call
                    </>
                  )}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setShowChat(false);
                    setShowVideo(false);
                  }}
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showChat ? (
                <div className="space-y-4">
                  {/* Chat Messages */}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {[
                      { user: 'Alice Johnson', message: 'Great diagram! Can you explain the component lifecycle?', time: '2:30 PM' },
                      { user: 'You', message: 'Sure! Let me draw it step by step...', time: '2:31 PM' },
                      { user: 'Bob Smith', message: 'This is really helpful, thanks!', time: '2:35 PM' }
                    ].map((msg, index) => (
                      <div key={index} className="text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{msg.user}</span>
                          <span className="text-xs text-muted-foreground">{msg.time}</span>
                        </div>
                        <p className="text-muted-foreground">{msg.message}</p>
                      </div>
                    ))}
                  </div>

                  {/* Chat Input */}
                  <div className="flex gap-2">
                    <Input placeholder="Type a message..." className="flex-1" />
                    <Button size="sm">Send</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Video Call Interface */}
                  <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                    <div className="text-center text-white">
                      <Video className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Video call will appear here</p>
                    </div>
                  </div>

                  {/* Call Controls */}
                  <div className="flex justify-center gap-2">
                    <Button variant="outline" size="sm">
                      <Mic className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Participants */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">In Call (2)</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Alice Johnson</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>You</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Floating Quick Actions */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2">
        <Button size="sm" className="rounded-full h-12 w-12 p-0 shadow-lg">
          <MessageSquare className="h-5 w-5" />
        </Button>
        <Button size="sm" className="rounded-full h-12 w-12 p-0 shadow-lg">
          <Users className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}