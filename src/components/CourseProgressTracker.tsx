import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Target, 
  Trophy, 
  Calendar,
  TrendingUp,
  Play,
  Award,
  Star,
  ArrowRight,
  BarChart3,
  Timer
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CourseProgress {
  courseId: string;
  title: string;
  provider: string;
  thumbnail?: string;
  totalLessons: number;
  completedLessons: number;
  progress: number;
  timeSpent: number; // in minutes
  estimatedTimeRemaining: number; // in minutes
  lastAccessed: Date;
  nextLesson?: {
    id: string;
    title: string;
    duration: number;
  };
  achievements: string[];
  streak: number;
}

interface CourseProgressTrackerProps {
  courses: CourseProgress[];
  onContinueCourse: (courseId: string) => void;
  onViewAllProgress?: () => void;
  className?: string;
}

export function CourseProgressTracker({ 
  courses, 
  onContinueCourse, 
  onViewAllProgress,
  className 
}: CourseProgressTrackerProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'all'>('week');

  // Calculate overall stats
  const totalCourses = courses.length;
  const completedCourses = courses.filter(c => c.progress === 100).length;
  const totalTimeSpent = courses.reduce((sum, course) => sum + course.timeSpent, 0);
  const averageProgress = totalCourses > 0 
    ? courses.reduce((sum, course) => sum + course.progress, 0) / totalCourses 
    : 0;

  // Find courses with recent activity
  const recentCourses = courses
    .filter(course => {
      const daysSinceAccess = (Date.now() - course.lastAccessed.getTime()) / (1000 * 60 * 60 * 24);
      return selectedTimeframe === 'week' ? daysSinceAccess <= 7 :
             selectedTimeframe === 'month' ? daysSinceAccess <= 30 : true;
    })
    .sort((a, b) => b.lastAccessed.getTime() - a.lastAccessed.getTime());

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'text-green-600 bg-green-100';
    if (progress >= 80) return 'text-blue-600 bg-blue-100';
    if (progress >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const CourseProgressCard = ({ course }: { course: CourseProgress }) => (
    <Card className="hover:shadow-md transition-all duration-300 border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 mb-1 line-clamp-1">
              {course.title}
            </h4>
            <p className="text-sm text-gray-600 mb-2">
              {course.provider}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{course.completedLessons}/{course.totalLessons} lessons</span>
              <span>•</span>
              <span>{formatTime(course.timeSpent)} studied</span>
            </div>
          </div>
          <Badge className={cn("text-xs font-medium", getProgressColor(course.progress))}>
            {Math.round(course.progress)}%
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <Progress value={course.progress} className="h-2" />
        </div>

        {/* Next Lesson */}
        {course.nextLesson && course.progress < 100 && (
          <div className="mb-3 p-2 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Play className="h-3 w-3 text-blue-600" />
              <span className="text-blue-800 font-medium">Next:</span>
              <span className="text-blue-700">{course.nextLesson.title}</span>
            </div>
            <div className="text-xs text-blue-600 mt-1">
              <Timer className="h-3 w-3 inline mr-1" />
              {formatTime(course.nextLesson.duration)}
            </div>
          </div>
        )}

        {/* Achievements */}
        {course.achievements.length > 0 && (
          <div className="flex items-center gap-1 mb-3">
            <Award className="h-3 w-3 text-yellow-500" />
            <span className="text-xs text-gray-600">
              {course.achievements.length} achievement{course.achievements.length !== 1 ? 's' : ''}
            </span>
            {course.streak > 0 && (
              <>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-orange-600">
                  {course.streak} day streak
                </span>
              </>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {course.progress === 100 ? (
            <Button size="sm" variant="outline" className="flex-1">
              <Trophy className="h-4 w-4 mr-2" />
              Completed
            </Button>
          ) : (
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => onContinueCourse(course.courseId)}
            >
              <Play className="h-4 w-4 mr-2" />
              Continue
            </Button>
          )}
        </div>

        {/* Last Accessed */}
        <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>
            Last studied {course.lastAccessed.toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Learning Progress</h2>
          <p className="text-sm text-gray-600">Track your course progress and achievements</p>
        </div>
        {onViewAllProgress && (
          <Button variant="outline" onClick={onViewAllProgress}>
            <BarChart3 className="h-4 w-4 mr-2" />
            View All
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{totalCourses}</div>
            <div className="text-sm text-gray-600">Active Courses</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{completedCourses}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{formatTime(totalTimeSpent)}</div>
            <div className="text-sm text-gray-600">Time Studied</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{Math.round(averageProgress)}%</div>
            <div className="text-sm text-gray-600">Avg Progress</div>
          </CardContent>
        </Card>
      </div>

      {/* Timeframe Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Show courses from:</span>
        <div className="flex bg-gray-100 rounded-lg p-1">
          {[
            { value: 'week', label: 'This Week' },
            { value: 'month', label: 'This Month' },
            { value: 'all', label: 'All Time' }
          ].map(option => (
            <Button
              key={option.value}
              variant={selectedTimeframe === option.value ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedTimeframe(option.value as any)}
              className="text-xs"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Course Progress List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Activity
          </h3>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <TrendingUp className="h-4 w-4" />
            <span>{recentCourses.length} courses</span>
          </div>
        </div>

        {recentCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentCourses.slice(0, 6).map(course => (
              <CourseProgressCard key={course.courseId} course={course} />
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2">
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No recent activity
              </h4>
              <p className="text-gray-600 mb-4">
                Start learning to see your progress here
              </p>
              <Button variant="outline">
                Browse Courses
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Show More Button */}
      {recentCourses.length > 6 && (
        <div className="text-center">
          <Button variant="outline" onClick={onViewAllProgress}>
            View All {recentCourses.length} Courses
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default CourseProgressTracker;