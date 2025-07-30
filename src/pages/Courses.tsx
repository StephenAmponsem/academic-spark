import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCourses, useEnrollInCourse } from "@/hooks/useCourses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, DollarSign, User, BookOpen, Star, ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Courses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: courses, isLoading } = useCourses();
  const enrollInCourse = useEnrollInCourse();
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);

  const handleEnroll = async (courseId: string) => {
    if (!user) return;
    
    setEnrollingCourseId(courseId);
    try {
      await enrollInCourse.mutateAsync(courseId);
    } finally {
      setEnrollingCourseId(null);
    }
  };

  const getDifficultyColor = (level: string | null) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 pt-20 pb-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <Skeleton className="h-12 w-64 mb-4" />
            <Skeleton className="h-6 w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
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
            Explore Courses
          </h1>
          <p className="text-xl text-muted-foreground">
            Discover amazing courses from expert instructors
          </p>
        </div>

        {courses?.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-foreground mb-2">No courses available yet</h3>
            <p className="text-muted-foreground">Check back later for new courses!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses?.map((course) => (
              <Card key={course.id} className="overflow-hidden hover:shadow-hover transition-all duration-300 group">
                <div className="relative">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-hero flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-white" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <Badge className={getDifficultyColor(course.difficulty_level)}>
                      {course.difficulty_level || 'Not specified'}
                    </Badge>
                  </div>
                </div>

                <CardHeader>
                  <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {course.title}
                  </CardTitle>
                  <p className="text-muted-foreground line-clamp-2">
                    {course.description || 'No description available'}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{course.instructor?.full_name || 'Unknown'}</span>
                    </div>
                    {course.duration_hours && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration_hours}h</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-lg font-semibold text-foreground">
                      <DollarSign className="h-5 w-5" />
                      <span>{course.price === 0 ? 'Free' : `$${course.price}`}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 fill-current text-yellow-400" />
                      <span>4.8</span>
                    </div>
                  </div>

                  {user ? (
                    <Button
                      onClick={() => handleEnroll(course.id)}
                      disabled={enrollingCourseId === course.id}
                      className="w-full hover:scale-105 transition-transform duration-300"
                      variant="default"
                    >
                      {enrollingCourseId === course.id ? 'Enrolling...' : 'Enroll Now'}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => window.location.href = '/auth'}
                      className="w-full hover:scale-105 transition-transform duration-300"
                      variant="outline"
                    >
                      Sign in to Enroll
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;