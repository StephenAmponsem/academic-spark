import { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  User, 
  BookOpen, 
  Video, 
  FileText, 
  Users, 
  Zap, 
  TrendingUp,
  Sparkles,
  ChevronDown,
  X,
  ArrowRight,
  Brain,
  Target,
  History,
  Bookmark,
  Share2,
  ThumbsUp,
  Eye,
  Calendar,
  Tag,
  MessageSquare,
  Download,
  Play
} from 'lucide-react';
import { cn } from '@/lib/utils';
import useAuth from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchResult {
  id: string;
  type: 'course' | 'lesson' | 'discussion' | 'user' | 'document' | 'video';
  title: string;
  description: string;
  relevanceScore: number;
  category: string;
  author: string;
  rating: number;
  duration?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  thumbnail?: string;
  url: string;
  createdAt: Date;
  views: number;
  likes: number;
  isBookmarked: boolean;
  aiInsight?: string;
}

interface SearchFilters {
  type: string[];
  category: string[];
  difficulty: string[];
  rating: number;
  duration: string;
  sortBy: string;
  dateRange: string;
}

interface AISearchSuggestion {
  id: string;
  query: string;
  explanation: string;
  category: string;
  confidence: number;
}

export function AdvancedSearch() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'courses' | 'discussions' | 'users' | 'documents'>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const debouncedQuery = useDebounce(searchQuery, 300);

  const [filters, setFilters] = useState<SearchFilters>({
    type: [],
    category: [],
    difficulty: [],
    rating: 0,
    duration: 'any',
    sortBy: 'relevance',
    dateRange: 'any'
  });

  const [searchHistory, setSearchHistory] = useState<string[]>([
    'React hooks tutorial',
    'JavaScript async await',
    'CSS flexbox guide'
  ]);

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<AISearchSuggestion[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  // Mock search results
  const mockResults: SearchResult[] = [
    {
      id: '1',
      type: 'course',
      title: 'Advanced React Patterns and Best Practices',
      description: 'Learn advanced React patterns including render props, higher-order components, and hooks patterns for building scalable applications.',
      relevanceScore: 98,
      category: 'Programming',
      author: 'Sarah Chen',
      rating: 4.8,
      duration: 180,
      difficulty: 'advanced',
      tags: ['React', 'JavaScript', 'Patterns', 'Advanced'],
      url: '/courses/advanced-react',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      views: 12500,
      likes: 945,
      isBookmarked: true,
      aiInsight: 'This course covers the exact React patterns you\'ve been searching for, with practical examples.'
    },
    {
      id: '2',
      type: 'lesson',
      title: 'React Custom Hooks: useEffect Best Practices',
      description: 'Deep dive into creating custom hooks and optimizing useEffect for better performance and cleaner code.',
      relevanceScore: 92,
      category: 'Programming',
      author: 'Alex Rodriguez',
      rating: 4.9,
      duration: 45,
      difficulty: 'intermediate',
      tags: ['React', 'Hooks', 'useEffect', 'Performance'],
      url: '/lessons/react-custom-hooks',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      views: 8760,
      likes: 634,
      isBookmarked: false,
      aiInsight: 'Perfect follow-up to your previous React studies. Builds on concepts you already know.'
    },
    {
      id: '3',
      type: 'discussion',
      title: 'React vs Vue: Which framework should I choose in 2024?',
      description: 'Community discussion about the pros and cons of React vs Vue for modern web development projects.',
      relevanceScore: 87,
      category: 'Programming',
      author: 'Emma Thompson',
      rating: 4.5,
      difficulty: 'beginner',
      tags: ['React', 'Vue', 'Comparison', 'Framework'],
      url: '/discussions/react-vs-vue-2024',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      views: 3420,
      likes: 156,
      isBookmarked: false
    },
    {
      id: '4',
      type: 'video',
      title: 'React Performance Optimization Techniques',
      description: 'Video tutorial covering React.memo, useMemo, useCallback, and other performance optimization strategies.',
      relevanceScore: 85,
      category: 'Programming',
      author: 'Mike Johnson',
      rating: 4.7,
      duration: 90,
      difficulty: 'intermediate',
      tags: ['React', 'Performance', 'Optimization', 'Tutorial'],
      url: '/videos/react-performance',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      views: 15680,
      likes: 892,
      isBookmarked: true,
      aiInsight: 'Great for optimizing the React apps you\'ve been building. Addresses common performance issues.'
    },
    {
      id: '5',
      type: 'document',
      title: 'React Hooks Cheat Sheet',
      description: 'Comprehensive reference guide for all React hooks with examples and common use cases.',
      relevanceScore: 82,
      category: 'Programming',
      author: 'Lisa Wang',
      rating: 4.6,
      difficulty: 'beginner',
      tags: ['React', 'Hooks', 'Reference', 'Cheat Sheet'],
      url: '/documents/react-hooks-cheat-sheet',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      views: 5430,
      likes: 278,
      isBookmarked: false
    }
  ];

  // Mock AI suggestions
  const mockAiSuggestions: AISearchSuggestion[] = [
    {
      id: '1',
      query: 'React state management with Context API',
      explanation: 'Based on your recent activity, you might be interested in advanced state management',
      category: 'Programming',
      confidence: 95
    },
    {
      id: '2',
      query: 'JavaScript ES6+ features for React development',
      explanation: 'Complement your React knowledge with modern JavaScript features',
      category: 'Programming',
      confidence: 88
    },
    {
      id: '3',
      query: 'Testing React components with Jest and React Testing Library',
      explanation: 'Next logical step after learning React patterns is testing',
      category: 'Programming',
      confidence: 82
    }
  ];

  // Perform search
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    // Simulate AI-powered search
    await new Promise(resolve => setTimeout(resolve, 800));

    // Filter results based on query and filters
    const filteredResults = mockResults.filter(result => {
      const matchesQuery = result.title.toLowerCase().includes(query.toLowerCase()) ||
                          result.description.toLowerCase().includes(query.toLowerCase()) ||
                          result.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));

      const matchesType = filters.type.length === 0 || filters.type.includes(result.type);
      const matchesCategory = filters.category.length === 0 || filters.category.includes(result.category);
      const matchesDifficulty = filters.difficulty.length === 0 || filters.difficulty.includes(result.difficulty);
      const matchesRating = result.rating >= filters.rating;

      return matchesQuery && matchesType && matchesCategory && matchesDifficulty && matchesRating;
    });

    // Sort results
    const sortedResults = filteredResults.sort((a, b) => {
      switch (filters.sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'views':
          return b.views - a.views;
        case 'date':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'relevance':
        default:
          return b.relevanceScore - a.relevanceScore;
      }
    });

    setSearchResults(sortedResults);
    setTotalResults(sortedResults.length);
    setAiSuggestions(mockAiSuggestions);
    setIsSearching(false);

    // Add to search history
    if (query && !searchHistory.includes(query)) {
      setSearchHistory(prev => [query, ...prev.slice(0, 4)]);
    }
  };

  // Search when debounced query changes
  useEffect(() => {
    performSearch(debouncedQuery);
  }, [debouncedQuery, filters]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'course': return BookOpen;
      case 'lesson': return Play;
      case 'video': return Video;
      case 'discussion': return MessageSquare;
      case 'document': return FileText;
      case 'user': return User;
      default: return FileText;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'course': return 'bg-blue-100 text-blue-800';
      case 'lesson': return 'bg-green-100 text-green-800';
      case 'video': return 'bg-purple-100 text-purple-800';
      case 'discussion': return 'bg-orange-100 text-orange-800';
      case 'document': return 'bg-gray-100 text-gray-800';
      case 'user': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600';
      case 'intermediate': return 'text-yellow-600';
      case 'advanced': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const toggleBookmark = (resultId: string) => {
    setSearchResults(prev => 
      prev.map(result => 
        result.id === resultId 
          ? { ...result, isBookmarked: !result.isBookmarked }
          : result
      )
    );
  };

  const clearFilters = () => {
    setFilters({
      type: [],
      category: [],
      difficulty: [],
      rating: 0,
      duration: 'any',
      sortBy: 'relevance',
      dateRange: 'any'
    });
  };

  const activeFilterCount = Object.values(filters).filter(value => 
    Array.isArray(value) ? value.length > 0 : value !== 'any' && value !== 'relevance' && value !== 0
  ).length;

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Main Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                ref={searchInputRef}
                placeholder="Search courses, lessons, discussions, and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-12 text-lg"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Filter Toggle and Quick Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant={showFilters ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="relative"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge className="ml-2 h-5 w-5 p-0 text-xs">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>

                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear filters
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Select value={filters.sortBy} onValueChange={(value) => 
                  setFilters(prev => ({ ...prev, sortBy: value }))
                }>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Most Relevant</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="views">Most Popular</SelectItem>
                    <SelectItem value="date">Most Recent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Content Type</label>
                      <div className="space-y-2">
                        {['course', 'lesson', 'video', 'discussion', 'document'].map(type => (
                          <label key={type} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={filters.type.includes(type)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFilters(prev => ({ ...prev, type: [...prev.type, type] }));
                                } else {
                                  setFilters(prev => ({ ...prev, type: prev.type.filter(t => t !== type) }));
                                }
                              }}
                              className="rounded"
                            />
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Category</label>
                      <div className="space-y-2">
                        {['Programming', 'Design', 'Business', 'Science', 'Language'].map(category => (
                          <label key={category} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={filters.category.includes(category)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFilters(prev => ({ ...prev, category: [...prev.category, category] }));
                                } else {
                                  setFilters(prev => ({ ...prev, category: prev.category.filter(c => c !== category) }));
                                }
                              }}
                              className="rounded"
                            />
                            {category}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Difficulty</label>
                      <div className="space-y-2">
                        {['beginner', 'intermediate', 'advanced'].map(difficulty => (
                          <label key={difficulty} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={filters.difficulty.includes(difficulty)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFilters(prev => ({ ...prev, difficulty: [...prev.difficulty, difficulty] }));
                                } else {
                                  setFilters(prev => ({ ...prev, difficulty: prev.difficulty.filter(d => d !== difficulty) }));
                                }
                              }}
                              className="rounded"
                            />
                            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Minimum Rating</label>
                      <Select value={filters.rating.toString()} onValueChange={(value) => 
                        setFilters(prev => ({ ...prev, rating: parseFloat(value) }))
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Any Rating</SelectItem>
                          <SelectItem value="3">3+ Stars</SelectItem>
                          <SelectItem value="4">4+ Stars</SelectItem>
                          <SelectItem value="4.5">4.5+ Stars</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search History and AI Suggestions */}
      {!hasSearched && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Search History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <History className="h-4 w-4" />
                Recent Searches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {searchHistory.map((query, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start text-left"
                    onClick={() => setSearchQuery(query)}
                  >
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    {query}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Brain className="h-4 w-4" />
                AI Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockAiSuggestions.map((suggestion) => (
                  <div key={suggestion.id} className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                       onClick={() => setSearchQuery(suggestion.query)}>
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="h-4 w-4 text-blue-500" />
                      <span className="font-medium text-sm">{suggestion.query}</span>
                      <Badge variant="outline" className="text-xs">
                        {suggestion.confidence}% match
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600">{suggestion.explanation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search Results */}
      {hasSearched && (
        <>
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                {isSearching ? 'Searching...' : `${totalResults} results found`}
                {searchQuery && <span className="text-gray-600"> for "{searchQuery}"</span>}
              </h2>
              {!isSearching && totalResults > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  AI-powered search with personalized recommendations
                </p>
              )}
            </div>
          </div>

          {/* Results Tabs */}
          <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
            <TabsList>
              <TabsTrigger value="all">All ({totalResults})</TabsTrigger>
              <TabsTrigger value="courses">Courses ({searchResults.filter(r => r.type === 'course').length})</TabsTrigger>
              <TabsTrigger value="discussions">Discussions ({searchResults.filter(r => r.type === 'discussion').length})</TabsTrigger>
              <TabsTrigger value="documents">Documents ({searchResults.filter(r => r.type === 'document').length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {isSearching ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-4">
                  {searchResults.map((result) => {
                    const TypeIcon = getTypeIcon(result.type);
                    return (
                      <Card key={result.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                <TypeIcon className="h-6 w-6 text-gray-600" />
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer">
                                      {result.title}
                                    </h3>
                                    <Badge className={cn("text-xs", getTypeBadgeColor(result.type))}>
                                      {result.type}
                                    </Badge>
                                  </div>

                                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                    {result.description}
                                  </p>

                                  {result.aiInsight && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-2">
                                      <div className="flex items-center gap-2">
                                        <Brain className="h-4 w-4 text-blue-600" />
                                        <span className="text-xs font-medium text-blue-800">AI Insight</span>
                                      </div>
                                      <p className="text-xs text-blue-700 mt-1">{result.aiInsight}</p>
                                    </div>
                                  )}

                                  <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <User className="h-3 w-3" />
                                      {result.author}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                      {result.rating}
                                    </span>
                                    {result.duration && (
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {formatDuration(result.duration)}
                                      </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                      <Eye className="h-3 w-3" />
                                      {result.views.toLocaleString()} views
                                    </span>
                                    <span className={cn("font-medium", getDifficultyColor(result.difficulty))}>
                                      {result.difficulty}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1 mt-2">
                                    {result.tags.slice(0, 3).map(tag => (
                                      <Badge key={tag} variant="outline" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                    {result.tags.length > 3 && (
                                      <span className="text-xs text-gray-500">
                                        +{result.tags.length - 3} more
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleBookmark(result.id)}
                                    className={cn(
                                      "h-8 w-8 p-0",
                                      result.isBookmarked && "text-blue-600"
                                    )}
                                  >
                                    <Bookmark className={cn(
                                      "h-4 w-4",
                                      result.isBookmarked && "fill-current"
                                    )} />
                                  </Button>
                                  
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <Share2 className="h-4 w-4" />
                                  </Button>

                                  <div className="text-xs text-gray-500 text-center">
                                    {result.relevanceScore}% match
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                    <p className="text-gray-600 mb-4">
                      Try adjusting your search terms or filters to find what you're looking for.
                    </p>
                    <Button variant="outline" onClick={clearFilters}>
                      Clear all filters
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Other tab contents would filter results by type */}
            <TabsContent value="courses">
              <div className="text-center py-8 text-gray-500">
                Course-specific results would be shown here
              </div>
            </TabsContent>

            <TabsContent value="discussions">
              <div className="text-center py-8 text-gray-500">
                Discussion-specific results would be shown here
              </div>
            </TabsContent>

            <TabsContent value="documents">
              <div className="text-center py-8 text-gray-500">
                Document-specific results would be shown here
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

export default AdvancedSearch;