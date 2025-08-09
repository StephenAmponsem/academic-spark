import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import {
  BookOpen,
  TrendingUp,
  Clock,
  Target,
  Award,
  Users,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Download,
  Share2,
  Filter,
  RefreshCw,
  Zap,
  Trophy,
  Flame,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import useAuth from '@/hooks/useAuth';
import { formatDistanceToNow, format, subDays, subWeeks, subMonths } from 'date-fns';

interface CourseProgress {
  id: string;
  title: string;
  category: string;
  progress: number;
  timeSpent: number;
  lastAccessed: Date;
  completedLessons: number;
  totalLessons: number;
  averageScore: number;
  streak: number;
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: Date;
  points: number;
}

interface StudySession {
  date: string;
  duration: number;
  coursesStudied: number;
  focusScore: number;
}

interface LearningGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  deadline: Date;
  category: string;
  isCompleted: boolean;
}

export function ProgressDashboard() {
  const { user, role } = useAuth();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [viewType, setViewType] = useState<'overview' | 'detailed' | 'goals'>('overview');

  // Mock data - in real app, fetch from API
  const courses: CourseProgress[] = [
    {
      id: '1',
      title: 'React Advanced Patterns',
      category: 'Programming',
      progress: 75,
      timeSpent: 1200, // minutes
      lastAccessed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      completedLessons: 15,
      totalLessons: 20,
      averageScore: 87,
      streak: 5,
      achievements: [
        {
          id: '1',
          title: 'Quick Learner',
          description: 'Completed 5 lessons in one day',
          icon: 'zap',
          earnedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          points: 100
        }
      ]
    },
    {
      id: '2',
      title: 'Data Structures & Algorithms',
      category: 'Computer Science',
      progress: 45,
      timeSpent: 800,
      lastAccessed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      completedLessons: 12,
      totalLessons: 28,
      averageScore: 92,
      streak: 3,
      achievements: []
    },
    {
      id: '3',
      title: 'UI/UX Design Fundamentals',
      category: 'Design',
      progress: 100,
      timeSpent: 2400,
      lastAccessed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      completedLessons: 16,
      totalLessons: 16,
      averageScore: 94,
      streak: 0,
      achievements: [
        {
          id: '2',
          title: 'Course Completed',
          description: 'Finished UI/UX Design Fundamentals',
          icon: 'trophy',
          earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          points: 500
        }
      ]
    }
  ];

  // Generate study session data
  const studySessions: StudySession[] = useMemo(() => {
    const sessions = [];
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : timeRange === 'quarter' ? 90 : 365;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      sessions.push({
        date: format(date, 'MMM dd'),
        duration: Math.floor(Math.random() * 180) + 30, // 30-210 minutes
        coursesStudied: Math.floor(Math.random() * 3) + 1,
        focusScore: Math.floor(Math.random() * 40) + 60 // 60-100
      });
    }
    return sessions;
  }, [timeRange]);

  const learningGoals: LearningGoal[] = [
    {
      id: '1',
      title: 'Complete React Course',
      target: 100,
      current: 75,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      category: 'Programming',
      isCompleted: false
    },
    {
      id: '2',
      title: 'Study 10 hours this week',
      target: 600, // minutes
      current: 420,
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      category: 'Time',
      isCompleted: false
    },
    {
      id: '3',
      title: 'Earn 1000 points',
      target: 1000,
      current: 750,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      category: 'Points',
      isCompleted: false
    }
  ];

  // Calculate statistics
  const totalTimeSpent = courses.reduce((sum, course) => sum + course.timeSpent, 0);
  const averageProgress = courses.reduce((sum, course) => sum + course.progress, 0) / courses.length;
  const completedCourses = courses.filter(course => course.progress === 100).length;
  const totalAchievements = courses.reduce((sum, course) => sum + course.achievements.length, 0);
  const currentStreak = Math.max(...courses.map(course => course.streak));

  const categoryData = courses.reduce((acc, course) => {
    acc[course.category] = (acc[course.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(categoryData).map(([category, count]) => ({
    name: category,
    value: count,
    fill: `hsl(${Math.random() * 360}, 70%, 50%)`
  }));

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getAchievementIcon = (icon: string) => {
    switch (icon) {
      case 'zap': return <Zap className="h-4 w-4" />;
      case 'trophy': return <Trophy className="h-4 w-4" />;
      case 'flame': return <Flame className="h-4 w-4" />;
      case 'star': return <Star className="h-4 w-4" />;
      default: return <Award className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Learning Dashboard</h1>
          <p className="text-gray-600">Track your progress and achieve your learning goals</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={viewType} onValueChange={(value: any) => setViewType(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Analytics</TabsTrigger>
          <TabsTrigger value="goals">Goals & Achievements</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <BookOpen className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{courses.length}</div>
                <div className="text-sm text-gray-600">Active Courses</div>
                <div className="text-xs text-green-600 mt-1">
                  {completedCourses} completed
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{formatTime(totalTimeSpent)}</div>
                <div className="text-sm text-gray-600">Time Studied</div>
                <div className="text-xs text-blue-600 mt-1">
                  {formatTime(totalTimeSpent / courses.length)} avg per course
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{Math.round(averageProgress)}%</div>
                <div className="text-sm text-gray-600">Average Progress</div>
                <div className="text-xs text-green-600 mt-1">
                  +5% from last month
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Flame className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{currentStreak}</div>
                <div className="text-sm text-gray-600">Day Streak</div>
                <div className="text-xs text-orange-600 mt-1">
                  Keep it going!
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Study Time Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Study Time Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={studySessions.slice(-14)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [formatTime(value as number), 'Study Time']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="duration" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Course Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Course Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Course Progress List */}
          <Card>
            <CardHeader>
              <CardTitle>Course Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {courses.map((course) => (
                  <div key={course.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{course.title}</h4>
                        <Badge variant="secondary">{course.category}</Badge>
                        {course.streak > 0 && (
                          <Badge variant="outline" className="text-orange-600">
                            <Flame className="h-3 w-3 mr-1" />
                            {course.streak} day streak
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                        <span>•</span>
                        <span>{formatTime(course.timeSpent)} studied</span>
                        <span>•</span>
                        <span>Avg score: {course.averageScore}%</span>
                      </div>
                      
                      <Progress value={course.progress} className="h-2" />
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{course.progress}%</div>
                      <div className="text-xs text-gray-500">
                        Last: {formatDistanceToNow(course.lastAccessed, { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Detailed Analytics Tab */}
        <TabsContent value="detailed" className="space-y-6">
          {/* Advanced Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Focus Score Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={studySessions.slice(-14)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="focusScore" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Learning Velocity</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={studySessions.slice(-7)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="coursesStudied" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Goals & Achievements Tab */}
        <TabsContent value="goals" className="space-y-6">
          {/* Learning Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Learning Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {learningGoals.map((goal) => (
                  <div key={goal.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{goal.title}</h4>
                      <Badge variant={goal.isCompleted ? "default" : "secondary"}>
                        {goal.category}
                      </Badge>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>{goal.current}</span>
                        <span>{goal.target}</span>
                      </div>
                      <Progress value={(goal.current / goal.target) * 100} className="h-2" />
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Due: {format(goal.deadline, 'MMM dd, yyyy')}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {courses.flatMap(course => course.achievements).map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex-shrink-0 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white">
                      {getAchievementIcon(achievement.icon)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                      <div className="text-xs text-gray-500 mt-1">
                        Earned {formatDistanceToNow(achievement.earnedAt, { addSuffix: true })}
                      </div>
                    </div>
                    <Badge className="bg-yellow-500">
                      +{achievement.points} pts
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProgressDashboard;