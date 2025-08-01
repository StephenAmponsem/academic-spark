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
  ArrowLeft,
  Play,
  Award,
  TrendingUp,
  Bookmark,
  Heart
} from 'lucide-react';
import useAuth from '@/hooks/useAuth';
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
  price?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  language?: string;
  certificate?: boolean;
}

export function RealTimeCourses() {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const enrollInCourse = useEnrollInCourse();
  const { data: enrolledCourses } = useEnrolledCourses();
  const [courses, setCourses] = useState<ExternalCourse[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<ExternalCourse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Categories for filtering
  const categories = [
    { id: 'all', name: 'All Courses' },
    { id: 'programming', name: 'Programming' },
    { id: 'mathematics', name: 'Mathematics' },
    { id: 'science', name: 'Science' },
    { id: 'business', name: 'Business' },
    { id: 'language', name: 'Languages' },
    { id: 'art', name: 'Arts & Design' },
    { id: 'data-science', name: 'Data Science' },
    { id: 'ai-ml', name: 'AI & Machine Learning' },
    { id: 'web-development', name: 'Web Development' }
  ];

  // Levels for filtering
  const levels = [
    { id: 'all', name: 'All Levels' },
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' }
  ];

  // Enhanced external courses with more realistic data
  const externalCourses: ExternalCourse[] = [
    {
      id: 'react-complete-guide',
      title: 'React - The Complete Guide (incl Hooks, React Router, Redux)',
      description: 'Dive in and learn React.js from scratch! Learn Reactjs, Hooks, Redux, React Router, Next.js, Best Practices and way more!',
      provider: 'Udemy',
      url: 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/',
      duration: '48 hours',
      rating: 4.8,
      students: 892000,
      isLive: true,
      instructor: 'Maximilian Schwarzmüller',
      category: 'programming',
      price: '$89.99',
      level: 'beginner',
      language: 'English',
      certificate: true
    },
    {
      id: 'python-data-science',
      title: 'Python for Data Science and Machine Learning Bootcamp',
      description: 'Learn how to use NumPy, Pandas, Seaborn, Matplotlib, Plotly, Scikit-Learn, Machine Learning, Tensorflow, and more!',
      provider: 'Udemy',
      url: 'https://www.udemy.com/course/python-for-data-science-and-machine-learning-bootcamp/',
      duration: '44 hours',
      rating: 4.6,
      students: 456000,
      isLive: true,
      instructor: 'Jose Portilla',
      category: 'data-science',
      price: '$94.99',
      level: 'intermediate',
      language: 'English',
      certificate: true
    },
    {
      id: 'javascript-modern',
      title: 'The Complete JavaScript Course 2024: From Zero to Expert!',
      description: 'The modern JavaScript course for everyone! Master JavaScript with projects, challenges and theory. Many courses in one!',
      provider: 'Udemy',
      url: 'https://www.udemy.com/course/the-complete-javascript-course/',
      duration: '69 hours',
      rating: 4.8,
      students: 1234000,
      isLive: true,
      instructor: 'Jonas Schmedtmann',
      category: 'programming',
      price: '$84.99',
      level: 'beginner',
      language: 'English',
      certificate: true
    },
    {
      id: 'machine-learning-stanford',
      title: 'Machine Learning',
      description: 'Machine learning is the science of getting computers to act without being explicitly programmed.',
      provider: 'Coursera',
      url: 'https://www.coursera.org/learn/machine-learning',
      duration: '11 weeks',
      rating: 4.9,
      students: 4500000,
      isLive: true,
      instructor: 'Andrew Ng',
      category: 'ai-ml',
      price: 'Free',
      level: 'intermediate',
      language: 'English',
      certificate: true
    },
    {
      id: 'web-development-bootcamp',
      title: 'The Complete 2024 Web Development Bootcamp',
      description: 'Become a Full-Stack Web Developer with just ONE course. HTML, CSS, JavaScript, Node.js, React, MongoDB, Web3 and DApps',
      provider: 'Udemy',
      url: 'https://www.udemy.com/course/the-complete-web-development-bootcamp/',
      duration: '65 hours',
      rating: 4.7,
      students: 2340000,
      isLive: true,
      instructor: 'Dr. Angela Yu',
      category: 'web-development',
      price: '$84.99',
      level: 'beginner',
      language: 'English',
      certificate: true
    },
    {
      id: 'calculus-mit',
      title: 'Calculus 1A: Differentiation',
      description: 'Discover the derivative—what it is, how to compute it, and when to apply it in solving real world problems.',
      provider: 'edX',
      url: 'https://www.edx.org/course/calculus-1a-differentiation',
      duration: '12 weeks',
      rating: 4.5,
      students: 89000,
      isLive: true,
      instructor: 'David Jerison',
      category: 'mathematics',
      price: 'Free',
      level: 'intermediate',
      language: 'English',
      certificate: true
    },
    {
      id: 'business-strategy-harvard',
      title: 'Business Strategy',
      description: 'Learn how to analyze business opportunities and develop a comprehensive business strategy.',
      provider: 'Harvard Business School Online',
      url: 'https://online.hbs.edu/courses/business-strategy/',
      duration: '8 weeks',
      rating: 4.8,
      students: 67000,
      isLive: true,
      instructor: 'Felix Oberholzer-Gee',
      category: 'business',
      price: '$1,600',
      level: 'intermediate',
      language: 'English',
      certificate: true
    },
    {
      id: 'spanish-duolingo',
      title: 'Spanish for Beginners',
      description: 'Learn Spanish with bite-size lessons based on science.',
      provider: 'Duolingo',
      url: 'https://www.duolingo.com/course/es/en/Learn-Spanish',
      duration: 'Self-paced',
      rating: 4.4,
      students: 8900000,
      isLive: true,
      instructor: 'Duolingo Team',
      category: 'language',
      price: 'Free',
      level: 'beginner',
      language: 'Spanish',
      certificate: false
    },
    {
      id: 'digital-art-udemy',
      title: 'Digital Art for Beginners: Learn to Draw on Your iPad',
      description: 'Learn digital art from scratch with this comprehensive course for beginners using Procreate on iPad.',
      provider: 'Udemy',
      url: 'https://www.udemy.com/course/digital-art-for-beginners-learn-to-draw-on-your-ipad/',
      duration: '6 hours',
      rating: 4.6,
      students: 234000,
      isLive: true,
      instructor: 'Brad Colbow',
      category: 'art',
      price: '$19.99',
      level: 'beginner',
      language: 'English',
      certificate: true
    },
    {
      id: 'deep-learning-ai',
      title: 'Deep Learning Specialization',
      description: 'Master Deep Learning, and Break into AI. Instructor: Andrew Ng, Stanford University.',
      provider: 'Coursera',
      url: 'https://www.coursera.org/specializations/deep-learning',
      duration: '5 months',
      rating: 4.9,
      students: 1200000,
      isLive: true,
      instructor: 'Andrew Ng',
      category: 'ai-ml',
      price: '$49/month',
      level: 'advanced',
      language: 'English',
      certificate: true
    },
    {
      id: 'nodejs-complete',
      title: 'Node.js: The Complete Guide (MVC, REST APIs, GraphQL, Deno)',
      description: 'Master Node.js & Deno.js, build REST APIs with Node.js, GraphQL APIs, add Authentication, use MongoDB, SQL & more',
      provider: 'Udemy',
      url: 'https://www.udemy.com/course/nodejs-the-complete-guide/',
      duration: '44 hours',
      rating: 4.7,
      students: 567000,
      isLive: true,
      instructor: 'Maximilian Schwarzmüller',
      category: 'programming',
      price: '$89.99',
      level: 'intermediate',
      language: 'English',
      certificate: true
    },
    {
      id: 'statistics-coursera',
      title: 'Statistics with Python',
      description: 'Learn the fundamentals of statistics and how to analyze data using Python.',
      provider: 'Coursera',
      url: 'https://www.coursera.org/specializations/statistics-with-python',
      duration: '4 months',
      rating: 4.6,
      students: 234000,
      isLive: true,
      instructor: 'University of Michigan',
      category: 'data-science',
      price: '$49/month',
      level: 'intermediate',
      language: 'English',
      certificate: true
    },
    {
      id: 'linear-algebra-mit',
      title: 'Linear Algebra',
      description: 'Learn linear algebra and its applications in computer science, engineering, and data science.',
      provider: 'MIT OpenCourseWare',
      url: 'https://ocw.mit.edu/courses/mathematics/18-06-linear-algebra-spring-2010/',
      duration: '14 weeks',
      rating: 4.8,
      students: 156000,
      isLive: true,
      instructor: 'Gilbert Strang',
      category: 'mathematics',
      price: 'Free',
      level: 'advanced',
      language: 'English',
      certificate: false
    },
    {
      id: 'entrepreneurship-stanford',
      title: 'How to Start a Startup',
      description: 'Learn the fundamentals of starting a company from Silicon Valley entrepreneurs.',
      provider: 'Stanford Online',
      url: 'https://www.startupclass.co/',
      duration: '20 lectures',
      rating: 4.7,
      students: 89000,
      isLive: true,
      instructor: 'Sam Altman',
      category: 'business',
      price: 'Free',
      level: 'intermediate',
      language: 'English',
      certificate: false
    },
    {
      id: 'french-babbel',
      title: 'French for Beginners',
      description: 'Learn French with interactive lessons and real conversations.',
      provider: 'Babbel',
      url: 'https://www.babbel.com/learn-french-online',
      duration: 'Self-paced',
      rating: 4.5,
      students: 2340000,
      isLive: true,
      instructor: 'Babbel Team',
      category: 'language',
      price: '$12.95/month',
      level: 'beginner',
      language: 'French',
      certificate: false
    },
    {
      id: 'ui-ux-design',
      title: 'UI/UX Design Bootcamp',
      description: 'Learn UI/UX Design with hands-on projects and master Figma, Adobe XD, and more.',
      provider: 'DesignLab',
      url: 'https://trydesignlab.com/ui-ux-bootcamp/',
      duration: '16 weeks',
      rating: 4.8,
      students: 89000,
      isLive: true,
      instructor: 'Various Instructors',
      category: 'art',
      price: '$6,249',
      level: 'intermediate',
      language: 'English',
      certificate: true
    },
    {
      id: 'react-native',
      title: 'React Native: Advanced Concepts',
      description: 'Master advanced React Native concepts including animations, navigation, state management, and more.',
      provider: 'Udemy',
      url: 'https://www.udemy.com/course/react-native-advanced-concepts/',
      duration: '28 hours',
      rating: 4.6,
      students: 123000,
      isLive: true,
      instructor: 'Stephen Grider',
      category: 'programming',
      price: '$84.99',
      level: 'advanced',
      language: 'English',
      certificate: true
    },
    {
      id: 'python-automation',
      title: 'Automate the Boring Stuff with Python',
      description: 'Learn to automate everyday tasks using Python programming.',
      provider: 'Udemy',
      url: 'https://www.udemy.com/course/automate/',
      duration: '9 hours',
      rating: 4.7,
      students: 456000,
      isLive: true,
      instructor: 'Al Sweigart',
      category: 'programming',
      price: '$19.99',
      level: 'beginner',
      language: 'English',
      certificate: true
    }
  ];

  useEffect(() => {
    // Initialize courses immediately
    setCourses(externalCourses);
    setFilteredCourses(externalCourses);
    setLoading(false);
    setIsConnected(true); // Set as connected by default for better UX
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    filterCourses(term, selectedCategory, selectedLevel);
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    filterCourses(searchTerm, category, selectedLevel);
  };

  const handleLevelFilter = (level: string) => {
    setSelectedLevel(level);
    filterCourses(searchTerm, selectedCategory, level);
  };

  const filterCourses = (search: string, category: string, level: string) => {
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

    // Filter by level
    if (level !== 'all') {
      filtered = filtered.filter(course => course.level === level);
    }

    setFilteredCourses(filtered);
  };

  const handleCourseAccess = async (course: ExternalCourse) => {
    try {
      // Enhanced debugging
      console.log('🔗 ===== COURSE ACCESS DEBUG =====');
      console.log('🔗 Accessing course:', course.title);
      console.log('🔗 Course URL:', course.url);
      console.log('🔗 Provider:', course.provider);
      console.log('🔗 User logged in:', !!user);
      console.log('🔗 Current window location:', window.location.href);
      console.log('🔗 Session state before course access:', !!user);

      // Store current session state before course access
      const currentUser = user;
      const currentSession = session;

      // Record course access if user is logged in (NON-BLOCKING)
      if (user) {
        // Use setTimeout to make this non-blocking
        setTimeout(async () => {
          try {
            console.log('🔗 Attempting to log course access to database...');
            
            // Check session again before database operation
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
              console.warn('⚠️ Session lost during course access logging');
              return;
            }
            
            const { error } = await supabase
              .from('analytics_events')
              .insert({
                event_type: 'course_access',
                event_data: {
                  course_id: course.id,
                  course_title: course.title,
                  provider: course.provider,
                  url: course.url
                },
                user_id: user.id
              });
            
            if (error) {
              console.warn('⚠️ Could not log course access:', error);
            } else {
              console.log('✅ Course access logged to database successfully');
            }
          } catch (logError) {
            console.warn('⚠️ Could not log course access:', logError);
          }
        }, 0); // Execute asynchronously without blocking
      }

      // Always try to open in new tab first (PREFERRED METHOD)
      console.log('🔗 Opening course in new tab:', course.url);
      const newWindow = window.open(course.url, '_blank', 'noopener,noreferrer');
      
      // Check if the window was opened successfully
      if (newWindow) {
        console.log('✅ Course opened successfully in new tab');
        console.log('✅ New window object:', newWindow);
        
        // Show user feedback that course opened in new tab
        console.log('📝 Course opened in new tab - you can continue browsing here while learning');
        
        // Add a focus event listener to check session when returning to the original tab
        const handleWindowFocus = () => {
          console.log('🔐 Window focused - checking session state...');
          console.log('🔐 Previous user state:', !!currentUser);
          console.log('🔐 Previous session state:', !!currentSession);
          
          // Check current session state
          supabase.auth.getSession().then(({ data: { session } }) => {
            console.log('🔐 Current session state after returning from course:', session ? 'Active' : 'Inactive');
            
            // If session was lost, attempt recovery
            if (!session && currentUser) {
              console.log('🔐 Session lost after course access, attempting recovery...');
              // Trigger session recovery through the auth context
              if (typeof window !== 'undefined' && window.dispatchEvent) {
                window.dispatchEvent(new CustomEvent('sessionRecovery'));
              }
            }
          });
        };
        
        window.addEventListener('focus', handleWindowFocus, { once: true });
      } else {
        console.warn('⚠️ Popup blocked. Attempting alternative methods...');
        
        // Try to show user how to allow popups
        const allowPopups = confirm(
          `Course: ${course.title}\n\n` +
          `This course needs to open in a new tab, but popups are blocked.\n\n` +
          `To allow this course to open:\n` +
          `1. Click "Allow" in the popup blocker notification\n` +
          `2. Or right-click the "Access Course" button and select "Open in new tab"\n\n` +
          `Would you like to try opening the course again?`
        );
        
        if (allowPopups) {
          // Try again with a slight delay
          setTimeout(() => {
            const retryWindow = window.open(course.url, '_blank', 'noopener,noreferrer');
            if (retryWindow) {
              console.log('✅ Course opened successfully on retry');
            } else {
              console.warn('⚠️ Still blocked. Opening in same tab as fallback');
              // Last resort: open in same tab
              window.location.href = course.url;
            }
          }, 100);
        } else {
          console.log('🔗 User chose not to retry. Course access cancelled.');
        }
      }
      
      console.log('🔗 ===== END COURSE ACCESS DEBUG =====');
    } catch (error) {
      console.error('❌ Error accessing course:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        course: course
      });
      
      // Even if there's an error, try to open the course URL as fallback
      try {
        console.log('🔗 Attempting fallback course access...');
        const fallbackWindow = window.open(course.url, '_blank', 'noopener,noreferrer');
        if (!fallbackWindow) {
          console.log('🔗 Fallback: opening in same tab');
          window.location.href = course.url;
        }
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
      }
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

  const toggleFavorite = (courseId: string) => {
    setFavorites(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const isFavorite = (courseId: string) => {
    return favorites.includes(courseId);
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

          {/* Information Banner */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <ExternalLink className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-900 mb-1">📚 Course Access Information</h3>
                <p className="text-sm text-blue-700">
                  Courses open in a new tab, so you can continue browsing here while learning. 
                  This prevents any session issues and allows you to easily switch between your learning and browsing.
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
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

          {/* Level Filter */}
          <div className="flex gap-2 mb-6">
            {levels.map((level) => (
              <Button
                key={level.id}
                variant={selectedLevel === level.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleLevelFilter(level.id)}
              >
                {level.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="text-sm mb-3 line-clamp-3">
                      {course.description}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(course.id)}
                      className={`h-8 w-8 p-0 ${isFavorite(course.id) ? 'text-red-500' : 'text-gray-400'}`}
                    >
                      <Heart className={`h-4 w-4 ${isFavorite(course.id) ? 'fill-current' : ''}`} />
                    </Button>
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

                  {/* Additional Info */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {course.level && (
                      <Badge variant="secondary" className="text-xs">
                        {course.level}
                      </Badge>
                    )}
                    {course.language && (
                      <Badge variant="secondary" className="text-xs">
                        {course.language}
                      </Badge>
                    )}
                    {course.certificate && (
                      <Badge variant="secondary" className="text-xs">
                        <Award className="h-3 w-3 mr-1" />
                        Certificate
                      </Badge>
                    )}
                    {course.price && (
                      <Badge variant="outline" className="text-xs font-medium">
                        {course.price}
                      </Badge>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => {
                        console.log('🔘 Button clicked for course:', course.title);
                        handleCourseAccess(course);
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 group"
                      title="Opens course in a new tab - you can continue browsing here"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      <span>Access Course</span>
                      <ExternalLink className="h-3 w-3 ml-1 opacity-70 group-hover:opacity-100 transition-opacity" />
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

        {/* Course Statistics */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Courses</p>
                  <p className="text-3xl font-bold">{courses.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Live Courses</p>
                  <p className="text-3xl font-bold">{courses.filter(c => c.isLive).length}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Free Courses</p>
                  <p className="text-3xl font-bold">{courses.filter(c => c.price === 'Free').length}</p>
                </div>
                <Award className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Your Favorites</p>
                  <p className="text-3xl font-bold">{favorites.length}</p>
                </div>
                <Heart className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 