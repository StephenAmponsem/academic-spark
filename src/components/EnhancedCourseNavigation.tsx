import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Grid, 
  List, 
  BookOpen,
  Clock,
  Star,
  Users,
  TrendingUp,
  Award,
  Bookmark,
  X,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Course {
  id: string;
  title: string;
  description: string;
  provider: string;
  duration: string;
  rating: number;
  students: number;
  category: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  price?: string;
  isEnrolled?: boolean;
  isFavorite?: boolean;
  progress?: number;
}

interface EnhancedCourseNavigationProps {
  courses: Course[];
  onCourseSelect: (course: Course) => void;
  onEnroll?: (courseId: string) => void;
  onToggleFavorite?: (courseId: string) => void;
  className?: string;
}

export function EnhancedCourseNavigation({ 
  courses, 
  onCourseSelect, 
  onEnroll,
  onToggleFavorite,
  className 
}: EnhancedCourseNavigationProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('all');

  // Extract unique categories and levels
  const categories = useMemo(() => {
    const cats = Array.from(new Set(courses.map(course => course.category)));
    return cats.sort();
  }, [courses]);

  const levels = ['beginner', 'intermediate', 'advanced'];

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    let filtered = courses.filter(course => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.provider.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;

      // Level filter
      const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;

      // Tab filter
      const matchesTab = 
        activeTab === 'all' ||
        (activeTab === 'enrolled' && course.isEnrolled) ||
        (activeTab === 'favorites' && course.isFavorite) ||
        (activeTab === 'recommended' && course.rating >= 4.5);

      return matchesSearch && matchesCategory && matchesLevel && matchesTab;
    });

    // Sort courses
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        case 'students':
          aValue = a.students;
          bValue = b.students;
          break;
        case 'duration':
          aValue = parseInt(a.duration);
          bValue = parseInt(b.duration);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [courses, searchQuery, selectedCategory, selectedLevel, sortBy, sortOrder, activeTab]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedLevel('all');
    setSortBy('rating');
    setSortOrder('desc');
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || selectedLevel !== 'all';

  const CourseCard = ({ course }: { course: Course }) => (
    <Card 
      className={cn(
        "group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-l-4",
        course.isEnrolled ? "border-l-green-500 bg-green-50/50" : "border-l-blue-500",
        viewMode === 'list' && "flex-row"
      )}
      onClick={() => onCourseSelect(course)}
    >
      <CardContent className={cn("p-4", viewMode === 'list' && "flex items-center gap-4")}>
        {/* Course Header */}
        <div className={cn("flex items-start justify-between mb-3", viewMode === 'list' && "flex-1")}>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {course.title}
              </h3>
              {course.isFavorite && (
                <Bookmark className="h-4 w-4 text-yellow-500" />
              )}
            </div>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {course.description}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="font-medium">{course.provider}</span>
              <span>•</span>
              <span>{course.category}</span>
            </div>
          </div>
          
          {onToggleFavorite && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(course.id);
              }}
              className="p-1 h-auto"
            >
              <Bookmark className={cn("h-4 w-4", course.isFavorite ? "text-yellow-500 fill-yellow-500" : "text-gray-400")} />
            </Button>
          )}
        </div>

        {/* Course Stats */}
        <div className={cn("flex items-center gap-4 mb-3", viewMode === 'list' && "flex-col items-end")}>
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span className="font-medium">{course.rating}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>{course.students.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{course.duration}</span>
          </div>
        </div>

        {/* Course Badges */}
        <div className="flex items-center gap-2 mb-3">
          {course.level && (
            <Badge variant="outline" className="text-xs">
              {course.level}
            </Badge>
          )}
          {course.price && (
            <Badge variant="secondary" className="text-xs">
              {course.price}
            </Badge>
          )}
          {course.isEnrolled && (
            <Badge className="text-xs bg-green-500">
              Enrolled
            </Badge>
          )}
        </div>

        {/* Progress Bar (if enrolled) */}
        {course.isEnrolled && course.progress !== undefined && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progress</span>
              <span>{course.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex gap-2">
          {course.isEnrolled ? (
            <Button size="sm" className="w-full">
              <Play className="h-4 w-4 mr-2" />
              Continue Learning
            </Button>
          ) : (
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                onEnroll?.(course.id);
              }}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Enroll Now
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search courses, providers, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Courses</TabsTrigger>
            <TabsTrigger value="enrolled">Enrolled</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-auto min-w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-auto min-w-[130px]">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {levels.map(level => (
                <SelectItem key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-auto min-w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="students">Students</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="duration">Duration</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
        </p>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <TrendingUp className="h-4 w-4" />
          <span>Sorted by {sortBy}</span>
        </div>
      </div>

      {/* Course Grid/List */}
      <div className={cn(
        "transition-all duration-300",
        viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
      )}>
        {filteredCourses.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-600 mb-4">
            {hasActiveFilters 
              ? "Try adjusting your filters or search terms" 
              : "No courses available at the moment"
            }
          </p>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>
              Clear All Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default EnhancedCourseNavigation;