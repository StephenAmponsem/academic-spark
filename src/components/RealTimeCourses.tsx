import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Share2, 
  Users, 
  Clock, 
  Star,
  ExternalLink,
  Wifi,
  WifiOff,
  Globe,
  Search,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useEnrollInCourse, useEnrolledCourses } from '@/hooks/useEnrolledCourses';

interface ExternalCourse {
  id: string;
  title: string;
  description: string;
  provider: string;
  url: string;
  duration: string;
  rating: number;
  students: number;
  isLive: boolean;
  instructor: string;
  category: string;
  thumbnail?: string;
}

export function RealTimeCourses() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const enrollInCourse = useEnrollInCourse();
  const { data: enrolledCourses } = useEnrolledCourses();
  const [courses, setCourses] = useState<ExternalCourse[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<ExternalCourse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  // Categories for filtering
  const categories = [
    { id: 'all', name: 'All Courses' },
    { id: 'programming', name: 'Programming' },
    { id: 'mathematics', name: 'Mathematics' },
    { id: 'science', name: 'Science' },
    { id: 'business', name: 'Business' },
    { id: 'language', name: 'Languages' },
    { id: 'art', name: 'Arts & Design' }
  ];

  // Sample external courses (in real app, this would come from external APIs)
  const externalCourses: ExternalCourse[] = [
    {
      id: '1',
      title: 'Advanced JavaScript Programming',
      description: 'Master modern JavaScript with ES6+, async programming, and advanced patterns.',
      provider: 'Coursera',
      url: 'https://coursera.org/course/javascript',
      duration: '8 weeks',
      rating: 4.8,
      students: 15420,
      isLive: true,
      instructor: 'Dr. Sarah Johnson',
      category: 'programming'
    },
    {
      id: '2',
      title: 'Calculus for Beginners',
      description: 'Learn calculus fundamentals with interactive examples and real-world applications.',
      provider: 'edX',
      url: 'https://edx.org/course/calculus',
      duration: '12 weeks',
      rating: 4.6,
      students: 8920,
      isLive: true,
      instructor: 'Prof. Michael Chen',
      category: 'mathematics'
    },
    {
      id: '3',
      title: 'Data Science Fundamentals',
      description: 'Introduction to data science, statistics, and machine learning basics.',
      provider: 'Udacity',
      url: 'https://udacity.com/course/data-science',
      duration: '10 weeks',
      rating: 4.9,
      students: 23450,
      isLive: true,
      instructor: 'Dr. Emily Rodriguez',
      category: 'science'
    },
    {
      id: '4',
      title: 'Business Strategy & Management',
      description: 'Strategic thinking and business management principles for modern organizations.',
      provider: 'Harvard Online',
      url: 'https://harvard.edu/course/business',
      duration: '6 weeks',
      rating: 4.7,
      students: 5670,
      isLive: true,
      instructor: 'Prof. David Thompson',
      category: 'business'
    },
    {
      id: '5',
      title: 'Spanish for Beginners',
      description: 'Learn Spanish from scratch with native speakers and cultural insights.',
      provider: 'Duolingo',
      url: 'https://duolingo.com/course/spanish',
      duration: '16 weeks',
      rating: 4.5,
      students: 45680,
      isLive: true,
      instructor: 'Maria Garcia',
      category: 'language'
    },
    {
      id: '6',
      title: 'Digital Art & Design',
      description: 'Create stunning digital artwork using modern design tools and techniques.',
      provider: 'Skillshare',
      url: 'https://skillshare.com/course/digital-art',
      duration: '4 weeks',
      rating: 4.4,
      students: 12340,
      isLive: true,
      instructor: 'Alex Kim',
      category: 'art'
    },
    {
      id: '7',
      title: 'Python for Data Analysis',
      description: 'Learn Python programming with focus on data analysis and visualization.',
      provider: 'DataCamp',
      url: 'https://datacamp.com/course/python-data',
      duration: '6 weeks',
      rating: 4.7,
      students: 18750,
      isLive: true,
      instructor: 'Dr. James Wilson',
      category: 'programming'
    },
    {
      id: '8',
      title: 'Linear Algebra Essentials',
      description: 'Master linear algebra concepts essential for machine learning and engineering.',
      provider: 'MIT OpenCourseWare',
      url: 'https://ocw.mit.edu/course/linear-algebra',
      duration: '14 weeks',
      rating: 4.8,
      students: 11230,
      isLive: true,
      instructor: 'Prof. Lisa Anderson',
      category: 'mathematics'
    },
    {
      id: '9',
      title: 'Machine Learning Fundamentals',
      description: 'Introduction to machine learning algorithms and their practical applications.',
      provider: 'Stanford Online',
      url: 'https://stanford.edu/course/ml',
      duration: '12 weeks',
      rating: 4.9,
      students: 29870,
      isLive: true,
      instructor: 'Prof. Andrew Ng',
      category: 'science'
    },
    {
      id: '10',
      title: 'Financial Accounting',
      description: 'Learn accounting principles and financial statement analysis.',
      provider: 'Khan Academy',
      url: 'https://khanacademy.org/course/accounting',
      duration: '8 weeks',
      rating: 4.6,
      students: 9450,
      isLive: true,
      instructor: 'Prof. Robert Smith',
      category: 'business'
    },
    {
      id: '11',
      title: 'French Conversation',
      description: 'Improve French speaking skills through interactive conversations.',
      provider: 'Babbel',
      url: 'https://babbel.com/course/french',
      duration: '10 weeks',
      rating: 4.5,
      students: 15680,
      isLive: true,
      instructor: 'Sophie Dubois',
      category: 'language'
    },
    {
      id: '12',
      title: 'Web Development Bootcamp',
      description: 'Complete web development course covering HTML, CSS, JavaScript, and React.',
      provider: 'Udemy',
      url: 'https://udemy.com/course/web-dev',
      duration: '20 weeks',
      rating: 4.8,
      students: 45620,
      isLive: true,
      instructor: 'Colt Steele',
      category: 'programming'
    },
    {
      id: '13',
      title: 'Statistics for Beginners',
      description: 'Learn statistical concepts and methods for data analysis.',
      provider: 'Coursera',
      url: 'https://coursera.org/course/statistics',
      duration: '9 weeks',
      rating: 4.7,
      students: 13450,
      isLive: true,
      instructor: 'Dr. Jennifer Lee',
      category: 'mathematics'
    },
    {
      id: '14',
      title: 'Neuroscience Fundamentals',
      description: 'Explore the human brain and nervous system through interactive modules.',
      provider: 'edX',
      url: 'https://edx.org/course/neuroscience',
      duration: '11 weeks',
      rating: 4.6,
      students: 8230,
      isLive: true,
      instructor: 'Dr. Mark Johnson',
      category: 'science'
    },
    {
      id: '15',
      title: 'Digital Marketing Strategy',
      description: 'Learn modern digital marketing techniques and social media management.',
      provider: 'HubSpot Academy',
      url: 'https://hubspot.com/course/marketing',
      duration: '7 weeks',
      rating: 4.5,
      students: 18760,
      isLive: true,
      instructor: 'Sarah Williams',
      category: 'business'
    },
    {
      id: '16',
      title: 'Japanese for Beginners',
      description: 'Learn Japanese writing, speaking, and cultural context.',
      provider: 'Rosetta Stone',
      url: 'https://rosettastone.com/course/japanese',
      duration: '18 weeks',
      rating: 4.4,
      students: 9870,
      isLive: true,
      instructor: 'Yuki Tanaka',
      category: 'language'
    },
    {
      id: '17',
      title: 'Photography Masterclass',
      description: 'Master digital photography techniques and post-processing skills.',
      provider: 'CreativeLive',
      url: 'https://creativelive.com/course/photography',
      duration: '5 weeks',
      rating: 4.7,
      students: 15640,
      isLive: true,
      instructor: 'Annie Leibovitz',
      category: 'art'
    },
    {
      id: '18',
      title: 'React.js Advanced Concepts',
      description: 'Deep dive into React hooks, context, and advanced patterns.',
      provider: 'Frontend Masters',
      url: 'https://frontendmasters.com/course/react',
      duration: '6 weeks',
      rating: 4.8,
      students: 22340,
      isLive: true,
      instructor: 'Kent C. Dodds',
      category: 'programming'
    }
  ];

  useEffect(() => {
    // Initialize courses immediately
    setCourses(externalCourses);
    setFilteredCourses(externalCourses);
    setLoading(false);
    setIsConnected(true); // Set as connected by default for better UX
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    filterCourses(term, selectedCategory);
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    filterCourses(searchTerm, category);
  };

  const filterCourses = (search: string, category: string) => {
    let filtered = courses;

    // Filter by search term
    if (search) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(search.toLowerCase()) ||
        course.description.toLowerCase().includes(search.toLowerCase()) ||
        course.instructor.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter by category
    if (category !== 'all') {
      filtered = filtered.filter(course => course.category === category);
    }

    setFilteredCourses(filtered);
  };

  const handleCourseAccess = async (course: ExternalCourse) => {
    try {
      // Record course access
      if (user) {
        try {
          await supabase
            .from('course_access_logs')
            .insert({
              user_id: user.id,
              course_id: course.id,
              course_title: course.title,
              provider: course.provider,
              accessed_at: new Date().toISOString()
            });
        } catch (logError) {
          // If logging fails, just continue - it's not critical
          console.warn('Could not log course access:', logError);
        }
      }

      // Open course in new tab
      window.open(course.url, '_blank');
    } catch (error) {
      console.error('Error accessing course:', error);
    }
  };

  const handleEnrollInCourse = async (course: ExternalCourse) => {
    if (!user) {
      // If not logged in, redirect to auth
      navigate('/auth');
      return;
    }

    // Check if already enrolled
    const isEnrolled = enrolledCourses?.some(enrollment => enrollment.course_id === course.id);
    if (isEnrolled) {
      // If already enrolled, navigate to My Learning
      navigate('/my-learning');
      return;
    }

    try {
      await enrollInCourse.mutateAsync(course);
    } catch (error) {
      console.error('Error enrolling in course:', error);
    }
  };

  const isCourseEnrolled = (courseId: string) => {
    return enrolledCourses?.some(enrollment => enrollment.course_id === courseId) || false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                  <Globe className="h-8 w-8 mr-3 text-blue-600" />
                  Browse Courses
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Access courses from top providers worldwide with live updates
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-1">
                {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                {isConnected ? 'Connected' : 'Offline'}
              </Badge>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryFilter(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{course.title}</CardTitle>
                    <CardDescription className="text-sm mb-3">
                      {course.description}
                    </CardDescription>
                  </div>
                                     <div className="flex gap-2">
                     <Badge variant="outline">
                       {course.provider}
                     </Badge>
                     {isCourseEnrolled(course.id) && (
                       <Badge className="bg-green-500 text-white">
                         Enrolled
                       </Badge>
                     )}
                   </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {/* Course Info */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{course.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{course.students.toLocaleString()} students</span>
                    </div>
                    {course.isLive && (
                      <Badge variant="default" className="bg-green-500">
                        <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                        Live
                      </Badge>
                    )}
                  </div>

                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Instructor:</span> {course.instructor}
                  </div>

                                       {/* Action Buttons */}
                     <div className="flex gap-2 pt-2">
                       <Button
                         onClick={() => handleCourseAccess(course)}
                         className="flex-1 bg-blue-600 hover:bg-blue-700"
                       >
                         <ExternalLink className="h-4 w-4 mr-2" />
                         Access Course
                       </Button>
                                               <Button 
                          onClick={() => handleEnrollInCourse(course)}
                          disabled={enrollInCourse.isPending}
                          variant={isCourseEnrolled(course.id) ? "default" : "outline"}
                          size="sm"
                          className={isCourseEnrolled(course.id) 
                            ? "bg-green-600 hover:bg-green-700 text-white" 
                            : "bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                          }
                        >
                          {enrollInCourse.isPending ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                          ) : isCourseEnrolled(course.id) ? (
                            "Enrolled"
                          ) : (
                            <BookOpen className="h-4 w-4" />
                          )}
                        </Button>
                     </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
} 