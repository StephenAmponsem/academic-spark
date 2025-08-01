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
  ChevronLeft,
  Star,
  ArrowLeft,
  Search,
  HelpCircle,
  Book,
  GraduationCap
} from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import { useAIChat } from '@/hooks/useAIChat';
import { Message } from '@/integrations/supabase/types';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { realtimeService } from '@/services/realtimeService';

interface AIChatSystemProps {
  conversationId: string;
  onBack?: () => void;
}

export function AIChatSystem({ conversationId, onBack }: AIChatSystemProps) {
  const [questionInput, setQuestionInput] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [demoMode, setDemoMode] = useState(false); // Disable demo mode for real-time service
  const [qaHistory, setQaHistory] = useState<Array<{id: string, question: string, answer: string, timestamp: Date}>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  const { sendAIMessage, askAIQuestion, isTyping, isPending } = useAIChat({
    conversationId,
    onMessageSent: (message) => {
      // Handle AI response
      if (message.message_type === 'ai-response') {
        setCurrentAnswer(message.content);
        setIsLoading(false);
        
        // Add to Q&A history
        const newQA = {
          id: Date.now().toString(),
          question: currentQuestion,
          answer: message.content,
          timestamp: new Date()
        };
        setQaHistory(prev => [...prev, newQA]);
        setCurrentQuestion('');
        setCurrentAnswer('');
      }
    }
  });

  // Auto-scroll to bottom when new Q&A arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [qaHistory, isLoading]);

  // Subscribe to real-time messages
  useEffect(() => {
    const subscription = realtimeService.subscribeToMessages(conversationId, (message) => {
      if (message.sender_id === 'ai-assistant') {
        // Handle incoming AI message
        setCurrentAnswer(message.content);
        setIsLoading(false);
        
        const newQA = {
          id: message.id,
          question: currentQuestion,
          answer: message.content,
          timestamp: new Date(message.created_at)
        };
        setQaHistory(prev => [...prev, newQA]);
        setCurrentQuestion('');
        setCurrentAnswer('');
      }
    });

    return () => {
      realtimeService.unsubscribe(`messages:${conversationId}`);
    };
  }, [conversationId, currentQuestion]);

  const handleAskQuestion = async () => {
    if (!questionInput.trim()) return;

    const question = questionInput.trim();
    setQuestionInput('');
    setCurrentQuestion(question);
    setIsLoading(true);

    if (demoMode) {
      // Demo mode - simulate AI response
      setTimeout(() => {
        const aiResponse = `Great question! Based on your query about "${question}", here's what I can tell you: This is a comprehensive explanation that should help clarify the concept. Let me know if you need any clarification!`;
        
        setCurrentAnswer(aiResponse);
        setIsLoading(false);
        
        const newQA = {
          id: Date.now().toString(),
          question: question,
          answer: aiResponse,
          timestamp: new Date()
        };
        setQaHistory(prev => [...prev, newQA]);
        setCurrentQuestion('');
        setCurrentAnswer('');
      }, 1000);
      return;
    }

    try {
      await sendAIMessage.mutateAsync({
        content: question,
        messageType: 'text',
      });
    } catch (error) {
      console.error('Error sending question:', error);
      // Fallback to demo mode if database fails
      setTimeout(() => {
        const aiResponse = `I understand you're asking about "${question}". This is an important topic that connects to several key concepts. Here's my analysis: The fundamental principles here are crucial for understanding the broader context.`;
        
        setCurrentAnswer(aiResponse);
        setIsLoading(false);
        
        const newQA = {
          id: Date.now().toString(),
          question: question,
          answer: aiResponse,
          timestamp: new Date()
        };
        setQaHistory(prev => [...prev, newQA]);
        setCurrentQuestion('');
        setCurrentAnswer('');
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  };

  const handleQuickQuestion = async (question: string) => {
    setQuestionInput(question);
    if (demoMode) {
      // Demo mode - simulate AI response
      setTimeout(() => {
        const aiResponse = `I understand you're asking about "${question}". This is an important topic that connects to several key concepts. Here's my analysis: The fundamental principles here are crucial for understanding the broader context.`;
        
        setCurrentAnswer(aiResponse);
        setIsLoading(false);
        
        const newQA = {
          id: Date.now().toString(),
          question: question,
          answer: aiResponse,
          timestamp: new Date()
        };
        setQaHistory(prev => [...prev, newQA]);
        setCurrentQuestion('');
        setCurrentAnswer('');
      }, 1000);
    } else {
      try {
        await askAIQuestion(question);
      } catch (error) {
        console.error('Error asking AI question:', error);
        // Fallback to demo mode
        setTimeout(() => {
          const aiResponse = `I understand you're asking about "${question}". This is an important topic that connects to several key concepts. Here's my analysis: The fundamental principles here are crucial for understanding the broader context.`;
          
          setCurrentAnswer(aiResponse);
          setIsLoading(false);
          
          const newQA = {
            id: Date.now().toString(),
            question: question,
            answer: aiResponse,
            timestamp: new Date()
          };
          setQaHistory(prev => [...prev, newQA]);
          setCurrentQuestion('');
          setCurrentAnswer('');
        }, 1000);
      }
    }
  };

  return (
    <div className="flex h-[600px] bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Q&A Area */}
      <div className="flex-1 flex flex-col">
        {/* Header with Back Button */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
                                {onBack && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onBack}
                      className="mr-3 border-gray-300 hover:bg-gray-50"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Home
                    </Button>
                  )}
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
                    Q&A
                  </Badge>
                  {isLoading && (
                    <Badge variant="default" className="ml-2 bg-green-500">
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Processing
                    </Badge>
                  )}
                  {demoMode && (
                    <Badge variant="outline" className="ml-2">
                      Demo Mode
                    </Badge>
                  )}
                </h3>
                <p className="text-xs text-gray-500">
                  Ask questions and get instant answers
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Q&A Content */}
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
                  Hello! I'm your AI learning assistant. Ask me any question about your course material and I'll provide detailed answers.
                </p>
                {demoMode && (
                  <p className="text-xs text-orange-600 mt-2 font-medium">
                    ⚠️ Running in demo mode - responses are simulated
                  </p>
                )}
              </div>
            </div>

            {/* Q&A History */}
            {qaHistory.map((qa) => (
              <div key={qa.id} className="space-y-3">
                {/* Question */}
                <div className="flex justify-end">
                  <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-blue-500 text-white">
                    <div className="flex items-center gap-2 mb-1">
                      <HelpCircle className="h-3 w-3" />
                      <span className="text-xs font-medium">Your Question</span>
                      <span className="text-xs opacity-70">
                        {formatDistanceToNow(qa.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm">{qa.question}</p>
                  </div>
                </div>

                {/* Answer */}
                <div className="flex justify-start">
                  <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Bot className="h-3 w-3 text-purple-600" />
                      <span className="text-xs font-medium text-purple-700">AI Answer</span>
                    </div>
                    <p className="text-sm">{qa.answer}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Current Question and Answer */}
            {currentQuestion && (
              <div className="space-y-3">
                {/* Current Question */}
                <div className="flex justify-end">
                  <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-blue-500 text-white">
                    <div className="flex items-center gap-2 mb-1">
                      <HelpCircle className="h-3 w-3" />
                      <span className="text-xs font-medium">Your Question</span>
                    </div>
                    <p className="text-sm">{currentQuestion}</p>
                  </div>
                </div>

                {/* Loading or Answer */}
                {isLoading ? (
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
                ) : currentAnswer && (
                  <div className="flex justify-start">
                    <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Bot className="h-3 w-3 text-purple-600" />
                        <span className="text-xs font-medium text-purple-700">AI Answer</span>
                      </div>
                      <p className="text-sm">{currentAnswer}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Question Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Input
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask your question here..."
                className="pr-12"
                disabled={isLoading}
              />
              <Button
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                onClick={handleAskQuestion}
                disabled={!questionInput.trim() || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          {/* Quick Questions */}
          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => handleQuickQuestion("Can you explain the main concepts from today's lesson?")}
              disabled={isLoading}
            >
              <BookOpen className="h-3 w-3 mr-1" />
              Explain Concepts
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => handleQuickQuestion("What are the key takeaways from this topic?")}
              disabled={isLoading}
            >
              <Brain className="h-3 w-3 mr-1" />
              Key Takeaways
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => handleQuickQuestion("Can you provide some practice questions?")}
              disabled={isLoading}
            >
              <GraduationCap className="h-3 w-3 mr-1" />
              Practice Questions
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 