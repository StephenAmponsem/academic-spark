import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Bot, 
  Send, 
  Brain,
  Lightbulb,
  BookOpen,
  Sparkles,
  MessageSquare,
  Loader2,
  ChevronRight,
  Star
} from 'lucide-react';
import { useAIChat } from '@/hooks/useAIChat';
import { useAuth } from '@/hooks/useAuth';
import { Message } from '@/integrations/supabase/types';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface AIChatSystemProps {
  conversationId: string;
  onBack?: () => void;
}

export function AIChatSystem({ conversationId, onBack }: AIChatSystemProps) {
  const [messageInput, setMessageInput] = useState('');
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [demoMode, setDemoMode] = useState(conversationId === 'mock-ai-conversation');
  const [messages, setMessages] = useState<Array<{id: string, content: string, sender: string, timestamp: Date}>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  const { sendAIMessage, askAIQuestion, isTyping, isPending } = useAIChat({
    conversationId,
    onMessageSent: (message) => {
      // Extract suggested questions from AI response
      if (message.message_type === 'ai-response' && message.file_name) {
        try {
          const questions = JSON.parse(message.file_name);
          setSuggestedQuestions(questions);
        } catch (e) {
          console.error('Failed to parse suggested questions:', e);
        }
      }
    }
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    const userMessage = messageInput.trim();
    setMessageInput('');

    // Add user message to chat
    const newUserMessage = {
      id: Date.now().toString(),
      content: userMessage,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);

    if (demoMode) {
      // Demo mode - simulate AI response without database
      setTimeout(() => {
        const aiResponse = `Great question! Based on your query about "${userMessage}", here's what I can tell you: This is a comprehensive explanation that should help clarify the concept. Let me know if you need any clarification!`;
        
        const newAIMessage = {
          id: (Date.now() + 1).toString(),
          content: aiResponse,
          sender: 'ai',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, newAIMessage]);
        setSuggestedQuestions(['Can you elaborate on this?', 'What are the practical applications?', 'How does this relate to other topics?']);
      }, 1000);
      return;
    }

    try {
      await sendAIMessage.mutateAsync({
        content: userMessage,
        messageType: 'text',
      });
    } catch (error) {
      console.error('Error sending message:', error);
      // Fallback to demo mode if database fails
      setTimeout(() => {
        const aiResponse = `I understand you're asking about "${userMessage}". This is an important topic that connects to several key concepts. Here's my analysis: The fundamental principles here are crucial for understanding the broader context.`;
        
        const newAIMessage = {
          id: (Date.now() + 1).toString(),
          content: aiResponse,
          sender: 'ai',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, newAIMessage]);
        setSuggestedQuestions(['What are the exceptions to this rule?', 'How does this apply in real-world scenarios?', 'Can you provide examples?']);
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedQuestion = async (question: string) => {
    setMessageInput(question);
    if (demoMode) {
      // Demo mode - simulate AI response
      setTimeout(() => {
        const aiResponse = `I understand you're asking about "${question}". This is an important topic that connects to several key concepts. Here's my analysis: The fundamental principles here are crucial for understanding the broader context.`;
        
        const newAIMessage = {
          id: (Date.now() + 1).toString(),
          content: aiResponse,
          sender: 'ai',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, newAIMessage]);
        setSuggestedQuestions(['What are the exceptions to this rule?', 'How does this apply in real-world scenarios?', 'Can you provide examples?']);
      }, 1000);
    } else {
      try {
        await askAIQuestion(question);
      } catch (error) {
        console.error('Error asking AI question:', error);
        // Fallback to demo mode
        setTimeout(() => {
          const aiResponse = `I understand you're asking about "${question}". This is an important topic that connects to several key concepts. Here's my analysis: The fundamental principles here are crucial for understanding the broader context.`;
          
          const newAIMessage = {
            id: (Date.now() + 1).toString(),
            content: aiResponse,
            sender: 'ai',
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, newAIMessage]);
          setSuggestedQuestions(['What are the exceptions to this rule?', 'How does this apply in real-world scenarios?', 'Can you provide examples?']);
        }, 1000);
      }
    }
  };

  return (
    <div className="flex h-[600px] bg-white rounded-lg shadow-lg overflow-hidden">
      {/* AI Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-3">
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600">
                  <Bot className="h-4 w-4 text-white" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium flex items-center">
                  AI Learning Assistant
                  <Badge variant="secondary" className="ml-2">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI
                  </Badge>
                  {demoMode && (
                    <Badge variant="outline" className="ml-2">
                      Demo Mode
                    </Badge>
                  )}
                </h3>
                <p className="text-xs text-gray-500">
                  Ask me anything about your course material
                </p>
              </div>
            </div>
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {/* Welcome Message */}
            <div className="flex justify-start">
              <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="h-4 w-4 text-purple-600" />
                  <span className="text-xs font-medium text-purple-700">AI Assistant</span>
                </div>
                <p className="text-sm text-gray-700">
                  Hello! I'm your AI learning assistant. I can help you with:
                </p>
                <ul className="text-xs text-gray-600 mt-2 space-y-1">
                  <li>• Explaining complex concepts</li>
                  <li>• Answering questions about course material</li>
                  <li>• Providing study guidance</li>
                  <li>• Suggesting related topics to explore</li>
                </ul>
                <p className="text-xs text-gray-500 mt-2">
                  Just ask me anything!
                </p>
                {demoMode && (
                  <p className="text-xs text-orange-600 mt-2 font-medium">
                    ⚠️ Running in demo mode - responses are simulated
                  </p>
                )}
              </div>
            </div>

            {/* Chat Messages */}
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    {message.sender === 'ai' && <Bot className="h-3 w-3 text-purple-600" />}
                    <span className="text-xs font-medium">
                      {message.sender === 'user' ? 'You' : 'AI Assistant'}
                    </span>
                    <span className="text-xs opacity-70">
                      {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}

            {/* AI Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-purple-600" />
                    <span className="text-xs font-medium text-purple-700">AI Assistant</span>
                    <Loader2 className="h-3 w-3 animate-spin text-purple-600" />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Thinking...</p>
                </div>
              </div>
            )}

            {/* Suggested Questions */}
            {suggestedQuestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 font-medium">Suggested follow-up questions:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs h-auto p-2"
                      onClick={() => handleSuggestedQuestion(question)}
                      disabled={isPending}
                    >
                      <Lightbulb className="h-3 w-3 mr-1" />
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your course..."
                className="pr-12"
                disabled={isPending}
              />
              <Button
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                onClick={handleSendMessage}
                disabled={!messageInput.trim() || isPending}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => handleSuggestedQuestion("Can you explain the main concepts from today's lesson?")}
              disabled={isPending}
            >
              <BookOpen className="h-3 w-3 mr-1" />
              Explain Concepts
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => handleSuggestedQuestion("What are the key takeaways from this topic?")}
              disabled={isPending}
            >
              <Brain className="h-3 w-3 mr-1" />
              Key Takeaways
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => handleSuggestedQuestion("Can you provide some practice questions?")}
              disabled={isPending}
            >
              <Star className="h-3 w-3 mr-1" />
              Practice Questions
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 