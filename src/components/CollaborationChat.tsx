import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeMessages } from '@/hooks/useRealtimeCollaboration';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  X, 
  Minimize2, 
  Maximize2, 
  Paperclip, 
  Mic, 
  Video, 
  Phone, 
  Users,
  FileText,
  Image,
  MessageCircle,
  MoreHorizontal,
  Smile
} from 'lucide-react';
import { toast } from 'sonner';

interface Peer {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'offline' | 'busy';
  subjects: string[];
  rating: number;
  lastActive: string;
  isInstructor: boolean;
}

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  subject: string;
  members: number;
  maxMembers: number;
  meetingTime: string;
  isActive: boolean;
  createdBy: string;
}

interface ChatProps {
  peer?: Peer;
  group?: StudyGroup;
  onClose: (id: string) => void;
  isMinimized: boolean;
  onToggleMinimize: (id: string) => void;
}

export const CollaborationChat = ({ peer, group, onClose, isMinimized, onToggleMinimize }: ChatProps) => {
  const { user, role } = useAuth();
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [showMembers, setShowMembers] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Real-time messaging
  const conversationId = group ? group.id : peer?.id;
  const { messages, sendMessage, isConnected: messageConnected, isLoading } = useRealtimeMessages(conversationId);

  useEffect(() => {
    setIsConnected(messageConnected);
  }, [messageConnected]);

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
      // In a real app, you would upload the file to storage and get a URL
      toast.info(`File "${file.name}" selected. File sharing coming soon!`);
      
      // Simulate file message
      const fileMessage = {
        content: `📎 ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
        sender_id: user?.id || 'current-user',
        sender_name: user?.email || 'You',
        conversation_id: conversationId || '',
        message_type: 'file' as const,
        file_url: URL.createObjectURL(file),
        created_at: new Date().toISOString()
      };
      
      // Add to messages (in real app, this would be sent through the real-time service)
      toast.success('File message sent!');
    }
  };

  const handleVideoCall = () => {
    if (group) {
      toast.info('Group video call feature coming soon!');
    } else if (peer) {
      toast.info(`Initiating video call with ${peer.name}...`);
    }
  };

  const handleVoiceCall = () => {
    if (group) {
      toast.info('Group voice call feature coming soon!');
    } else if (peer) {
      toast.info(`Initiating voice call with ${peer.name}...`);
    }
  };

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast.info('Voice recording started...');
    } else {
      toast.success('Voice message sent!');
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setInputMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isOwnMessage = (senderId: string) => {
    return senderId === user?.id || senderId === 'current-user';
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 min-w-[200px]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={group ? undefined : peer?.avatar} />
                <AvatarFallback className="text-xs">
                  {group ? group.name.charAt(0) : peer?.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium truncate">
                {group ? group.name : peer?.name}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant={isConnected ? "default" : "destructive"} className="text-xs">
                {isConnected ? '●' : '○'}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleMinimize(group?.id || peer?.id || '')}
                className="h-6 w-6 p-0"
              >
                <Maximize2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onClose(group?.id || peer?.id || '')}
                className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {messages.length > 0 ? `${messages.length} messages` : 'No messages yet'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 h-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={group ? undefined : peer?.avatar} />
            <AvatarFallback>
              {group ? group.name.charAt(0) : peer?.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-sm">
              {group ? group.name : peer?.name}
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? "default" : "destructive"} className="text-xs">
                {isConnected ? 'Online' : 'Offline'}
              </Badge>
              {group && (
                <span className="text-xs text-gray-500">
                  {group.members}/{group.maxMembers} members
                </span>
              )}
              {peer && (
                <span className="text-xs text-gray-500">
                  {peer.isInstructor ? 'Instructor' : 'Student'}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {group && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMembers(!showMembers)}
              className="h-8 w-8 p-0"
            >
              <Users className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleVideoCall}
            className="h-8 w-8 p-0"
          >
            <Video className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleVoiceCall}
            className="h-8 w-8 p-0"
          >
            <Phone className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleMinimize(group?.id || peer?.id || '')}
            className="h-8 w-8 p-0"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onClose(group?.id || peer?.id || '')}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-8">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No messages yet</p>
              <p className="text-xs">Start the conversation!</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${isOwnMessage(message.sender_id) ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    isOwnMessage(message.sender_id)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium">
                      {message.sender_name}
                    </span>
                    <span className="text-xs opacity-70">
                      {formatTime(message.created_at)}
                    </span>
                  </div>
                  <div className="text-sm">
                    {message.message_type === 'file' ? (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>{message.content}</span>
                      </div>
                    ) : message.message_type === 'image' ? (
                      <div className="flex items-center gap-2">
                        <Image className="h-4 w-4" />
                        <span>{message.content}</span>
                      </div>
                    ) : (
                      message.content
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="h-8 w-8 p-0"
          >
            <Smile className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="h-8 w-8 p-0"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleVoiceRecord}
            className={`h-8 w-8 p-0 ${isRecording ? 'text-red-500' : ''}`}
          >
            <Mic className="h-4 w-4" />
          </Button>
        </div>
        
        {showEmojiPicker && (
          <div className="mb-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="grid grid-cols-8 gap-1">
              {['😊', '😂', '❤️', '👍', '🎉', '🔥', '💯', '✨'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiSelect(emoji)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
            disabled={!isConnected}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || !isConnected || isLoading}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt"
        />
      </div>
    </div>
  );
}; 