import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Video, Phone, X, Minimize2, Maximize2, Wifi, WifiOff, Sparkles, Heart, Smile, Paperclip, Mic } from 'lucide-react';
import { toast } from 'sonner';
import { useRealtimeMessages } from '@/hooks/useRealtimeCollaboration';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  id: string;
  content: string;
  sender: string;
  senderId: string;
  timestamp: Date;
  isOwn: boolean;
}

interface Group {
  id: string;
  name: string;
  members?: Array<{ id: string; name: string }>;
}

interface ChatProps {
  peer?: {
    id: string;
    name: string;
    role?: string;
    isInstructor?: boolean;
  };
  group?: Group;
  onClose: () => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

export const CollaborationChat = ({ peer, group, onClose, isMinimized, onToggleMinimize }: ChatProps) => {
  const { user, role } = useAuth();
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [showMembers, setShowMembers] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real-time messaging
  const conversationId = group ? group.id : peer?.id;
  const { messages, sendMessage, isConnected } = useRealtimeMessages(conversationId);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    // Allow all group members to send messages in group chat, or students/instructors in 1:1
    if (!group && role !== 'student' && role !== 'instructor') {
      toast.error('Only students and instructors can send messages.');
      return;
    }
    try {
      await sendMessage(inputMessage.trim(), user?.email || 'You');
      setInputMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.info('File sharing coming soon!');
    }
  };

  const handleVideoCall = () => {
    toast.info('Group video call feature coming soon!');
  };

  const handleVoiceCall = () => {
    toast.success('Voice call feature coming soon!');
  };

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    toast.success(isRecording ? 'Voice recording stopped' : 'Voice recording started');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-emerald-500';
      case 'busy': return 'bg-amber-500';
      case 'offline': return 'bg-slate-500';
      default: return 'bg-slate-500';
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="w-80 shadow-2xl bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 border-0">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-8 w-8 shadow-lg">
                    <AvatarImage src={peer?.avatar} />
                    <AvatarFallback className="text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      {peer?.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${getStatusColor(peer?.status || 'offline')}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold">{peer?.name}</p>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {peer?.status}
                    </Badge>
                    {isConnected ? (
                      <Wifi className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <WifiOff className="h-3 w-3 text-red-500" />
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={onToggleMinimize} className="hover:bg-blue-50 dark:hover:bg-blue-900/20">
                  <Maximize2 className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={onClose} className="hover:bg-red-50 dark:hover:bg-red-900/20">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <Card className="relative w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between gap-2 border-b">
        <div>
          <CardTitle>
            {group ? (
              <>
                {group.name} <Badge>Group</Badge>
                <button onClick={() => setShowMembers(!showMembers)} className="ml-2 text-xs underline text-blue-600">{showMembers ? 'Hide' : 'Show'} Members</button>
                {showMembers && (
                  <div className="mt-2 text-xs bg-slate-50 dark:bg-slate-800 p-2 rounded shadow-inner">
                    <div className="font-semibold mb-1">Members:</div>
                    <ul className="list-disc ml-4">
                      {group.members?.map(m => <li key={m.id}>{m.name}</li>)}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <>
                {peer?.name} <Badge>{peer?.role || (peer?.isInstructor ? 'instructor' : 'student')}</Badge>
              </>
            )}
          </CardTitle>
        </div>
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" onClick={handleVideoCall} title="Video Call">
            <Video className="w-5 h-5" />
          </Button>
          <Button size="icon" variant="ghost" onClick={onClose} title="Close">
            <X className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-96 overflow-y-auto p-4" ref={scrollAreaRef}>
        <div className="flex flex-col gap-3">
          {messages.map((message, idx) => (
            <div key={message.id} className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}> 
              <div className={`rounded-lg px-3 py-2 shadow ${message.isOwn ? 'bg-blue-100 dark:bg-blue-900/40 text-right' : 'bg-slate-100 dark:bg-slate-800/60 text-left'}`}> 
                <div className="text-xs font-semibold mb-1">{message.sender}</div>
                <div>{message.content}</div>
                <div className="text-[10px] text-slate-400 mt-1">{new Date(message.timestamp).toLocaleTimeString()}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <div className="flex items-center gap-2 border-t p-3 bg-slate-50 dark:bg-slate-900">
        <Button size="icon" variant="ghost" onClick={() => fileInputRef.current?.click()} title="Attach File">
          <Paperclip className="w-5 h-5" />
        </Button>
        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
        <input
          className="flex-1 border rounded p-2 bg-white dark:bg-slate-800"
          placeholder="Type a message..."
          value={inputMessage}
          onChange={e => setInputMessage(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <Button onClick={handleSendMessage} className="bg-blue-600 text-white">Send</Button>
      </div>
    </Card>
  );
}; 