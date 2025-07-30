import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  FileText, 
  Star,
  Clock,
  Check,
  CheckCheck,
  User,
  GraduationCap,
  BookOpen,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Edit
} from 'lucide-react';
import { useConversations, useMessages, useRealTimeMessages, useFeedback, useUnreadCount } from '@/hooks/useMessaging';
import { useAuth } from '@/hooks/useAuth';
import { Conversation, Message as MessageType } from '@/integrations/supabase/types';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export function MessagingSystem() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<MessageType | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { conversations, isLoading: conversationsLoading } = useConversations();
  const { messages, sendMessage, markAsRead } = useMessages(selectedConversation?.id || '');
  const { addFeedback } = useFeedback();
  const unreadCount = useUnreadCount();

  // Enable real-time updates for selected conversation
  useRealTimeMessages(selectedConversation?.id || '');

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      markAsRead.mutate();
    }
  }, [selectedConversation, markAsRead]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;

    await sendMessage.mutateAsync({
      content: messageInput.trim(),
      messageType: 'text',
    });

    setMessageInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!selectedConversation) return;

    // In a real app, you'd upload to Supabase Storage
    // For now, we'll just send the file name
    await sendMessage.mutateAsync({
      content: `File: ${file.name}`,
      messageType: 'file',
      fileName: file.name,
      fileSize: file.size,
    });
  };

  const handleFeedback = async (messageId: string, feedbackType: string, rating?: number, feedbackText?: string) => {
    await addFeedback.mutateAsync({
      messageId,
      feedbackType: feedbackType as any,
      rating,
      feedbackText,
    });
    setShowFeedbackModal(false);
    setSelectedMessage(null);
  };

  const getOtherUser = (conversation: Conversation) => {
    if (!user) return null;
    return user.id === conversation.student_id ? conversation.instructor : conversation.student;
  };

  const isOwnMessage = (message: MessageType) => {
    return message.sender_id === user?.id;
  };

  const getMessageStatus = (message: MessageType) => {
    if (isOwnMessage(message)) {
      return message.is_read ? <CheckCheck className="h-3 w-3 text-blue-500" /> : <Check className="h-3 w-3 text-gray-400" />;
    }
    return null;
  };

  if (conversationsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[600px] bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Conversations List */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Messages</h2>
            <Badge variant="secondary" className="ml-2">
              {unreadCount}
            </Badge>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {conversations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No conversations yet</p>
                <p className="text-sm">Start a conversation with an instructor or student</p>
              </div>
            ) : (
              conversations.map((conversation) => {
                const otherUser = getOtherUser(conversation);
                const isSelected = selectedConversation?.id === conversation.id;
                const hasUnread = conversation.unread_count && conversation.unread_count > 0;

                return (
                  <div
                    key={conversation.id}
                    className={cn(
                      "flex items-center p-3 rounded-lg cursor-pointer transition-colors",
                      isSelected ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50",
                      hasUnread ? "bg-blue-50" : ""
                    )}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={otherUser?.avatar_url || undefined} />
                      <AvatarFallback>
                        {otherUser?.role === 'instructor' ? (
                          <BookOpen className="h-5 w-5" />
                        ) : (
                          <GraduationCap className="h-5 w-5" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate">
                          {otherUser?.full_name || 'Unknown User'}
                        </p>
                        {conversation.last_message && (
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(conversation.last_message.created_at), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500 truncate">
                          {conversation.last_message?.content || 'No messages yet'}
                        </p>
                        {hasUnread && (
                          <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                            {conversation.unread_count}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarImage src={getOtherUser(selectedConversation)?.avatar_url || undefined} />
                    <AvatarFallback>
                      {getOtherUser(selectedConversation)?.role === 'instructor' ? (
                        <BookOpen className="h-4 w-4" />
                      ) : (
                        <GraduationCap className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">
                      {getOtherUser(selectedConversation)?.full_name || 'Unknown User'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {getOtherUser(selectedConversation)?.role === 'instructor' ? 'Instructor' : 'Student'}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      isOwnMessage(message) ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
                        isOwnMessage(message)
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-900"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs opacity-75">
                          {message.sender?.full_name || 'Unknown'}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs opacity-75">
                            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                          </span>
                          {getMessageStatus(message)}
                        </div>
                      </div>
                      <p className="text-sm">{message.content}</p>
                      
                      {/* File attachment */}
                      {message.file_name && (
                        <div className="mt-2 flex items-center gap-2 text-xs">
                          <FileText className="h-3 w-3" />
                          <span>{message.file_name}</span>
                        </div>
                      )}

                      {/* Feedback */}
                      {message.feedback && (
                        <div className="mt-2 p-2 bg-yellow-50 rounded border">
                          <div className="flex items-center gap-1 mb-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span className="text-xs font-medium">
                              {message.feedback.feedback_type} Feedback
                            </span>
                          </div>
                          {message.feedback.rating && (
                            <div className="flex gap-1 mb-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={cn(
                                    "h-3 w-3",
                                    star <= message.feedback!.rating!
                                      ? "text-yellow-500 fill-current"
                                      : "text-gray-300"
                                  )}
                                />
                              ))}
                            </div>
                          )}
                          {message.feedback.feedback_text && (
                            <p className="text-xs text-gray-600">
                              {message.feedback.feedback_text}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Feedback button for non-own messages */}
                      {!isOwnMessage(message) && !message.feedback && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 h-6 px-2 text-xs"
                          onClick={() => {
                            setSelectedMessage(message);
                            setShowFeedbackModal(true);
                          }}
                        >
                          <Star className="h-3 w-3 mr-1" />
                          Add Feedback
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="p-2">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2">
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="pr-12"
                  />
                  <Button
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || sendMessage.isPending}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-500">Choose a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Add Feedback</CardTitle>
              <CardDescription>
                Provide feedback for this message
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Feedback Type</label>
                <select className="w-full mt-1 p-2 border rounded">
                  <option value="general">General</option>
                  <option value="assignment">Assignment</option>
                  <option value="question">Question</option>
                  <option value="clarification">Clarification</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Rating (Optional)</label>
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Button
                      key={star}
                      variant="ghost"
                      size="sm"
                      className="p-1"
                      onClick={() => handleFeedback(selectedMessage.id, 'general', star)}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFeedbackModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleFeedback(selectedMessage.id, 'general')}
                  className="flex-1"
                >
                  Add Feedback
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 