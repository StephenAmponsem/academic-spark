import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Bot, 
  Brain,
  Lightbulb,
  BookOpen,
  Sparkles,
  MessageSquare,
  ChevronRight,
  Star,
  Clock,
  Users,
  TrendingUp,
  Zap
} from 'lucide-react';
import { AIChatSystem } from '@/components/AIChatSystem';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/integrations/supabase/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function AIQA() {
  const [showAIChat, setShowAIChat] = useState(false);
  const [selectedAIConversation, setSelectedAIConversation] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Create or get AI conversation
  const { data: aiConversation, isLoading: conversationLoading, error: conversationError } = useQuery({
    queryKey: ['ai-conversation', user?.id],
    queryFn: async () => {
      if (!user) {
        // Return mock conversation for non-authenticated users
        return {
          id: 'mock-ai-conversation',
          student_id: 'mock-user',
          instructor_id: 'ai-assistant',
          title: 'AI Learning Assistant',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      try {
        // Check if AI conversation exists
        const { data: existingConversation, error: checkError } = await supabase
          .from('conversations')
          .select('*')
          .eq('student_id', user.id)
          .eq('instructor_id', 'ai-assistant')
          .single();

        if (existingConversation) {
          return existingConversation;
        }

        // Create new AI conversation
        const { data: newConversation, error: createError } = await supabase
          .from('conversations')
          .insert({
            student_id: user.id,
            instructor_id: 'ai-assistant',
            title: 'AI Learning Assistant',
          })
          .select('*')
          .single();

        if (createError) {
          console.error('Error creating AI conversation:', createError);
          // If database is not set up, create a mock conversation
          return {
            id: 'mock-ai-conversation',
            student_id: user.id,
            instructor_id: 'ai-assistant',
            title: 'AI Learning Assistant',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        }

        return newConversation;
      } catch (error) {
        console.error('Error in AI conversation setup:', error);
        // Return mock conversation if database is not available
        return {
          id: 'mock-ai-conversation',
          student_id: user.id,
          instructor_id: 'ai-assistant',
          title: 'AI Learning Assistant',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
    },
    enabled: true, // Always run, even without user
    retry: 1, // Only retry once
  });

  const handleStartAIChat = () => {
    if (aiConversation) {
      setSelectedAIConversation(aiConversation.id);
      setShowAIChat(true);
    } else {
      // Create a mock conversation if none exists
      const mockConversation = {
        id: 'mock-ai-conversation',
        student_id: user?.id || 'mock-user',
        instructor_id: 'ai-assistant',
        title: 'AI Learning Assistant',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setSelectedAIConversation(mockConversation.id);
      setShowAIChat(true);
    }
  };

  const handleBackToMain = () => {
    setShowAIChat(false);
    setSelectedAIConversation(null);
  };

  const getAICapabilities = () => [
    {
      icon: <Brain className="h-5 w-5" />,
      title: "Concept Explanation",
      description: "Get detailed explanations of complex topics and concepts",
      color: "text-blue-600 bg-blue-50"
    },
    {
      icon: <BookOpen className="h-5 w-5" />,
      title: "Study Guidance",
      description: "Receive personalized study recommendations and learning paths",
      color: "text-green-600 bg-green-50"
    },
    {
      icon: <Star className="h-5 w-5" />,
      title: "Practice Questions",
      description: "Generate practice questions and quizzes for self-assessment",
      color: "text-purple-600 bg-purple-50"
    },
    {
      icon: <Lightbulb className="h-5 w-5" />,
      title: "Problem Solving",
      description: "Get step-by-step solutions to academic problems",
      color: "text-orange-600 bg-orange-50"
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "Progress Tracking",
      description: "Monitor your learning progress and identify areas for improvement",
      color: "text-red-600 bg-red-50"
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Quick Answers",
      description: "Get instant answers to your questions 24/7",
      color: "text-indigo-600 bg-indigo-50"
    }
  ];

  const getQuickQuestions = () => [
    "Can you explain the main concepts from today's lesson?",
    "What are the key takeaways from this topic?",
    "Can you provide some practice questions?",
    "How does this relate to what we learned earlier?",
    "What are the common mistakes to avoid?",
    "Can you give me a step-by-step solution?"
  ];

  if (showAIChat && selectedAIConversation) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <AIChatSystem 
            conversationId={selectedAIConversation} 
            onBack={handleBackToMain}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <Bot className="h-8 w-8 mr-3 text-purple-600" />
                AI Learning Assistant
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Get instant answers, explanations, and study guidance from our AI assistant
              </p>
            </div>
            <Button
              onClick={handleStartAIChat}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              disabled={conversationLoading}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {conversationLoading ? 'Loading...' : 'Start AI Chat'}
            </Button>
          </div>

          {/* Error Message */}
          {conversationError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">
                Note: Database connection issues detected. AI chat will work in demo mode.
              </p>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Bot className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">AI Responses</p>
                    <p className="text-2xl font-bold text-gray-900">24/7</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Brain className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Learning Topics</p>
                    <p className="text-2xl font-bold text-gray-900">Unlimited</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Clock className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Response Time</p>
                    <p className="text-2xl font-bold text-gray-900">&lt; 2s</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Capabilities */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            What I Can Help You With
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getAICapabilities().map((capability, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start">
                    <div className={cn("p-2 rounded-lg mr-3", capability.color)}>
                      {capability.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {capability.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {capability.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Questions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Quick Questions You Can Ask
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getQuickQuestions().map((question, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Lightbulb className="h-4 w-4 text-yellow-500 mr-3" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {question}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">1. Ask a Question</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Type your question in natural language, just like talking to a tutor
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Bot className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">2. AI Analysis</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Our AI analyzes your question and provides a comprehensive response
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Sparkles className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">3. Get Insights</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive detailed explanations, examples, and follow-up suggestions
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="p-8">
              <Bot className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Ready to Start Learning?
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Our AI assistant is ready to help you understand complex concepts, 
                answer questions, and guide your learning journey. Start chatting now!
              </p>
              <Button
                onClick={handleStartAIChat}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                disabled={conversationLoading}
              >
                <Sparkles className="h-5 w-5 mr-2" />
                {conversationLoading ? 'Loading...' : 'Start AI Chat Now'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 