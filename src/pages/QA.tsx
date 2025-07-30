import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { 
  useConversations, 
  useMessages, 
  useCreateConversation, 
  useSendMessage, 
  useRealtimeMessages, 
  useAIResponse,
  useUpdateConversationTitle,
  useDeleteConversation
} from "@/hooks/useQA";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  MessageCircle, 
  Bot, 
  User, 
  Loader2, 
  Edit, 
  Trash2, 
  MoreVertical,
  Home,
  ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";

const QA = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Hooks
  const { data: conversations, isLoading: conversationsLoading } = useConversations();
  const { data: messages, isLoading: messagesLoading } = useMessages(currentConversation);
  const createConversation = useCreateConversation();
  const sendMessage = useSendMessage();
  const updateTitle = useUpdateConversationTitle();
  const deleteConversation = useDeleteConversation();
  const { generateAIResponse, isGenerating } = useAIResponse();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Real-time message subscription
  useRealtimeMessages(currentConversation, (newMessage) => {
    // The messages will be automatically updated via React Query
  });

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentConversation || !user) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");

    try {
      // Send user message
      await sendMessage.mutateAsync({
        content: userMessage,
        conversationId: currentConversation,
        role: 'user',
      });

      // Generate AI response
      await generateAIResponse(userMessage, currentConversation);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleCreateConversation = async () => {
    try {
      const newConversation = await createConversation.mutateAsync();
      setCurrentConversation(newConversation.id);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const handleUpdateTitle = async (conversationId: string) => {
    if (!newTitle.trim()) return;
    
    try {
      await updateTitle.mutateAsync({
        conversationId,
        title: newTitle.trim(),
      });
      setEditingTitle(null);
      setNewTitle("");
    } catch (error) {
      console.error('Error updating title:', error);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await deleteConversation.mutateAsync(conversationId);
      
      // Clear current conversation if it's the one being deleted
      if (currentConversation === conversationId) {
        setCurrentConversation(null);
      }
      
      // Clear editing state if it's the conversation being deleted
      if (editingTitle === conversationId) {
        setEditingTitle(null);
        setNewTitle("");
      }
      
      // Force a refetch of conversations to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
      
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 pt-20 pb-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Q&A Chat
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Sign in to start asking questions and get real-time answers
            </p>
            <Button onClick={() => navigate('/auth')} size="lg">
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 pt-20 pb-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors"
            >
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Q&A Chat
          </h1>
          <p className="text-xl text-muted-foreground">
            Ask questions and get real-time answers from our AI assistant
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Conversations Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Conversations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleCreateConversation} 
                  className="w-full mb-4"
                  variant="outline"
                  disabled={createConversation.isPending}
                >
                  {createConversation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <MessageCircle className="h-4 w-4 mr-2" />
                  )}
                  New Chat
                </Button>
                
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {conversationsLoading ? (
                      <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="p-3 rounded-lg bg-muted animate-pulse">
                            <div className="h-4 bg-muted-foreground/20 rounded mb-1"></div>
                            <div className="h-3 bg-muted-foreground/20 rounded w-2/3"></div>
                          </div>
                        ))}
                      </div>
                    ) : conversations?.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        <MessageCircle className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">No conversations yet</p>
                      </div>
                    ) : (
                      conversations?.map((conversation) => (
                        <div
                          key={conversation.id}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            currentConversation === conversation.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted hover:bg-muted/80'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div 
                              className="flex-1 min-w-0"
                              onClick={() => setCurrentConversation(conversation.id)}
                            >
                              {editingTitle === conversation.id ? (
                                <div className="flex items-center gap-2">
                                  <Input
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        handleUpdateTitle(conversation.id);
                                      }
                                    }}
                                    onBlur={() => {
                                      setEditingTitle(null);
                                      setNewTitle("");
                                    }}
                                    className="h-6 text-xs"
                                    autoFocus
                                  />
                                </div>
                              ) : (
                                <div className="font-medium text-sm truncate">
                                  {conversation.title}
                                </div>
                              )}
                              <div className="text-xs opacity-70">
                                {new Date(conversation.updated_at).toLocaleDateString()}
                              </div>
                            </div>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                                >
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingTitle(conversation.id);
                                    setNewTitle(conversation.title);
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Title
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteConversation(conversation.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  AI Assistant
                  {isGenerating && (
                    <Badge variant="secondary">
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Thinking...
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col">
                {!currentConversation ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        Start a New Conversation
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Click "New Chat" to begin asking questions
                      </p>
                      <Button onClick={handleCreateConversation}>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Start Chat
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Messages */}
                    <ScrollArea className="flex-1 mb-4" ref={scrollAreaRef}>
                      <div className="space-y-4">
                        {messagesLoading ? (
                          <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                              <div key={i} className="flex gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>
                                    <Bot className="h-4 w-4" />
                                  </AvatarFallback>
                                </Avatar>
                                <div className="bg-muted rounded-lg p-3 animate-pulse">
                                  <div className="h-4 bg-muted-foreground/20 rounded mb-2"></div>
                                  <div className="h-3 bg-muted-foreground/20 rounded w-1/2"></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : messages?.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <MessageCircle className="h-12 w-12 mx-auto mb-4" />
                            <p>No messages yet. Start the conversation!</p>
                          </div>
                        ) : (
                          messages?.map((message) => (
                            <div
                              key={message.id}
                              className={`flex gap-3 ${
                                message.role === 'user' ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              {message.role === 'assistant' && (
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>
                                    <Bot className="h-4 w-4" />
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              
                              <div
                                className={`max-w-[70%] rounded-lg p-3 ${
                                  message.role === 'user'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                <p className="text-xs opacity-70 mt-1">
                                  {formatTime(message.created_at)}
                                </p>
                              </div>
                              
                              {message.role === 'user' && (
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>
                                    <User className="h-4 w-4" />
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>

                    {/* Input */}
                    <div className="flex gap-2">
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type your question..."
                        disabled={sendMessage.isPending || isGenerating}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleSendMessage} 
                        disabled={!inputMessage.trim() || sendMessage.isPending || isGenerating}
                        size="icon"
                      >
                        {sendMessage.isPending || isGenerating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QA;
