import { useParams } from 'react-router-dom';
import { AdvancedVideoConference } from '@/components/video-conference/AdvancedVideoConference';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  Users, 
  Shield, 
  Zap, 
  Monitor, 
  MessageSquare,
  Lock,
  Globe,
  Clock,
  Settings,
  HelpCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import useAuth from '@/hooks/useAuth';

export default function VideoConference() {
  const { meetingId } = useParams<{ meetingId: string }>();
  const { user } = useAuth();
  const [isJoining, setIsJoining] = useState(true);
  const [meetingInfo, setMeetingInfo] = useState<any>(null);

  // Mock meeting info
  useEffect(() => {
    setTimeout(() => {
      setMeetingInfo({
        id: meetingId || 'default-meeting',
        title: 'React Advanced Concepts Study Session',
        host: 'Dr. Sarah Chen',
        scheduledTime: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
        duration: 90, // minutes
        participants: 4,
        maxParticipants: 25,
        isPublic: false,
        hasPassword: true,
        features: {
          recording: true,
          screenSharing: true,
          chat: true,
          waitingRoom: false,
          breakoutRooms: true
        }
      });
      setIsJoining(false);
    }, 1500);
  }, [meetingId]);

  const joinMeeting = () => {
    setIsJoining(true);
    // Simulate joining process
    setTimeout(() => {
      setIsJoining(false);
    }, 2000);
  };

  if (isJoining) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-lg font-semibold mb-2">
              {meetingInfo ? 'Joining meeting...' : 'Loading meeting info...'}
            </h2>
            <p className="text-gray-600">
              {meetingInfo ? 'Setting up your camera and microphone' : 'Please wait while we fetch the meeting details'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!meetingInfo) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Meeting not found</h2>
            <p className="text-gray-600 mb-4">
              The meeting you're trying to join doesn't exist or has ended.
            </p>
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Pre-join Screen */}
      {isJoining && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-6 w-6" />
                Join Meeting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Meeting Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">{meetingInfo.title}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Host: {meetingInfo.host}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Duration: {meetingInfo.duration} minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{meetingInfo.participants}/{meetingInfo.maxParticipants} participants</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {meetingInfo.isPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    <span>{meetingInfo.isPublic ? 'Public' : 'Private'} meeting</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div>
                <h4 className="font-medium mb-3">Meeting Features</h4>
                <div className="flex flex-wrap gap-2">
                  {meetingInfo.features.recording && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Video className="h-3 w-3" />
                      Recording
                    </Badge>
                  )}
                  {meetingInfo.features.screenSharing && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Monitor className="h-3 w-3" />
                      Screen Sharing
                    </Badge>
                  )}
                  {meetingInfo.features.chat && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      Chat
                    </Badge>
                  )}
                  {meetingInfo.features.breakoutRooms && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Breakout Rooms
                    </Badge>
                  )}
                </div>
              </div>

              {/* Device Check */}
              <div className="space-y-4">
                <h4 className="font-medium">Device Check</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4 text-center">
                      <Video className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-sm font-medium text-green-800">Camera</div>
                      <div className="text-xs text-green-600">Working properly</div>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4 text-center">
                      <Video className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-sm font-medium text-green-800">Microphone</div>
                      <div className="text-xs text-green-600">Working properly</div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button onClick={joinMeeting} className="flex-1">
                  <Video className="h-4 w-4 mr-2" />
                  Join Meeting
                </Button>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Button variant="outline">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Help
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Conference Interface */}
      {!isJoining && (
        <AdvancedVideoConference 
          meetingId={meetingId || 'default-meeting'} 
          isHost={user?.user_metadata?.full_name === meetingInfo.host}
        />
      )}
    </div>
  );
}