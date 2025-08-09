import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  ThumbsUp, 
  ThumbsDown, 
  Reply, 
  Flag, 
  Pin, 
  Lock, 
  Bookmark,
  Share2,
  MoreHorizontal,
  Filter,
  TrendingUp,
  Clock,
  User,
  Star,
  Eye,
  ChevronDown,
  ChevronUp,
  Award,
  CheckCircle,
  AlertCircle,
  Crown,
  Flame,
  Heart,
  Calendar,
  Tag,
  Users,
  ArrowUp,
  ArrowDown,
  MessageCircle,
  Edit3,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import useAuth from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  threadCount: number;
  lastActivity: Date;
  isPrivate: boolean;
  requiredRole?: string;
}

interface ForumThread {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
    reputation: number;
    badges: string[];
  };
  category: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  views: number;
  replies: number;
  likes: number;
  dislikes: number;
  isLocked: boolean;
  isPinned: boolean;
  isSolved: boolean;
  isBookmarked: boolean;
  hasUserLiked: boolean;
  hasUserDisliked: boolean;
  lastReply?: {
    author: string;
    timestamp: Date;
  };
}

interface ForumReply {
  id: string;
  threadId: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
    reputation: number;
    badges: string[];
  };
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  dislikes: number;
  hasUserLiked: boolean;
  hasUserDisliked: boolean;
  parentReplyId?: string;
  replies: ForumReply[];
  isSolution: boolean;
  isEdited: boolean;
}

interface DiscussionForumsProps {
  courseId?: string;
  className?: string;
}

