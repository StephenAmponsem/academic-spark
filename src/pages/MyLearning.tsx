import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Clock, 
  Star, 
  ArrowLeft, 
  Trash2, 
  ExternalLink,
  Users,
  Globe,
  AlertTriangle,
  Plus
} from 'lucide-react';
import { useEnrolledCourses, useUnenrollFromCourse, useClearAllEnrollments } from '@/hooks/useEnrolledCourses';
import { useAuth } from '@/hooks/useAuth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function MyLearning() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: enrolledCourses, isLoading } = useEnrolledCourses();
  const unenrollFromCourse = useUnenrollFromCourse();
  const clearAllEnrollments = useClearAllEnrollments();
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Please Sign In</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You need to be signed in to view your enrolled courses.
          </p>
          <Button onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  const handleUnenroll = async (enrollmentId: string) => {
    try {
      await unenrollFromCourse.mutateAsync(enrollmentId);
      setCourseToDelete(null);
    } catch (error) {
      console.error('Error unenrolling from course:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllEnrollments.mutateAsync();
    } catch (error) {
      console.error('Error clearing all enrollments:', error);
    }
  };

  const handleCourseAccess = (courseUrl: string) => {
    if (courseUrl && courseUrl !== '#') {
      window.open(courseUrl, '_blank');
    } else {
      // Show a toast or alert that the course URL is not available
      console.warn('Course URL not available');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
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
            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
                className="mr-4 border-gray-300 hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                  <BookOpen className="h-8 w-8 mr-3 text-blue-600" />
                  My Learning
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Continue your learning journey with your enrolled courses
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => navigate('/real-time-courses')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Browse More Courses
              </Button>
              {enrolledCourses && enrolledCourses.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear All Enrolled Courses</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently remove all your enrolled courses from your learning dashboard.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleClearAll}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Clear All
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        {enrolledCourses && enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((enrollment) => (
              <Card key={enrollment.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 shadow-lg hover:scale-105">
                <div className="relative">
                  <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Globe className="h-16 w-16 text-white" />
                  </div>
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-green-500 text-white border">
                      Enrolled
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-8 h-8 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center shadow-lg hover:bg-red-50"
                          onClick={() => setCourseToDelete(enrollment.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Course</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove "{enrollment.course.title}" from your learning? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleUnenroll(enrollment.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-bold text-foreground line-clamp-2">
                    {enrollment.course?.title || `Course ${enrollment.course_id}`}
                  </CardTitle>
                  <p className="text-muted-foreground line-clamp-2 text-sm">
                    {enrollment.course?.description || 'Course description not available'}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{enrollment.progress_percentage}%</span>
                    </div>
                    <Progress value={enrollment.progress_percentage} className="h-2" />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                                         <div className="flex items-center gap-1">
                       <Clock className="h-4 w-4" />
                       <span>{enrollment.course?.duration || 'Duration not available'}</span>
                     </div>
                     <div className="flex items-center gap-1">
                       <Star className="h-4 w-4 text-yellow-500 fill-current" />
                       <span>{enrollment.course?.rating || 'N/A'}</span>
                     </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                                         <div className="flex items-center gap-1">
                       <Users className="h-4 w-4" />
                       <span>{enrollment.course?.students?.toLocaleString() || '0'} students</span>
                     </div>
                     <Badge variant="outline" className="text-xs">
                       {enrollment.course?.provider || 'Unknown'}
                     </Badge>
                  </div>

                                     <div className="text-sm text-muted-foreground">
                     <span className="font-medium">Instructor:</span> {enrollment.course?.instructor || 'Unknown'}
                   </div>
                  
                  <div className="flex gap-2 pt-2">
                                         <Button
                       onClick={() => handleCourseAccess(enrollment.course?.url || '#')}
                       className="flex-1 bg-blue-600 hover:bg-blue-700"
                       disabled={!enrollment.course?.url}
                     >
                       <ExternalLink className="h-4 w-4 mr-2" />
                       Continue Learning
                     </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <div className="mb-6">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-20"></div>
                <div className="relative bg-white dark:bg-gray-800 rounded-full p-4 shadow-lg">
                  <BookOpen className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Start Your Learning Journey</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              You haven't enrolled in any courses yet. Discover amazing courses and begin your educational adventure today!
            </p>
            <Button 
              onClick={() => navigate('/real-time-courses')} 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Browse Courses
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
} 