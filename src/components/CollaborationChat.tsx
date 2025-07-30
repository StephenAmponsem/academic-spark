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

interface ChatProps {
  peer: {
    id: string;
    name: string;
    avatar?: string;
    status: 'online' | 'offline' | 'busy';
    isInstructor: boolean;
  };
  onClose: () => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

export const CollaborationChat = ({ peer, onClose, isMinimized, onToggleMinimize }: ChatProps) => {
  const { user } = useAuth();
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Real-time messaging
  const { messages, sendMessage, isConnected } = useRealtimeMessages(peer.id);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

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

  const handleVideoCall = () => {
    toast.success('Video call feature coming soon!');
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
                    <AvatarImage src={peer.avatar} />
                    <AvatarFallback className="text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      {peer.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${getStatusColor(peer.status)}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold">{peer.name}</p>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {peer.status}
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
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-96 h-96 shadow-2xl flex flex-col bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 border-0">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10 shadow-lg">
                  <AvatarImage src={peer.avatar} />
                  <AvatarFallback className="text-base bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    {peer.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-3 border-white dark:border-gray-800 ${getStatusColor(peer.status)}`} />
              </div>
              <div>
                <p className="font-semibold text-base">{peer.name}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {peer.status}
                  </Badge>
                  {peer.isInstructor && (
                    <Badge variant="default" className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                      Instructor
                    </Badge>
                  )}
                  {isConnected ? (
                    <Wifi className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <WifiOff className="h-3 w-3 text-red-500" />
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={handleVideoCall} className="hover:bg-blue-50 dark:hover:bg-blue-900/20">
                <Video className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={handleVoiceCall} className="hover:bg-green-50 dark:hover:bg-green-900/20">
                <Phone className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={onToggleMinimize} className="hover:bg-amber-50 dark:hover:bg-amber-900/20">
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={onClose} className="hover:bg-red-50 dark:hover:bg-red-900/20">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
            <div className="space-y-4 py-4">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mb-4">
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-20"></div>
                      <div className="relative bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg">
                        <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">Start the conversation!</p>
                  <p className="text-xs text-muted-foreground mt-1">Send a message to begin chatting</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.sender_id === 'current-user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.sender_id !== 'current-user' && (
                      <Avatar className="h-8 w-8 shadow-sm">
                        <AvatarImage src={peer.avatar} />
                        <AvatarFallback className="text-xs bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                          {peer.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div
                      className={`max-w-[75%] rounded-2xl p-3 shadow-sm ${
                        message.sender_id === 'current-user'
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender_id === 'current-user' 
                          ? 'text-blue-100' 
                          : 'text-muted-foreground'
                      }`}>
                        {new Date(message.created_at).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                    
                    {message.sender_id === 'current-user' && (
                      <Avatar className="h-8 w-8 shadow-sm">
                        <AvatarFallback className="text-xs bg-gradient-to-r from-emerald-600 to-green-600 text-white">
                          You
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))
              )}
              
              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="h-8 w-8 shadow-sm">
                    <AvatarImage src={peer.avatar} />
                    <AvatarFallback className="text-xs bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      {peer.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-3 shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <div className="flex gap-2 items-end">
              <div className="flex-1 relative">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="pr-20 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
                  disabled={!isConnected}
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                    <Smile className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                    <Paperclip className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-1">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={handleVoiceRecord}
                  className={`h-10 w-10 p-0 ${isRecording ? 'bg-red-100 dark:bg-red-900/20 text-red-600' : 'hover:bg-green-50 dark:hover:bg-green-900/20'}`}
                  disabled={!isConnected}
                >
                  <Mic className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={handleSendMessage} 
                  size="sm" 
                  disabled={!isConnected || !inputMessage.trim()}
                  className="h-10 w-10 p-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {!isConnected && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <WifiOff className="h-3 w-3" />
                Connection lost. Trying to reconnect...
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 