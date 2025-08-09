import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  MessageSquare, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Settings,
  Target,
  TrendingUp,
  Clock,
  Lightbulb,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Zap,
  Star,
  Users,
  BarChart3,
  Calendar,
  Award,
  Sparkles,
  Eye,
  EyeOff,
  RefreshCw,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Heart,
  Share2,
  Download,
  Clipboard,
  HelpCircle,
  ChevronRight,
  ArrowRight,
  Wand2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import useAuth from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

interface LearningProfile {
  id: string;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  pace: 'slow' | 'medium' | 'fast';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  interests: string[];
  strengths: string[];
  weaknesses: string[];
  preferredTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  attentionSpan: number; // minutes
  motivationFactors: string[];
}

interface AITutorMessage {
  id: string;
  role: 'user' | 'tutor';
  content: string;
  timestamp: Date;
  type: 'text' | 'audio' | 'visual' | 'interactive';
  metadata?: {
    confidence: number;
    emotion: string;
    intent: string;
    suggestedActions?: string[];
    resources?: Resource[];
  };
}

interface Resource {
  id: string;
  title: string;
  type: 'video' | 'article' | 'exercise' | 'quiz' | 'document';
  difficulty: string;
  estimatedTime: number;
  url: string;
  thumbnail?: string;
}

interface LearningSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  topic: string;
  goals: string[];
  achievements: string[];
  struggledWith: string[];
  mood: 'excited' | 'confident' | 'neutral' | 'frustrated' | 'confused';
  focusLevel: number; // 1-10
  comprehension: number; // 1-10
}

interface PersonalizedAITutorProps {
  courseId?: string;
  lessonId?: string;
  className?: string;
}

