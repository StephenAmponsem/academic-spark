import useAuth from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { useEnrolledCourses } from "@/hooks/useEnrolledCourses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EnhancedCard, MetricCard, FeatureCard } from "@/components/ui/enhanced-card";
import { 
  PageTransition, 
  FadeInView, 
  StaggerChildren, 
  BouncyCard, 
  CountUp,
  FloatingElement 
} from "@/components/ui/page-transition";
import { LoadingSpinner, AnimatedCounter } from "@/components/ui/loading-states";

import { 
  BookOpen, 
  Users, 
  Clock, 
  Plus, 
  User, 
  Star, 
  ArrowLeft, 
  Home, 
  MessageCircle, 
  Settings as SettingsIcon, 
  Users2, 
  HelpCircle,
  TrendingUp,
  Calendar,
  Target,
  Award,
  Sparkles,
  Lightbulb,
  Zap,
  Globe,
  Heart,
  Brain,
  MessageSquare
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const { data: enrolledCourses, isLoading: enrolledCoursesLoading, error: enrolledCoursesError } = useEnrolledCourses();

  // Demo courses for when database is not available
  const demoCourses = [
    {
      id: 'demo-1',
      course_id: 'demo-course-1',
      user_id: user?.id || 'demo-user',
      enrolled_at: new Date().toISOString(),
      progress_percentage: 65,
      course: {
        id: 'demo-course-1',
        title: 'Introduction to React Development',
        description: 'Learn the fundamentals of React and build modern web applications',
        provider: 'EDUConnect',
        url: '#',
        duration: '12 hours',
        rating: 4.9,
        students: 1250,
        isLive: false,
        instructor: 'Sarah Chen',
        category: 'Web Development',
        thumbnail: undefined
      }
    },
    {
      id: 'demo-2',
      course_id: 'demo-course-2',
      user_id: user?.id || 'demo-user',
      enrolled_at: new Date().toISOString(),
      progress_percentage: 30,
      course: {
        id: 'demo-course-2',
        title: 'Advanced TypeScript Patterns',
        description: 'Master advanced TypeScript concepts and design patterns',
        provider: 'EDUConnect',
        url: '#',
        duration: '8 hours',
        rating: 4.7,
        students: 850,
        isLive: false,
        instructor: 'Michael Rodriguez',
        category: 'Programming',
        thumbnail: undefined
      }
    }
  ];

  // Use demo courses if there's an error or no courses
  const displayCourses = enrolledCoursesError || !enrolledCourses || enrolledCourses.length === 0 
    ? demoCourses 
    : enrolledCourses;

  // Set default role if none exists to prevent infinite loading
  const effectiveRole = role || 'student';

  const getDifficultyColor = (level: string | null) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'intermediate':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-emerald-800';
      case 'advanced':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300 border-slate-200 dark:border-slate-800';
    }
  };

  // Show loading if user is loading and has no role yet - but with timeout
  const [showDashboard, setShowDashboard] = useState(false);
  
  useEffect(() => {
    // Always show dashboard after 3 seconds, regardless of role status
    const timer = setTimeout(() => {
      setShowDashboard(true);
    }, 3000);
    
    // Show immediately if we have a role or if there's an error getting role
    if (user && role) {
      setShowDashboard(true);
      clearTimeout(timer);
    }
    
    return () => clearTimeout(timer);
  }, [user, role]);

  // Only show loading for a short time if user exists but no role yet
  if (user && (!role || role === 'none') && !showDashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" variant="gradient" />
          <p className="text-gray-600">Setting up your account...</p>
          <p className="text-xs text-gray-500">This should only take a moment...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 pt-20 pb-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="mb-8">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-20"></div>
                <div className="relative bg-white dark:bg-gray-800 rounded-full p-6 shadow-2xl">
                  <Sparkles className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Welcome to Your Learning Hub
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Sign in to access your personalized dashboard and start your learning journey
            </p>
            <Button onClick={() => navigate('/auth')} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
              <Sparkles className="h-5 w-5 mr-2" />
              Get Started
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 pt-20 pb-8">
        <div className="container mx-auto px-4">
        {/* Header Section */}
        <FadeInView direction="down" className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center gap-2 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200 shadow-sm"
              >
                <Home className="h-4 w-4" />
                Home
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/settings')}
                className="flex items-center gap-2 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200 shadow-sm"
              >
                <SettingsIcon className="h-4 w-4" />
                Settings
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Online</span>
              </div>
            </div>
          </div>
          
          <div className="text-center mb-8">
            <div className="mb-4">
              <Avatar className="h-20 w-20 mx-auto mb-4 shadow-lg">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  {user.user_metadata?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Welcome back, {user.user_metadata?.full_name || "Learner"}! 👋
            </h1>
            <p className="text-xl text-muted-foreground">
              Ready to continue your learning journey?
            </p>
          </div>
        </FadeInView>

        {/* Quick Stats */}
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <BouncyCard delay={0.1}>
            <MetricCard
              title="Enrolled Courses"
              value={displayCourses?.length?.toString() || "0"}
              icon={BookOpen}
              color="blue"
              className="text-white bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-lg hover:shadow-xl"
            />
          </BouncyCard>

          <BouncyCard delay={0.2}>
            <MetricCard
              title="AI Sessions"
              value="∞"
              icon={Brain}
              color="purple"
              className="text-white bg-gradient-to-br from-purple-500 to-purple-600 border-0 shadow-lg hover:shadow-xl"
            />
          </BouncyCard>

          <BouncyCard delay={0.3}>
            <MetricCard
              title="Real-time Learning"
              value="Live"
              icon={Globe}
              color="green"
              className="text-white bg-gradient-to-br from-emerald-500 to-emerald-600 border-0 shadow-lg hover:shadow-xl"
            />
          </BouncyCard>

          <BouncyCard delay={0.4}>
            <MetricCard
              title="Response Time"
              value="<2s"
              icon={Zap}
              color="orange"
              className="text-white bg-gradient-to-br from-amber-500 to-amber-600 border-0 shadow-lg hover:shadow-xl"
            />
          </BouncyCard>
        </StaggerChildren>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Courses */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="enrolled" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <TabsTrigger value="enrolled" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  My Learning
                </TabsTrigger>
                <TabsTrigger value="ai" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  AI Assistant
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="enrolled" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Enrolled Courses</h2>
                    <p className="text-muted-foreground">Continue where you left off</p>
                  </div>
                  <Button onClick={() => navigate('/my-learning')} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                    <Plus className="h-4 w-4 mr-2" />
                    My Learning
                  </Button>
                </div>

                {enrolledCoursesLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => (
                      <Card key={i} className="overflow-hidden">
                        <Skeleton className="h-48 w-full" />
                        <CardHeader>
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {enrolledCoursesError && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-700">
                          <strong>Demo Mode:</strong> Showing sample courses while database is initializing. Your actual enrolled courses will appear here once connected.
                        </p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {displayCourses?.map((enrollment) => (
                        <Card key={enrollment.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 shadow-lg hover:scale-105">
                        <div className="relative">
                          {enrollment.course?.thumbnail ? (
                            <img
                              src={enrollment.course.thumbnail}
                              alt={enrollment.course?.title || 'Course'}
                              className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                              <BookOpen className="h-16 w-16 text-white" />
                            </div>
                          )}
                          <div className="absolute top-4 left-4">
                            <Badge className={`${getDifficultyColor(enrollment.course?.category)} border`}>
                              {enrollment.course?.category || 'Not specified'}
                            </Badge>
                          </div>
                          <div className="absolute top-4 right-4">
                            <div className="w-8 h-8 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center shadow-lg">
                              <Heart className="h-4 w-4 text-red-500" />
                            </div>
                          </div>
                        </div>

                        <CardHeader className="pb-3">
                          <CardTitle className="text-xl font-bold text-foreground line-clamp-2">
                            {enrollment.course?.title || 'Course Title'}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-xs">
                                {enrollment.course?.instructor?.charAt(0) || 'I'}
                              </AvatarFallback>
                            </Avatar>
                            <span>{enrollment.course?.instructor || 'Instructor'}</span>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">{enrollment.progress_percentage || 0}%</span>
                            </div>
                            <Progress value={enrollment.progress_percentage || 0} className="h-2" />
                          </div>
                          
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{enrollment.course?.duration || 'Self-paced'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span>{enrollment.course?.rating || '4.8'}</span>
                            </div>
                          </div>
                          
                          <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                            <Zap className="h-4 w-4 mr-2" />
                            Continue Learning
                          </Button>
                        </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="ai" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">AI Learning Assistant</h2>
                    <p className="text-muted-foreground">Get instant help with your studies</p>
                  </div>
                  <Button onClick={() => navigate('/ai-tutor')} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg">
                    <Brain className="h-4 w-4 mr-2" />
                    Start AI Tutor
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="p-3 bg-purple-100 rounded-lg mr-4">
                          <Brain className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">24/7 AI Support</h3>
                          <p className="text-sm text-gray-600">Get help anytime, anywhere</p>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-4">
                        Our AI assistant can help you with concept explanations, problem solving, 
                        study guidance, and practice questions.
                      </p>
                      <Button 
                        onClick={() => navigate('/ai-tutor')}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Ask AI Tutor
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="p-3 bg-blue-100 rounded-lg mr-4">
                          <Zap className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Instant Responses</h3>
                          <p className="text-sm text-gray-600">Get answers in under 2 seconds</p>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-4">
                        No waiting time! Our AI provides immediate, accurate responses to help 
                        you learn faster and more effectively.
                      </p>
                      <Button 
                        onClick={() => navigate('/ai-tutor')}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Quick Questions
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Quick Actions & Collaboration */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => navigate('/ai-tutor')} 
                  variant="outline"
                  className="w-full justify-start bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200"
                >
                  <Brain className="h-4 w-4 mr-3 text-purple-600" />
                  <div className="text-left">
                    <div className="font-medium">AI Tutor</div>
                    <div className="text-xs text-muted-foreground">Get instant help</div>
                  </div>
                </Button>
                
                <Button 
                  onClick={() => navigate('/real-time-courses')} 
                  variant="outline"
                  className="w-full justify-start bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200"
                >
                  <Globe className="h-4 w-4 mr-3 text-blue-600" />
                  <div className="text-left">
                    <div className="font-medium">Browse Courses</div>
                    <div className="text-xs text-muted-foreground">Real-time courses</div>
                  </div>
                </Button>

                <Button 
                  onClick={() => navigate('/my-learning')} 
                  variant="outline"
                  className="w-full justify-start bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200"
                >
                  <BookOpen className="h-4 w-4 mr-3 text-green-600" />
                  <div className="text-left">
                    <div className="font-medium">My Learning</div>
                    <div className="text-xs text-muted-foreground">Enrolled courses</div>
                  </div>
                </Button>
              </CardContent>
            </Card>

            {/* Collaboration Hub */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-purple-600" />
                  Collaboration Hub
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div 
                    className="group p-4 rounded-lg bg-white/70 dark:bg-gray-800/70 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer border border-purple-200 dark:border-purple-800"
                    onClick={() => navigate('/collaboration')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">Find Peers</h3>
                        <p className="text-xs text-muted-foreground">Connect with students & instructors</p>
                      </div>
                      <div className="text-xs text-purple-600 font-medium">12 online</div>
                    </div>
                  </div>

                  <div 
                    className="group p-4 rounded-lg bg-white/70 dark:bg-gray-800/70 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer border border-green-200 dark:border-green-800"
                    onClick={() => navigate('/collaboration?tab=groups')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                        <BookOpen className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">Study Groups</h3>
                        <p className="text-xs text-muted-foreground">Join collaborative sessions</p>
                      </div>
                      <div className="text-xs text-green-600 font-medium">5 active</div>
                    </div>
                  </div>

                  <div 
                    className="group p-4 rounded-lg bg-white/70 dark:bg-gray-800/70 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer border border-orange-200 dark:border-orange-800"
                    onClick={() => navigate('/collaboration?tab=help')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50 transition-colors">
                        <HelpCircle className="h-5 w-5 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">Get Help</h3>
                        <p className="text-xs text-muted-foreground">Ask questions & get answers</p>
                      </div>
                      <div className="text-xs text-orange-600 font-medium">3 requests</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Learning Insights */}
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-amber-600" />
                  Learning Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-medium">Weekly Goal</span>
                    </div>
                    <span className="text-sm font-bold text-amber-600">80%</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Study Streak</span>
                    </div>
                    <span className="text-sm font-bold text-green-600">7 days</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">Achievements</span>
                    </div>
                    <span className="text-sm font-bold text-purple-600">8 earned</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Dashboard;