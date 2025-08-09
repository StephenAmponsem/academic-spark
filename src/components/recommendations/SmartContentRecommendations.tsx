import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Clock, 
  Star, 
  BookOpen, 
  Video, 
  FileText, 
  Users,
  Zap,
  Award,
  Eye,
  ThumbsUp,
  PlayCircle,
  Download,
  Bookmark,
  Share2,
  ChevronRight,
  Sparkles,
  Lightbulb,
  TrendingDown,
  ArrowRight,
  Filter,
  RefreshCw,
  Settings,
  Heart,
  MessageSquare,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Info,
  Flame,
  Crown,
  Rocket,
  Globe,
  Code,
  Palette,
  Calculator,
  Languages
} from 'lucide-react';
import { cn } from '@/lib/utils';
import useAuth from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

interface RecommendedContent {
  id: string;
  title: string;
  description: string;
  type: 'course' | 'lesson' | 'video' | 'article' | 'exercise' | 'quiz' | 'project';
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // minutes
  rating: number;
  enrollments: number;
  author: {
    id: string;
    name: string;
    avatar?: string;
    verified: boolean;
  };
  thumbnail?: string;
  tags: string[];
  confidence: number; // ML confidence score 0-100
  reasoningFactors: ReasoningFactor[];
  personalizedScore: number;
  trendingScore: number;
  completionRate: number;
  prerequisites: string[];
  learningOutcomes: string[];
  createdAt: Date;
  updatedAt: Date;
  isBookmarked: boolean;
  isEnrolled: boolean;
  progress?: number;
}

interface ReasoningFactor {
  type: 'similarity' | 'progression' | 'popularity' | 'difficulty_match' | 'time_preference' | 'peer_activity' | 'skill_gap';
  weight: number;
  explanation: string;
  icon: string;
}

interface UserLearningProfile {
  interests: string[];
  currentLevel: Record<string, number>; // subject -> level (0-100)
  learningGoals: string[];
  preferredDifficulty: string;
  studyTimeAvailable: number; // minutes per day
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  completedCourses: string[];
  skillGaps: string[];
  careerGoals: string[];
}

interface SmartContentRecommendationsProps {
  userId?: string;
  context?: 'dashboard' | 'course' | 'search' | 'profile';
  limit?: number;
  className?: string;
}

export function SmartContentRecommendations({ 
  userId, 
  context = 'dashboard', 
  limit = 10,
  className 
}: SmartContentRecommendationsProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'for-you' | 'trending' | 'similar' | 'advanced'>('for-you');
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<RecommendedContent[]>([]);
  const [userProfile, setUserProfile] = useState<UserLearningProfile | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Mock user learning profile
  const mockUserProfile: UserLearningProfile = {
    interests: ['React', 'JavaScript', 'Web Development', 'UI/UX Design', 'TypeScript'],
    currentLevel: {
      'JavaScript': 75,
      'React': 65,
      'TypeScript': 45,
      'Node.js': 30,
      'CSS': 80,
      'UI/UX': 55
    },
    learningGoals: ['Master React Patterns', 'Learn Backend Development', 'Improve TypeScript Skills'],
    preferredDifficulty: 'intermediate',
    studyTimeAvailable: 120, // 2 hours per day
    learningStyle: 'visual',
    completedCourses: ['react-basics', 'javascript-fundamentals', 'css-advanced'],
    skillGaps: ['Testing', 'State Management', 'Performance Optimization'],
    careerGoals: ['Frontend Developer', 'Full Stack Developer']
  };

  // Mock recommendations data
  const mockRecommendations: RecommendedContent[] = [
    {
      id: '1',
      title: 'Advanced React State Management with Redux Toolkit',
      description: 'Master modern state management patterns using Redux Toolkit and RTK Query for scalable React applications.',
      type: 'course',
      category: 'Programming',
      difficulty: 'advanced',
      duration: 180,
      rating: 4.8,
      enrollments: 12500,
      author: {
        id: '1',
        name: 'Sarah Chen',
        avatar: '/avatars/sarah.jpg',
        verified: true
      },
      thumbnail: '/thumbnails/redux-course.jpg',
      tags: ['React', 'Redux', 'State Management', 'TypeScript'],
      confidence: 95,
      reasoningFactors: [
        {
          type: 'skill_gap',
          weight: 0.4,
          explanation: 'Addresses your identified skill gap in state management',
          icon: 'target'
        },
        {
          type: 'progression',
          weight: 0.3,
          explanation: 'Natural next step after completing React basics',
          icon: 'trending-up'
        },
        {
          type: 'difficulty_match',
          weight: 0.2,
          explanation: 'Matches your intermediate-advanced skill level',
          icon: 'zap'
        },
        {
          type: 'popularity',
          weight: 0.1,
          explanation: 'Highly rated by learners with similar backgrounds',
          icon: 'star'
        }
      ],
      personalizedScore: 92,
      trendingScore: 78,
      completionRate: 85,
      prerequisites: ['React Basics', 'JavaScript ES6+'],
      learningOutcomes: ['Redux Toolkit mastery', 'Complex state management', 'Performance optimization'],
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      isBookmarked: false,
      isEnrolled: false
    },
    {
      id: '2',
      title: 'TypeScript for React Developers',
      description: 'Enhance your React skills with TypeScript. Learn type safety, interfaces, and advanced TypeScript patterns.',
      type: 'course',
      category: 'Programming',
      difficulty: 'intermediate',
      duration: 120,
      rating: 4.7,
      enrollments: 8900,
      author: {
        id: '2',
        name: 'Alex Rodriguez',
        avatar: '/avatars/alex.jpg',
        verified: true
      },
      thumbnail: '/thumbnails/typescript-react.jpg',
      tags: ['TypeScript', 'React', 'Type Safety', 'Development'],
      confidence: 88,
      reasoningFactors: [
        {
          type: 'similarity',
          weight: 0.35,
          explanation: 'Similar to courses you\'ve completed and enjoyed',
          icon: 'heart'
        },
        {
          type: 'progression',
          weight: 0.35,
          explanation: 'Builds on your current React knowledge',
          icon: 'trending-up'
        },
        {
          type: 'time_preference',
          weight: 0.2,
          explanation: 'Fits your available study time schedule',
          icon: 'clock'
        },
        {
          type: 'peer_activity',
          weight: 0.1,
          explanation: 'Popular among your peer group',
          icon: 'users'
        }
      ],
      personalizedScore: 89,
      trendingScore: 92,
      completionRate: 78,
      prerequisites: ['JavaScript ES6+', 'React Basics'],
      learningOutcomes: ['TypeScript proficiency', 'Type-safe React components', 'Better development experience'],
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      isBookmarked: true,
      isEnrolled: false
    },
    {
      id: '3',
      title: 'React Testing: Jest and React Testing Library',
      description: 'Comprehensive guide to testing React applications using Jest and React Testing Library.',
      type: 'video',
      category: 'Programming',
      difficulty: 'intermediate',
      duration: 90,
      rating: 4.6,
      enrollments: 5600,
      author: {
        id: '3',
        name: 'Emma Wilson',
        avatar: '/avatars/emma.jpg',
        verified: false
      },
      thumbnail: '/thumbnails/react-testing.jpg',
      tags: ['React', 'Testing', 'Jest', 'Quality Assurance'],
      confidence: 82,
      reasoningFactors: [
        {
          type: 'skill_gap',
          weight: 0.5,
          explanation: 'Critical skill gap in testing that needs addressing',
          icon: 'target'
        },
        {
          type: 'difficulty_match',
          weight: 0.3,
          explanation: 'Appropriate difficulty for your current level',
          icon: 'zap'
        },
        {
          type: 'time_preference',
          weight: 0.2,
          explanation: 'Short format matches your learning preferences',
          icon: 'clock'
        }
      ],
      personalizedScore: 85,
      trendingScore: 65,
      completionRate: 72,
      prerequisites: ['React Basics', 'JavaScript Testing Concepts'],
      learningOutcomes: ['Testing strategies', 'Quality assurance', 'Debugging skills'],
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      isBookmarked: false,
      isEnrolled: false
    },
    {
      id: '4',
      title: 'Node.js Backend Fundamentals',
      description: 'Start your backend journey with Node.js. Learn server development, APIs, and database integration.',
      type: 'course',
      category: 'Backend Development',
      difficulty: 'beginner',
      duration: 200,
      rating: 4.5,
      enrollments: 15200,
      author: {
        id: '4',
        name: 'Michael Brown',
        avatar: '/avatars/michael.jpg',
        verified: true
      },
      thumbnail: '/thumbnails/nodejs-backend.jpg',
      tags: ['Node.js', 'Backend', 'API', 'Server Development'],
      confidence: 76,
      reasoningFactors: [
        {
          type: 'progression',
          weight: 0.4,
          explanation: 'Natural progression to full-stack development',
          icon: 'trending-up'
        },
        {
          type: 'similarity',
          weight: 0.3,
          explanation: 'Aligns with your career goals',
          icon: 'target'
        },
        {
          type: 'popularity',
          weight: 0.3,
          explanation: 'Highly recommended for frontend developers',
          icon: 'star'
        }
      ],
      personalizedScore: 78,
      trendingScore: 88,
      completionRate: 68,
      prerequisites: ['JavaScript Fundamentals'],
      learningOutcomes: ['Backend development', 'API creation', 'Database integration'],
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      isBookmarked: false,
      isEnrolled: false
    },
    {
      id: '5',
      title: 'UI/UX Design Principles for Developers',
      description: 'Enhance your development skills with design thinking and UI/UX principles.',
      type: 'course',
      category: 'Design',
      difficulty: 'beginner',
      duration: 150,
      rating: 4.4,
      enrollments: 7800,
      author: {
        id: '5',
        name: 'Lisa Wang',
        avatar: '/avatars/lisa.jpg',
        verified: true
      },
      thumbnail: '/thumbnails/ui-ux-design.jpg',
      tags: ['UI/UX', 'Design', 'User Experience', 'Visual Design'],
      confidence: 71,
      reasoningFactors: [
        {
          type: 'similarity',
          weight: 0.4,
          explanation: 'Complements your frontend development skills',
          icon: 'palette'
        },
        {
          type: 'time_preference',
          weight: 0.3,
          explanation: 'Good length for your study schedule',
          icon: 'clock'
        },
        {
          type: 'peer_activity',
          weight: 0.3,
          explanation: 'Trending among frontend developers',
          icon: 'users'
        }
      ],
      personalizedScore: 74,
      trendingScore: 82,
      completionRate: 76,
      prerequisites: ['Basic design awareness'],
      learningOutcomes: ['Design thinking', 'User experience', 'Visual aesthetics'],
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      isBookmarked: false,
      isEnrolled: false
    }
  ];

  // Load recommendations
  useEffect(() => {
    setIsLoading(true);
    setUserProfile(mockUserProfile);
    
    // Simulate API call
    setTimeout(() => {
      const filtered = mockRecommendations.slice(0, limit);
      setRecommendations(filtered);
      setIsLoading(false);
    }, 1500);
  }, [limit, refreshKey]);

  // Filter recommendations by tab
  const filteredRecommendations = useMemo(() => {
    switch (activeTab) {
      case 'trending':
        return [...recommendations].sort((a, b) => b.trendingScore - a.trendingScore);
      case 'similar':
        return recommendations.filter(r => 
          r.reasoningFactors.some(f => f.type === 'similarity')
        );
      case 'advanced':
        return recommendations.filter(r => r.difficulty === 'advanced');
      case 'for-you':
      default:
        return [...recommendations].sort((a, b) => b.personalizedScore - a.personalizedScore);
    }
  }, [recommendations, activeTab]);

  const refreshRecommendations = () => {
    setRefreshKey(prev => prev + 1);
  };

  const getReasoningIcon = (type: string) => {
    const iconMap = {
      'similarity': Heart,
      'progression': TrendingUp,
      'popularity': Star,
      'difficulty_match': Zap,
      'time_preference': Clock,
      'peer_activity': Users,
      'skill_gap': Target
    };
    return iconMap[type as keyof typeof iconMap] || Info;
  };

  const getTypeIcon = (type: string) => {
    const iconMap = {
      'course': BookOpen,
      'lesson': PlayCircle,
      'video': Video,
      'article': FileText,
      'exercise': Code,
      'quiz': Target,
      'project': Rocket
    };
    return iconMap[type as keyof typeof iconMap] || BookOpen;
  };

  const getCategoryIcon = (category: string) => {
    const iconMap = {
      'Programming': Code,
      'Design': Palette,
      'Business': Calculator,
      'Language': Languages,
      'Science': Globe,
      'Backend Development': Code
    };
    return iconMap[category as keyof typeof iconMap] || BookOpen;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100 border-green-200';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'advanced': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const RecommendationCard = ({ content }: { content: RecommendedContent }) => {
    const TypeIcon = getTypeIcon(content.type);
    const CategoryIcon = getCategoryIcon(content.category);
    
    return (
      <Card className="hover:shadow-lg transition-all duration-300 group">
        <CardContent className="p-0">
          {/* Thumbnail */}
          <div className="relative h-40 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg">
            <div className="absolute inset-0 bg-black bg-opacity-20 rounded-t-lg" />
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge className={cn("text-xs border", getDifficultyColor(content.difficulty))}>
                {content.difficulty}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <TypeIcon className="h-3 w-3 mr-1" />
                {content.type}
              </Badge>
            </div>
            
            <div className="absolute top-3 right-3">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 bg-white bg-opacity-20 hover:bg-opacity-30"
              >
                <Bookmark className={cn("h-4 w-4", content.isBookmarked ? "fill-current text-yellow-400" : "text-white")} />
              </Button>
            </div>

            <div className="absolute bottom-3 left-3 right-3">
              <div className="flex items-center justify-between text-white text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDuration(content.duration)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current text-yellow-400" />
                  <span>{content.rating}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex items-start gap-3 mb-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={content.author.avatar} />
                <AvatarFallback className="text-xs">
                  {content.author.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {content.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-600">{content.author.name}</span>
                  {content.author.verified && (
                    <CheckCircle className="h-3 w-3 text-blue-500" />
                  )}
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {content.description}
            </p>

            {/* ML Confidence and Reasoning */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">AI Recommendation</span>
                </div>
                <Badge className="bg-blue-100 text-blue-800 text-xs">
                  {content.confidence}% confidence
                </Badge>
              </div>
              
              <div className="space-y-1">
                {content.reasoningFactors.slice(0, 2).map((factor, index) => {
                  const IconComponent = getReasoningIcon(factor.type);
                  return (
                    <div key={index} className="flex items-center gap-2 text-xs text-blue-700">
                      <IconComponent className="h-3 w-3" />
                      <span>{factor.explanation}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-3">
              {content.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {content.tags.length > 3 && (
                <span className="text-xs text-gray-500">+{content.tags.length - 3} more</span>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {content.enrollments.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {content.completionRate}% completion
                </span>
              </div>
              <span>{formatDistanceToNow(content.updatedAt, { addSuffix: true })}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button className="flex-1" size="sm">
                {content.isEnrolled ? 'Continue' : 'Start Learning'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button variant="outline" size="sm" className="px-3">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
          <div className="h-8 bg-gray-200 rounded w-24 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-0">
                <div className="h-40 bg-gray-200 rounded-t-lg" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-blue-500" />
            Smart Recommendations
          </h2>
          <p className="text-gray-600">
            Personalized content powered by machine learning
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refreshRecommendations}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Customize
          </Button>
        </div>
      </div>

      {/* Learning Profile Summary */}
      {userProfile && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Your Learning Profile</h3>
              <Badge className="bg-blue-100 text-blue-800">
                {Object.values(userProfile.currentLevel).reduce((sum, level) => sum + level, 0) / Object.keys(userProfile.currentLevel).length | 0}% avg skill level
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Current Focus</h4>
                <div className="flex flex-wrap gap-1">
                  {userProfile.interests.slice(0, 3).map((interest, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Learning Goals</h4>
                <div className="flex flex-wrap gap-1">
                  {userProfile.learningGoals.slice(0, 2).map((goal, index) => (
                    <Badge key={index} className="bg-green-100 text-green-800 text-xs">
                      {goal}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Skill Gaps</h4>
                <div className="flex flex-wrap gap-1">
                  {userProfile.skillGaps.slice(0, 2).map((gap, index) => (
                    <Badge key={index} className="bg-orange-100 text-orange-800 text-xs">
                      {gap}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendation Tabs */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="for-you" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            For You
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="similar" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Similar
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Rocket className="h-4 w-4" />
            Advanced
          </TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        {['for-you', 'trending', 'similar', 'advanced'].map(tab => (
          <TabsContent key={tab} value={tab} className="space-y-6">
            {filteredRecommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecommendations.map((content) => (
                  <RecommendationCard key={content.id} content={content} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No recommendations found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    We're still learning about your preferences. Complete more courses to get better recommendations.
                  </p>
                  <Button onClick={refreshRecommendations}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* ML Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Recommendation Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">95%</div>
              <div className="text-sm text-gray-600">Prediction Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">12</div>
              <div className="text-sm text-gray-600">Skill Improvements</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">8.4</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SmartContentRecommendations;