export function PersonalizedAITutor({ courseId, lessonId, className }: PersonalizedAITutorProps) {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const startInQAMode = searchParams.get('mode') === 'qa';
  const [activeTab, setActiveTab] = useState<'chat' | 'progress' | 'profile' | 'insights' | 'qa'>(startInQAMode ? 'qa' : 'chat');
  const [messages, setMessages] = useState<AITutorMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSession, setCurrentSession] = useState<LearningSession | null>(null);
  const [tutorPersonality, setTutorPersonality] = useState<'friendly' | 'professional' | 'encouraging' | 'strict'>('friendly');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock learning profile
  const learningProfile: LearningProfile = {
    id: '1',
    learningStyle: 'visual',
    pace: 'medium',
    difficulty: 'intermediate',
    interests: ['React', 'JavaScript', 'Web Development', 'UI/UX'],
    strengths: ['Problem Solving', 'Creative Thinking', 'Persistence'],
    weaknesses: ['Math Concepts', 'Memorization', 'Time Management'],
    preferredTimeOfDay: 'evening',
    attentionSpan: 25,
    motivationFactors: ['Achievement', 'Recognition', 'Progress Visualization']
  };

  // Mock initial messages
  useEffect(() => {
    const welcomeMessage: AITutorMessage = {
      id: '1',
      role: 'tutor',
      content: `Hello ${user?.user_metadata?.full_name || 'there'}! I'm your personalized AI tutor. I've analyzed your learning profile and I'm here to help you master React concepts at your own pace. Based on your visual learning style, I'll use diagrams and examples to explain things clearly. What would you like to work on today?`,
      timestamp: new Date(),
      type: 'text',
      metadata: {
        confidence: 95,
        emotion: 'welcoming',
        intent: 'greeting',
        suggestedActions: [
          'Review React Hooks',
          'Practice Component Patterns',
          'Learn State Management',
          'Explore Testing Strategies'
        ]
      }
    };
    setMessages([welcomeMessage]);
  }, [user]);

  // Mock AI responses
  const aiResponses = [
    {
      trigger: ['hook', 'useState', 'state'],
      response: "Great question about React hooks! Since you're a visual learner, let me break this down with a clear example. useState is like a special box that holds data and can notify React when the data changes. Here's a simple analogy: imagine a light switch...",
      resources: [
        {
          id: '1',
          title: 'Interactive useState Tutorial',
          type: 'exercise' as const,
          difficulty: 'intermediate',
          estimatedTime: 15,
          url: '/exercises/usestate-tutorial'
        }
      ]
    },
    {
      trigger: ['confused', 'don\'t understand', 'help'],
      response: "I can see you're struggling with this concept. That's completely normal! Let's try a different approach that matches your learning style better. Since you learn best visually, let me create a step-by-step diagram...",
      resources: []
    },
    {
      trigger: ['component', 'jsx', 'element'],
      response: "Components are the building blocks of React! Think of them like LEGO pieces - each piece has a specific purpose, and you can combine them to build complex structures. Let me show you with a visual example...",
      resources: [
        {
          id: '2',
          title: 'Component Composition Guide',
          type: 'video' as const,
          difficulty: 'beginner',
          estimatedTime: 10,
          url: '/videos/component-basics'
        }
      ]
    }
  ];

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: AITutorMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate AI response
    const lowerInput = inputMessage.toLowerCase();
    let response = aiResponses.find(r => 
      r.trigger.some(trigger => lowerInput.includes(trigger))
    );

    if (!response) {
      response = {
        trigger: [],
        response: `I understand you're asking about "${inputMessage}". Based on your learning profile, I recommend we approach this step by step. Let me provide some personalized guidance...`,
        resources: []
      };
    }

    const tutorMessage: AITutorMessage = {
      id: (Date.now() + 1).toString(),
      role: 'tutor',
      content: response.response,
      timestamp: new Date(),
      type: 'text',
      metadata: {
        confidence: Math.floor(Math.random() * 20) + 80,
        emotion: 'helpful',
        intent: 'explanation',
        resources: response.resources
      }
    };

    setMessages(prev => [...prev, tutorMessage]);
    setIsTyping(false);
  };

  const startVoiceInput = () => {
    setIsListening(true);
    // Implement speech recognition
    setTimeout(() => {
      setIsListening(false);
      setInputMessage("Can you explain React hooks to me?");
    }, 3000);
  };

  const speakMessage = (content: string) => {
    setIsSpeaking(true);
    // Implement text-to-speech
    setTimeout(() => {
      setIsSpeaking(false);
    }, 3000);
  };

  const startLearningSession = () => {
    const session: LearningSession = {
      id: Date.now().toString(),
      startTime: new Date(),
      topic: 'React Fundamentals',
      goals: ['Understand useState', 'Create functional components', 'Handle events'],
      achievements: [],
      struggledWith: [],
      mood: 'confident',
      focusLevel: 8,
      comprehension: 7
    };
    setCurrentSession(session);
  };

  const endLearningSession = () => {
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        endTime: new Date(),
        achievements: ['Completed useState tutorial', 'Built first component'],
        struggledWith: ['Event handling syntax']
      };
      console.log('Session completed:', updatedSession);
      setCurrentSession(null);
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const TutorAvatar = () => (
    <Avatar className="h-8 w-8">
      <AvatarImage src="/tutor-avatar.png" />
      <AvatarFallback className="bg-blue-500 text-white">
        <Brain className="h-4 w-4" />
      </AvatarFallback>
    </Avatar>
  );

  const UserAvatar = () => (
    <Avatar className="h-8 w-8">
      <AvatarImage src={user?.user_metadata?.avatar_url} />
      <AvatarFallback>
        {user?.user_metadata?.full_name?.charAt(0) || 'U'}
      </AvatarFallback>
    </Avatar>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">AI Tutor Assistant</h2>
                <p className="text-sm text-gray-600">
                  Personalized learning • Adaptive teaching • Available 24/7
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {currentSession ? (
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    Learning Session Active
                  </Badge>
                  <Button variant="outline" size="sm" onClick={endLearningSession}>
                    End Session
                  </Button>
                </div>
              ) : (
                <Button onClick={startLearningSession}>
                  <Play className="h-4 w-4 mr-2" />
                  Start Learning Session
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Session Banner */}
      {currentSession && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">Session Goals</span>
                </div>
                <div className="flex gap-2">
                  {currentSession.goals.map((goal, index) => (
                    <Badge key={index} variant="outline" className="text-xs border-green-300 text-green-700">
                      {goal}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-green-800">
                  {formatDistanceToNow(currentSession.startTime)} elapsed
                </div>
                <div className="text-xs text-green-600">
                  Focus: {currentSession.focusLevel}/10 • Understanding: {currentSession.comprehension}/10
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="qa">Q&A Mode</TabsTrigger>
          <TabsTrigger value="chat">AI Chat</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="profile">Learning Profile</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Q&A Tab */}
        <TabsContent value="qa" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-purple-600" />
                AI Q&A Assistant
              </CardTitle>
              <p className="text-muted-foreground">
                Ask questions and get instant answers with detailed explanations
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* AI Capabilities Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                  <CardContent className="p-4 text-center">
                    <Brain className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-sm mb-1">Concept Explanation</h3>
                    <p className="text-xs text-muted-foreground">Get detailed explanations of complex topics</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
                  <CardContent className="p-4 text-center">
                    <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-sm mb-1">Study Guidance</h3>
                    <p className="text-xs text-muted-foreground">Receive personalized study recommendations</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                  <CardContent className="p-4 text-center">
                    <Star className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-sm mb-1">Practice Questions</h3>
                    <p className="text-xs text-muted-foreground">Generate practice questions and quizzes</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
                  <CardContent className="p-4 text-center">
                    <Lightbulb className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-sm mb-1">Problem Solving</h3>
                    <p className="text-xs text-muted-foreground">Get step-by-step solutions</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-sm mb-1">Progress Tracking</h3>
                    <p className="text-xs text-muted-foreground">Monitor your learning progress</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
                  <CardContent className="p-4 text-center">
                    <Zap className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-sm mb-1">Quick Answers</h3>
                    <p className="text-xs text-muted-foreground">Get instant answers 24/7</p>
                  </CardContent>
                </Card>
              </div>

              {/* Example Questions */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Example Questions You Can Ask</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    "Can you explain the main concepts from today's lesson?",
                    "What are the key takeaways from this topic?",
                    "Can you provide some practice questions?",
                    "How does this relate to what we learned earlier?",
                    "What are the common mistakes to avoid?",
                    "Can you give me a step-by-step solution?"
                  ].map((question, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-r from-gray-50 to-white">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <HelpCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-700">{question}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Quick Start Button */}
              <div className="text-center">
                <Button 
                  onClick={() => setActiveTab('chat')}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Start Q&A Session
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat" className="space-y-4">
          <Card className="h-96">
            <CardContent className="p-0 flex flex-col h-full">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={cn(
                    "flex gap-3",
                    message.role === 'user' ? "justify-end" : "justify-start"
                  )}>
                    {message.role === 'tutor' && <TutorAvatar />}
                    
                    <div className={cn(
                      "max-w-[80%] rounded-lg px-4 py-2",
                      message.role === 'user' 
                        ? "bg-blue-500 text-white" 
                        : "bg-gray-100 text-gray-900"
                    )}>
                      <div className="text-sm">{message.content}</div>
                      
                      {message.metadata?.resources && message.metadata.resources.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <div className="text-xs font-medium opacity-75">Recommended Resources:</div>
                          {message.metadata.resources.map((resource) => (
                            <div key={resource.id} className="bg-white bg-opacity-20 rounded p-2">
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-3 w-3" />
                                <span className="text-xs font-medium">{resource.title}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {resource.estimatedTime}min
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {message.metadata?.suggestedActions && (
                        <div className="mt-3 space-y-1">
                          <div className="text-xs font-medium opacity-75">Quick Actions:</div>
                          <div className="flex flex-wrap gap-1">
                            {message.metadata.suggestedActions.map((action, index) => (
                              <Button
                                key={index}
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs bg-white bg-opacity-20 hover:bg-opacity-30"
                                onClick={() => setInputMessage(action)}
                              >
                                {action}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs opacity-60">
                          {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                        </span>
                        
                        {message.role === 'tutor' && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-xs hover:bg-white hover:bg-opacity-20"
                              onClick={() => speakMessage(message.content)}
                            >
                              {isSpeaking ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-xs hover:bg-white hover:bg-opacity-20"
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {message.role === 'user' && <UserAvatar />}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex gap-3">
                    <TutorAvatar />
                    <div className="bg-gray-100 rounded-lg px-4 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Ask me anything about your learning..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="pr-10"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={startVoiceInput}
                      className={cn(
                        "absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0",
                        isListening && "text-red-500"
                      )}
                    >
                      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button onClick={sendMessage} disabled={!inputMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">87%</div>
                <div className="text-sm text-gray-600">Learning Progress</div>
                <div className="text-xs text-green-600 mt-1">+12% this week</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">4.2h</div>
                <div className="text-sm text-gray-600">Study Time Today</div>
                <div className="text-xs text-blue-600 mt-1">Goal: 5h</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Lightbulb className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">23</div>
                <div className="text-sm text-gray-600">Concepts Mastered</div>
                <div className="text-xs text-yellow-600 mt-1">5 this week</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Learning Journey</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { topic: 'React Hooks', progress: 100, status: 'completed' },
                  { topic: 'Component Patterns', progress: 75, status: 'in-progress' },
                  { topic: 'State Management', progress: 30, status: 'in-progress' },
                  { topic: 'Testing Strategies', progress: 0, status: 'upcoming' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      item.status === 'completed' ? "bg-green-500" :
                      item.status === 'in-progress' ? "bg-blue-500" : "bg-gray-300"
                    )} />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{item.topic}</span>
                        <span className="text-sm text-gray-600">{item.progress}%</span>
                      </div>
                      <Progress value={item.progress} className="h-2" />
                    </div>
                    {item.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Learning Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Learning Style Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Visual Learning</span>
                    <span className="text-sm text-blue-600">Primary</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Kinesthetic</span>
                    <span className="text-sm text-gray-600">Secondary</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Auditory</span>
                    <span className="text-sm text-gray-600">Tertiary</span>
                  </div>
                  <Progress value={40} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Personalization Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Tutor Personality</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['friendly', 'professional', 'encouraging', 'strict'].map((personality) => (
                      <Button
                        key={personality}
                        variant={tutorPersonality === personality ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTutorPersonality(personality as any)}
                        className="capitalize"
                      >
                        {personality}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Learning Pace</label>
                  <div className="flex gap-2">
                    {['Slow', 'Medium', 'Fast'].map((pace) => (
                      <Badge 
                        key={pace} 
                        variant={pace.toLowerCase() === learningProfile.pace ? 'default' : 'outline'}
                        className="cursor-pointer"
                      >
                        {pace}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Preferred Study Time</label>
                  <Badge variant="outline">{learningProfile.preferredTimeOfDay}</Badge>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Attention Span</label>
                  <div className="text-sm text-gray-600">{learningProfile.attentionSpan} minutes</div>
                  <Progress value={(learningProfile.attentionSpan / 60) * 100} className="h-2 mt-1" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Strengths & Areas for Improvement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-green-800 mb-3 flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Strengths
                  </h4>
                  <div className="space-y-2">
                    {learningProfile.strengths.map((strength, index) => (
                      <Badge key={index} className="bg-green-100 text-green-800 border-green-200">
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-orange-800 mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Areas for Improvement
                  </h4>
                  <div className="space-y-2">
                    {learningProfile.weaknesses.map((weakness, index) => (
                      <Badge key={index} className="bg-orange-100 text-orange-800 border-orange-200">
                        {weakness}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI-Generated Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Learning Pattern Detected</span>
                </div>
                <p className="text-sm text-blue-700">
                  You learn 34% faster when visual examples are provided before code explanations. 
                  I'll prioritize diagrams and visual aids in our sessions.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">Improvement Suggestion</span>
                </div>
                <p className="text-sm text-green-700">
                  Your focus is highest between 7-9 PM. Consider scheduling challenging topics during this time 
                  for optimal learning outcomes.
                </p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-purple-800">Personalized Recommendation</span>
                </div>
                <p className="text-sm text-purple-700">
                  Based on your progress, you're ready for advanced React patterns. I recommend starting 
                  with render props before moving to higher-order components.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Learning Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Concepts Mastered</span>
                  <span className="text-lg font-bold text-green-600">5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Average Session Duration</span>
                  <span className="text-lg font-bold">42 minutes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Questions Asked</span>
                  <span className="text-lg font-bold">18</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Comprehension Rate</span>
                  <span className="text-lg font-bold text-blue-600">89%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PersonalizedAITutor;