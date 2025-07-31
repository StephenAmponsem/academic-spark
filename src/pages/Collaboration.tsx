import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { CollaborationChat } from "@/components/CollaborationChat";
import { 
  useRealtimePresence, 
  useRealtimeStudyGroups, 
  useRealtimeHelpRequests,
  useRealtimeNotifications 
} from "@/hooks/useRealtimeCollaboration";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, 
  MessageCircle, 
  Video, 
  Phone, 
  Clock, 
  Star, 
  MapPin, 
  Calendar,
  Send,
  Plus,
  Search,
  Filter,
  ArrowLeft,
  Home,
  User,
  BookOpen,
  HelpCircle,
  Lightbulb,
  Bell,
  Wifi,
  WifiOff,
  Sparkles,
  Zap,
  Globe,
  Heart,
  Target,
  Award,
  TrendingUp,
  MessageSquare,
  Users2,
  FileText,
  Play,
  Mic,
  Camera
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { supabase } from "@/integrations/supabase/client";

interface Peer {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'offline' | 'busy';
  subjects: string[];
  rating: number;
  lastActive: string;
  isInstructor: boolean;
}

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  subject: string;
  members: number;
  maxMembers: number;
  meetingTime: string;
  isActive: boolean;
  createdBy: string;
}

interface HelpRequest {
  id: string;
  title: string;
  description: string;
  subject: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'open' | 'in-progress' | 'resolved';
  createdAt: string;
  createdBy: string;
  responses: number;
}

const Collaboration = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    const tab = searchParams.get('tab');
    return tab || 'peers';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [activeChats, setActiveChats] = useState<{ [key: string]: { peer: Peer; isMinimized: boolean } }>({});
  const [showCreateRequest, setShowCreateRequest] = useState(false);
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    subject: '',
    urgency: 'medium' as 'low' | 'medium' | 'high'
  });
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    subject: '',
  });

  // Real-time hooks
  const { onlineUsers, updateOwnPresence } = useRealtimePresence();
  const { studyGroups, joinGroup } = useRealtimeStudyGroups();
  const { helpRequests, createHelpRequest } = useRealtimeHelpRequests();
  const { notifications, addNotification, markAsRead, clearAll } = useRealtimeNotifications();

  // Update URL when tab changes
  useEffect(() => {
    setSearchParams({ tab: activeTab });
  }, [activeTab, setSearchParams]);

  // Update presence when component mounts
  useEffect(() => {
    updateOwnPresence('online');
    
    return () => {
      updateOwnPresence('offline');
    };
  }, [updateOwnPresence]);

  // Mock data - in real app, this would come from your backend
  const [peers] = useState<Peer[]>([
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      status: 'online',
      subjects: ['Mathematics', 'Calculus', 'Linear Algebra'],
      rating: 4.9,
      lastActive: '2 minutes ago',
      isInstructor: true
    },
    {
      id: '2',
      name: 'Alex Chen',
      status: 'online',
      subjects: ['Physics', 'Chemistry'],
      rating: 4.7,
      lastActive: '5 minutes ago',
      isInstructor: false
    },
    {
      id: '3',
      name: 'Maria Rodriguez',
      status: 'busy',
      subjects: ['Computer Science', 'Programming'],
      rating: 4.8,
      lastActive: '10 minutes ago',
      isInstructor: false
    },
    {
      id: '4',
      name: 'Prof. Michael Brown',
      status: 'online',
      subjects: ['Biology', 'Chemistry', 'Anatomy'],
      rating: 4.9,
      lastActive: '1 minute ago',
      isInstructor: true
    }
  ]);

  const filteredPeers = peers.filter(peer => {
    const matchesSearch = peer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         peer.subjects.some(subject => subject.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSubject = selectedSubject === 'all' || peer.subjects.includes(selectedSubject);
    return matchesSearch && matchesSubject;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-emerald-500';
      case 'busy': return 'bg-amber-500';
      case 'offline': return 'bg-slate-500';
      default: return 'bg-slate-500';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'medium': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'low': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300 border-slate-200 dark:border-slate-800';
    }
  };

  const handleConnect = (peer: Peer) => {
    setActiveChats(prev => ({
      ...prev,
      [peer.id]: { peer, isMinimized: false }
    }));
    toast.success(`Chat opened with ${peer.name}`);
    addNotification({
      type: 'message',
      title: 'Chat Started',
      message: `You're now chatting with ${peer.name}`
    });
  };

  const handleCloseChat = (peerId: string) => {
    setActiveChats(prev => {
      const newChats = { ...prev };
      delete newChats[peerId];
      return newChats;
    });
  };

  const handleToggleMinimize = (peerId: string) => {
    setActiveChats(prev => ({
      ...prev,
      [peerId]: { ...prev[peerId], isMinimized: !prev[peerId].isMinimized }
    }));
  };

  const handleJoinGroup = (group: StudyGroup) => {
    joinGroup(group.id);
    addNotification({
      type: 'group',
      title: 'Study Group Joined',
      message: `You've joined ${group.name}`
    });
  };

  const handleCreateRequest = () => {
    if (!newRequest.title || !newRequest.description || !newRequest.subject) {
      toast.error('Please fill in all fields');
      return;
    }

    createHelpRequest(newRequest);
    setNewRequest({ title: '', description: '', subject: '', urgency: 'medium' });
    setShowCreateRequest(false);
  };

  const handleCreateGroup = async () => {
    if (!newGroup.name || !newGroup.subject) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      // Insert group into study_groups table
      const { error } = await supabase
        .from('study_groups')
        .insert({
          name: newGroup.name,
          description: newGroup.description,
          subject: newGroup.subject,
          created_by: user.id,
        });
      if (error) throw error;
      toast.success('Study group created!');
      setShowCreateGroup(false);
      setNewGroup({ name: '', description: '', subject: '' });
    } catch (err) {
      toast.error('Failed to create group');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 pt-20 pb-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="mb-8">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-xl opacity-20"></div>
                <div className="relative bg-white dark:bg-gray-800 rounded-full p-6 shadow-2xl">
                  <Globe className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Connect & Collaborate
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Sign in to connect with instructors and peers for an enhanced learning experience
            </p>
            <Button onClick={() => navigate('/auth')} size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg">
              <Sparkles className="h-5 w-5 mr-2" />
              Get Started
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 pt-20 pb-8">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="mb-8">
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
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200 shadow-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-sm">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">{onlineUsers.length} Online</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('notifications')}
                className="relative"
              >
                <Bell className="h-4 w-4" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500">
                    {notifications.filter(n => !n.read).length}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
          
          <div className="text-center mb-8">
            <div className="mb-4">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-xl opacity-20"></div>
                <div className="relative bg-white dark:bg-gray-800 rounded-full p-4 shadow-lg">
                  <Globe className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Connect & Collaborate
            </h1>
            <p className="text-xl text-muted-foreground">
              Get immediate help from instructors and peers, join study groups, and collaborate on learning
            </p>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <TabsTrigger value="peers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Peers & Instructors
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Study Groups
            </TabsTrigger>
            <TabsTrigger value="help" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Help Requests
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="peers" className="space-y-6">
            <Card className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Connect with Peers & Instructors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or subject..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10"
                    />
                  </div>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="px-3 py-2 border rounded-md bg-white dark:bg-gray-800"
                  >
                    <option value="all">All Subjects</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Biology">Biology</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPeers.map((peer) => (
                    <Card key={peer.id} className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg hover:scale-105 overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="relative">
                            <Avatar className="h-16 w-16 shadow-lg">
                              <AvatarImage src={peer.avatar} />
                              <AvatarFallback className="text-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                                {peer.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white dark:border-gray-800 ${getStatusColor(peer.status)}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-bold text-lg truncate">{peer.name}</h3>
                              {peer.isInstructor && (
                                <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                  Instructor
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span className="text-sm font-medium">{peer.rating}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">{peer.lastActive}</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {peer.subjects.slice(0, 2).map((subject, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {subject}
                                </Badge>
                              ))}
                              {peer.subjects.length > 2 && (
                                <span className="text-xs text-muted-foreground">
                                  +{peer.subjects.length - 2} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleConnect(peer)}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Message
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleConnect(peer)}
                            className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <Video className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleConnect(peer)}
                            className="hover:bg-green-50 dark:hover:bg-green-900/20"
                          >
                            <Mic className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="groups" className="space-y-6">
            <Card className="bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-green-900/20 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-green-600" />
                    Study Groups
                  </CardTitle>
                  {role === 'instructor' && (
                    <Button onClick={() => setShowCreateGroup(true)} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Group
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {studyGroups.map((group) => (
                    <Card key={group.id} className="border border-green-200 dark:border-green-800">
                      <CardHeader>
                        <CardTitle>{group.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-green-600" />
                            <span className="font-medium">{group.subject}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-purple-600" />
                            <span>Created by {group.createdBy}</span>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleJoinGroup(group)}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
                        >
                          Join Group
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
            {/* Create Group Modal */}
            <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Study Group</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <input
                    className="w-full border rounded p-2"
                    placeholder="Group Name"
                    value={newGroup.name}
                    onChange={e => setNewGroup({ ...newGroup, name: e.target.value })}
                  />
                  <input
                    className="w-full border rounded p-2"
                    placeholder="Subject"
                    value={newGroup.subject}
                    onChange={e => setNewGroup({ ...newGroup, subject: e.target.value })}
                  />
                  <textarea
                    className="w-full border rounded p-2"
                    placeholder="Description (optional)"
                    value={newGroup.description}
                    onChange={e => setNewGroup({ ...newGroup, description: e.target.value })}
                  />
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateGroup} className="bg-green-600 text-white">Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="help" className="space-y-6">
            <Card className="bg-gradient-to-br from-white to-orange-50 dark:from-gray-800 dark:to-orange-900/20 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-orange-600" />
                    Help Requests
                  </CardTitle>
                  <Button onClick={() => setShowCreateRequest(true)} className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg">
                    <Plus className="h-4 w-4 mr-2" />
                    Ask for Help
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showCreateRequest && (
                  <Card className="mb-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
                    <CardContent className="p-6">
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-orange-600" />
                        Create Help Request
                      </h3>
                      <div className="space-y-4">
                        <Input
                          placeholder="Title of your question"
                          value={newRequest.title}
                          onChange={(e) => setNewRequest(prev => ({ ...prev, title: e.target.value }))}
                          className="bg-white dark:bg-gray-800"
                        />
                        <Textarea
                          placeholder="Describe your question in detail..."
                          value={newRequest.description}
                          onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                          className="bg-white dark:bg-gray-800"
                        />
                        <div className="flex gap-4">
                          <select
                            value={newRequest.subject}
                            onChange={(e) => setNewRequest(prev => ({ ...prev, subject: e.target.value }))}
                            className="flex-1 px-3 py-2 border rounded-md bg-white dark:bg-gray-800"
                          >
                            <option value="">Select Subject</option>
                            <option value="Mathematics">Mathematics</option>
                            <option value="Physics">Physics</option>
                            <option value="Chemistry">Chemistry</option>
                            <option value="Computer Science">Computer Science</option>
                            <option value="Biology">Biology</option>
                          </select>
                          <select
                            value={newRequest.urgency}
                            onChange={(e) => setNewRequest(prev => ({ ...prev, urgency: e.target.value as 'low' | 'medium' | 'high' }))}
                            className="px-3 py-2 border rounded-md bg-white dark:bg-gray-800"
                          >
                            <option value="low">Low Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="high">High Priority</option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleCreateRequest} className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg">
                            <Send className="h-4 w-4 mr-2" />
                            Create Request
                          </Button>
                          <Button variant="outline" onClick={() => setShowCreateRequest(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                <div className="space-y-4">
                  {helpRequests.map((request) => (
                    <Card key={request.id} className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg hover:scale-105 overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg mb-2">{request.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">{request.description}</p>
                          </div>
                          <Badge className={`${getUrgencyColor(request.urgency)} border`}>
                            {request.urgency}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <span className="font-medium">{request.subject}</span>
                            <span>{request.createdAt}</span>
                            <span>{request.responses} responses</span>
                          </div>
                          <Badge variant={request.status === 'open' ? 'default' : 'secondary'}>
                            {request.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <Card className="bg-gradient-to-br from-white to-amber-50 dark:from-gray-800 dark:to-amber-900/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-amber-600" />
                  Learning Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg hover:scale-105 cursor-pointer overflow-hidden">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="mb-4">
                          <div className="relative inline-block">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-20"></div>
                            <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-full p-4 shadow-lg">
                              <Play className="h-8 w-8 text-white" />
                            </div>
                          </div>
                        </div>
                        <h3 className="font-bold text-lg mb-2">Video Tutorials</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Access recorded lectures and tutorials from expert instructors
                        </p>
                        <Button variant="outline" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg">
                          Browse Videos
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg hover:scale-105 cursor-pointer overflow-hidden">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="mb-4">
                          <div className="relative inline-block">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-600 rounded-full blur-xl opacity-20"></div>
                            <div className="relative bg-gradient-to-r from-emerald-600 to-green-600 rounded-full p-4 shadow-lg">
                              <FileText className="h-8 w-8 text-white" />
                            </div>
                          </div>
                        </div>
                        <h3 className="font-bold text-lg mb-2">Study Materials</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Download notes, practice problems, and comprehensive guides
                        </p>
                        <Button variant="outline" className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white border-0 shadow-lg">
                          Access Materials
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg hover:scale-105 cursor-pointer overflow-hidden">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="mb-4">
                          <div className="relative inline-block">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-xl opacity-20"></div>
                            <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 rounded-full p-4 shadow-lg">
                              <Calendar className="h-8 w-8 text-white" />
                            </div>
                          </div>
                        </div>
                        <h3 className="font-bold text-lg mb-2">Office Hours</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Schedule one-on-one sessions with instructors for personalized help
                        </p>
                        <Button variant="outline" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg">
                          Book Session
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-purple-600" />
                    Notifications
                  </CardTitle>
                  <Button variant="outline" onClick={clearAll} className="hover:bg-purple-50 dark:hover:bg-purple-900/20">
                    Clear All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="mb-4">
                        <div className="relative inline-block">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-xl opacity-20"></div>
                          <div className="relative bg-white dark:bg-gray-800 rounded-full p-4 shadow-lg">
                            <Bell className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                          </div>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-2">All Caught Up!</h3>
                      <p className="text-muted-foreground">No new notifications at the moment</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <Card key={notification.id} className={`group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg hover:scale-105 overflow-hidden ${!notification.read ? 'border-l-4 border-l-purple-500' : ''}`}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-bold text-lg mb-2">{notification.title}</h3>
                              <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                              <p className="text-xs text-muted-foreground">
                                {notification.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                            {!notification.read && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => markAsRead(notification.id)}
                                className="hover:bg-purple-50 dark:hover:bg-purple-900/20"
                              >
                                Mark Read
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Active Chat Windows */}
        {Object.entries(activeChats).map(([peerId, { peer, isMinimized }]) => (
          <CollaborationChat
            key={peerId}
            peer={peer}
            onClose={() => handleCloseChat(peerId)}
            isMinimized={isMinimized}
            onToggleMinimize={() => handleToggleMinimize(peerId)}
          />
        ))}
      </div>
    </div>
  );
};

export default Collaboration; 