export function DiscussionForums({ courseId, className }: DiscussionForumsProps) {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<'categories' | 'threads' | 'thread'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedThread, setSelectedThread] = useState<ForumThread | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [filterBy, setFilterBy] = useState('all');
  const [showNewThreadForm, setShowNewThreadForm] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadContent, setNewThreadContent] = useState('');
  const [newThreadTags, setNewThreadTags] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  // Mock categories
  const categories: ForumCategory[] = [
    {
      id: '1',
      name: 'General Discussion',
      description: 'General course discussions and questions',
      icon: 'message-square',
      color: 'blue',
      threadCount: 156,
      lastActivity: new Date(Date.now() - 30 * 60 * 1000),
      isPrivate: false
    },
    {
      id: '2',
      name: 'Course Q&A',
      description: 'Questions about course content and assignments',
      icon: 'help-circle',
      color: 'green',
      threadCount: 89,
      lastActivity: new Date(Date.now() - 15 * 60 * 1000),
      isPrivate: false
    },
    {
      id: '3',
      name: 'Projects & Assignments',
      description: 'Discussions about projects and homework',
      icon: 'folder',
      color: 'purple',
      threadCount: 67,
      lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isPrivate: false
    },
    {
      id: '4',
      name: 'Study Groups',
      description: 'Organize and join study groups',
      icon: 'users',
      color: 'orange',
      threadCount: 34,
      lastActivity: new Date(Date.now() - 4 * 60 * 60 * 1000),
      isPrivate: false
    },
    {
      id: '5',
      name: 'Instructor Announcements',
      description: 'Official announcements from instructors',
      icon: 'megaphone',
      color: 'red',
      threadCount: 12,
      lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000),
      isPrivate: false,
      requiredRole: 'instructor'
    }
  ];

  // Mock threads
  const threads: ForumThread[] = [
    {
      id: '1',
      title: 'How to implement useState hook effectively?',
      content: 'I\'m having trouble understanding when to use useState vs useReducer. Can someone explain the best practices?',
      author: {
        id: '1',
        name: 'Alice Johnson',
        avatar: '/avatars/alice.jpg',
        role: 'student',
        reputation: 245,
        badges: ['active-learner', 'helpful']
      },
      category: '2',
      tags: ['react', 'hooks', 'useState', 'help'],
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 30 * 60 * 1000),
      views: 127,
      replies: 8,
      likes: 15,
      dislikes: 1,
      isLocked: false,
      isPinned: false,
      isSolved: true,
      isBookmarked: false,
      hasUserLiked: false,
      hasUserDisliked: false,
      lastReply: {
        author: 'Sarah Chen',
        timestamp: new Date(Date.now() - 30 * 60 * 1000)
      }
    },
    {
      id: '2',
      title: 'Study Group for Final Project - React Portfolio',
      content: 'Looking for 2-3 people to form a study group for the final project. I\'m planning to build a portfolio website using React and would love to collaborate!',
      author: {
        id: '2',
        name: 'Mike Rodriguez',
        avatar: '/avatars/mike.jpg',
        role: 'student',
        reputation: 189,
        badges: ['collaborator']
      },
      category: '4',
      tags: ['study-group', 'project', 'react', 'portfolio'],
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      views: 45,
      replies: 12,
      likes: 8,
      dislikes: 0,
      isLocked: false,
      isPinned: true,
      isSolved: false,
      isBookmarked: true,
      hasUserLiked: true,
      hasUserDisliked: false,
      lastReply: {
        author: 'Emma Wilson',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
      }
    },
    {
      id: '3',
      title: 'Assignment 3: Component Testing - Due Date Extended',
      content: 'Due to technical issues with the testing environment, Assignment 3 deadline has been extended to Friday, Nov 15th. Please make sure to submit your component tests by then.',
      author: {
        id: '3',
        name: 'Dr. Sarah Chen',
        avatar: '/avatars/sarah.jpg',
        role: 'instructor',
        reputation: 1250,
        badges: ['instructor', 'expert', 'verified']
      },
      category: '5',
      tags: ['announcement', 'assignment', 'deadline'],
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      views: 234,
      replies: 3,
      likes: 45,
      dislikes: 0,
      isLocked: true,
      isPinned: true,
      isSolved: false,
      isBookmarked: false,
      hasUserLiked: false,
      hasUserDisliked: false,
      lastReply: {
        author: 'Tom Brown',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
      }
    }
  ];

  // Mock replies
  const replies: ForumReply[] = [
    {
      id: '1',
      threadId: '1',
      content: 'Great question! I\'d recommend using useState for simple state and useReducer when you have complex state logic or multiple sub-values.',
      author: {
        id: '4',
        name: 'Sarah Chen',
        avatar: '/avatars/sarah.jpg',
        role: 'instructor',
        reputation: 1250,
        badges: ['instructor', 'expert']
      },
      createdAt: new Date(Date.now() - 90 * 60 * 1000),
      updatedAt: new Date(Date.now() - 90 * 60 * 1000),
      likes: 12,
      dislikes: 0,
      hasUserLiked: false,
      hasUserDisliked: false,
      replies: [
        {
          id: '2',
          threadId: '1',
          content: 'Thanks for the explanation! Could you provide a specific example?',
          author: {
            id: '1',
            name: 'Alice Johnson',
            avatar: '/avatars/alice.jpg',
            role: 'student',
            reputation: 245,
            badges: ['active-learner']
          },
          createdAt: new Date(Date.now() - 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 60 * 60 * 1000),
          likes: 3,
          dislikes: 0,
          hasUserLiked: false,
          hasUserDisliked: false,
          parentReplyId: '1',
          replies: [],
          isSolution: false,
          isEdited: false
        }
      ],
      isSolution: true,
      isEdited: false
    }
  ];

  const getCategoryIcon = (icon: string) => {
    const iconMap = {
      'message-square': MessageSquare,
      'help-circle': AlertCircle,
      'folder': Award,
      'users': Users,
      'megaphone': Flag
    };
    return iconMap[icon as keyof typeof iconMap] || MessageSquare;
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'instructor': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'moderator': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getReputationColor = (reputation: number) => {
    if (reputation >= 1000) return 'text-purple-600';
    if (reputation >= 500) return 'text-blue-600';
    if (reputation >= 100) return 'text-green-600';
    return 'text-gray-600';
  };

  const handleLike = (threadId: string, isReply?: boolean, replyId?: string) => {
    console.log('Like:', { threadId, isReply, replyId });
    // Implement like functionality
  };

  const handleDislike = (threadId: string, isReply?: boolean, replyId?: string) => {
    console.log('Dislike:', { threadId, isReply, replyId });
    // Implement dislike functionality
  };

  const handleBookmark = (threadId: string) => {
    console.log('Bookmark:', threadId);
    // Implement bookmark functionality
  };

  const createNewThread = () => {
    console.log('Creating thread:', { newThreadTitle, newThreadContent, newThreadTags, selectedCategory });
    // Implement thread creation
    setShowNewThreadForm(false);
    setNewThreadTitle('');
    setNewThreadContent('');
    setNewThreadTags('');
  };

  const submitReply = () => {
    console.log('Submitting reply:', replyContent);
    // Implement reply submission
    setReplyContent('');
  };

  const toggleReplyExpansion = (replyId: string) => {
    const newExpanded = new Set(expandedReplies);
    if (newExpanded.has(replyId)) {
      newExpanded.delete(replyId);
    } else {
      newExpanded.add(replyId);
    }
    setExpandedReplies(newExpanded);
  };

  const filteredThreads = threads.filter(thread => {
    const matchesCategory = !selectedCategory || thread.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = filterBy === 'all' || 
      (filterBy === 'solved' && thread.isSolved) ||
      (filterBy === 'unsolved' && !thread.isSolved) ||
      (filterBy === 'pinned' && thread.isPinned) ||
      (filterBy === 'bookmarked' && thread.isBookmarked);

    return matchesCategory && matchesSearch && matchesFilter;
  });

  const sortedThreads = [...filteredThreads].sort((a, b) => {
    switch (sortBy) {
      case 'latest':
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      case 'popular':
        return (b.likes + b.replies) - (a.likes + a.replies);
      case 'views':
        return b.views - a.views;
      case 'oldest':
        return a.createdAt.getTime() - b.createdAt.getTime();
      default:
        return 0;
    }
  });

  const renderReply = (reply: ForumReply, depth = 0) => {
    const isExpanded = expandedReplies.has(reply.id);
    
    return (
      <div key={reply.id} className={cn("border-l-2 border-gray-100", depth > 0 && "ml-8 mt-4")}>
        <div className="pl-4 pb-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={reply.author.avatar} />
              <AvatarFallback>{reply.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{reply.author.name}</span>
                <Badge className={cn("text-xs border", getRoleBadgeColor(reply.author.role))}>
                  {reply.author.role}
                </Badge>
                <span className={cn("text-xs font-medium", getReputationColor(reply.author.reputation))}>
                  {reply.author.reputation} rep
                </span>
                {reply.isSolution && (
                  <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Solution
                  </Badge>
                )}
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(reply.createdAt, { addSuffix: true })}
                </span>
                {reply.isEdited && (
                  <span className="text-xs text-gray-400">(edited)</span>
                )}
              </div>
              
              <div className="text-sm text-gray-700 mb-3">
                {reply.content}
              </div>
              
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(reply.threadId, true, reply.id)}
                  className={cn("h-7 px-2", reply.hasUserLiked && "text-blue-600")}
                >
                  <ArrowUp className="h-4 w-4 mr-1" />
                  {reply.likes}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDislike(reply.threadId, true, reply.id)}
                  className={cn("h-7 px-2", reply.hasUserDisliked && "text-red-600")}
                >
                  <ArrowDown className="h-4 w-4 mr-1" />
                  {reply.dislikes}
                </Button>
                
                <Button variant="ghost" size="sm" className="h-7 px-2">
                  <Reply className="h-4 w-4 mr-1" />
                  Reply
                </Button>
                
                {reply.replies.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleReplyExpansion(reply.id)}
                    className="h-7 px-2"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 mr-1" />
                    ) : (
                      <ChevronDown className="h-4 w-4 mr-1" />
                    )}
                    {reply.replies.length} {reply.replies.length === 1 ? 'reply' : 'replies'}
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* Nested replies */}
          {isExpanded && reply.replies.map(nestedReply => renderReply(nestedReply, depth + 1))}
        </div>
      </div>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Discussion Forums</h1>
          <p className="text-gray-600">Connect with peers and instructors</p>
        </div>
        
        {activeView === 'threads' && (
          <Button onClick={() => setShowNewThreadForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Thread
          </Button>
        )}
      </div>

      {/* Navigation */}
      {activeView !== 'categories' && (
        <div className="flex items-center gap-2 text-sm">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setActiveView('categories')}
            className="text-blue-600 hover:text-blue-700"
          >
            Forums
          </Button>
          {selectedCategory && (
            <>
              <span className="text-gray-400">/</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setActiveView('threads')}
                className="text-blue-600 hover:text-blue-700"
              >
                {categories.find(c => c.id === selectedCategory)?.name}
              </Button>
            </>
          )}
          {selectedThread && (
            <>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600 truncate max-w-md">{selectedThread.title}</span>
            </>
          )}
        </div>
      )}

      {/* Categories View */}
      {activeView === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => {
            const IconComponent = getCategoryIcon(category.icon);
            return (
              <Card 
                key={category.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedCategory(category.id);
                  setActiveView('threads');
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-${category.color}-100 flex items-center justify-center`}>
                      <IconComponent className={`h-5 w-5 text-${category.color}-600`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 mb-1">{category.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{category.threadCount} threads</span>
                        <span>Last: {formatDistanceToNow(category.lastActivity, { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Threads View */}
      {activeView === 'threads' && (
        <div className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search threads..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latest">Latest</SelectItem>
                      <SelectItem value="popular">Popular</SelectItem>
                      <SelectItem value="views">Most Viewed</SelectItem>
                      <SelectItem value="oldest">Oldest</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterBy} onValueChange={setFilterBy}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Threads</SelectItem>
                      <SelectItem value="solved">Solved</SelectItem>
                      <SelectItem value="unsolved">Unsolved</SelectItem>
                      <SelectItem value="pinned">Pinned</SelectItem>
                      <SelectItem value="bookmarked">Bookmarked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* New Thread Form */}
          {showNewThreadForm && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Thread</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Thread title..."
                  value={newThreadTitle}
                  onChange={(e) => setNewThreadTitle(e.target.value)}
                />
                <Textarea
                  placeholder="What would you like to discuss?"
                  value={newThreadContent}
                  onChange={(e) => setNewThreadContent(e.target.value)}
                  rows={4}
                />
                <Input
                  placeholder="Tags (comma separated)..."
                  value={newThreadTags}
                  onChange={(e) => setNewThreadTags(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button onClick={createNewThread}>Create Thread</Button>
                  <Button variant="outline" onClick={() => setShowNewThreadForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Threads List */}
          <div className="space-y-2">
            {sortedThreads.map((thread) => (
              <Card 
                key={thread.id} 
                className="hover:shadow-sm transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedThread(thread);
                  setActiveView('thread');
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={thread.author.avatar} />
                      <AvatarFallback>{thread.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {thread.isPinned && <Pin className="h-4 w-4 text-blue-500" />}
                        {thread.isLocked && <Lock className="h-4 w-4 text-gray-500" />}
                        <h3 className="font-medium text-gray-900 hover:text-blue-600">
                          {thread.title}
                        </h3>
                        {thread.isSolved && (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Solved
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {thread.content}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {thread.author.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {thread.replies} replies
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {thread.views} views
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {thread.likes}
                        </span>
                        <span>{formatDistanceToNow(thread.updatedAt, { addSuffix: true })}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 mt-2">
                        {thread.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {thread.tags.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{thread.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookmark(thread.id);
                        }}
                        className={cn("h-8 w-8 p-0", thread.isBookmarked && "text-blue-600")}
                      >
                        <Bookmark className={cn("h-4 w-4", thread.isBookmarked && "fill-current")} />
                      </Button>
                      
                      {thread.lastReply && (
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Last reply</div>
                          <div className="text-xs font-medium">{thread.lastReply.author}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Thread Detail View */}
      {activeView === 'thread' && selectedThread && (
        <div className="space-y-6">
          {/* Thread Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedThread.author.avatar} />
                  <AvatarFallback>{selectedThread.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {selectedThread.isPinned && <Pin className="h-5 w-5 text-blue-500" />}
                    {selectedThread.isLocked && <Lock className="h-5 w-5 text-gray-500" />}
                    <h1 className="text-xl font-semibold text-gray-900">
                      {selectedThread.title}
                    </h1>
                    {selectedThread.isSolved && (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Solved
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {selectedThread.author.name}
                    </span>
                    <Badge className={cn("text-xs border", getRoleBadgeColor(selectedThread.author.role))}>
                      {selectedThread.author.role}
                    </Badge>
                    <span className={cn("font-medium", getReputationColor(selectedThread.author.reputation))}>
                      {selectedThread.author.reputation} reputation
                    </span>
                    <span>{formatDistanceToNow(selectedThread.createdAt, { addSuffix: true })}</span>
                  </div>
                  
                  <div className="text-gray-700 mb-4">
                    {selectedThread.content}
                  </div>
                  
                  <div className="flex items-center gap-1 mb-4">
                    {selectedThread.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(selectedThread.id)}
                      className={cn(selectedThread.hasUserLiked && "text-blue-600")}
                    >
                      <ArrowUp className="h-4 w-4 mr-1" />
                      {selectedThread.likes}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDislike(selectedThread.id)}
                      className={cn(selectedThread.hasUserDisliked && "text-red-600")}
                    >
                      <ArrowDown className="h-4 w-4 mr-1" />
                      {selectedThread.dislikes}
                    </Button>
                    
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleBookmark(selectedThread.id)}
                      className={cn(selectedThread.isBookmarked && "text-blue-600")}
                    >
                      <Bookmark className={cn("h-4 w-4 mr-1", selectedThread.isBookmarked && "fill-current")} />
                      {selectedThread.isBookmarked ? 'Saved' : 'Save'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Replies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                {selectedThread.replies} {selectedThread.replies === 1 ? 'Reply' : 'Replies'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {replies.filter(r => r.threadId === selectedThread.id).map(reply => renderReply(reply))}
              </div>
            </CardContent>
          </Card>

          {/* Reply Form */}
          {!selectedThread.isLocked && (
            <Card>
              <CardHeader>
                <CardTitle>Add Reply</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Write your reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={4}
                />
                <div className="flex gap-2">
                  <Button onClick={submitReply} disabled={!replyContent.trim()}>
                    Post Reply
                  </Button>
                  <Button variant="outline" onClick={() => setReplyContent('')}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default DiscussionForums;