import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Filter,
  GraduationCap,
  BookOpen,
  Users,
  Star,
  Clock
} from 'lucide-react';
import { MessagingSystem } from '@/components/MessagingSystem';
import { useConversations } from '@/hooks/useMessaging';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Profile, Course } from '@/integrations/supabase/types';
import { cn } from '@/lib/utils';

export default function Messaging() {
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState<Profile | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const { user } = useAuth();
  const { conversations, createConversation } = useConversations();

  // Fetch instructors for new conversation
  const { data: instructors = [] } = useQuery({
    queryKey: ['instructors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'instructor');

      if (error) throw error;
      return data as Profile[];
    },
  });

  // Fetch courses for new conversation
  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true);

      if (error) throw error;
      return data as Course[];
    },
  });

  const handleCreateConversation = async () => {
    if (!selectedInstructor || !user) return;

    await createConversation.mutateAsync({
      studentId: user.id,
      instructorId: selectedInstructor.id,
      courseId: selectedCourse?.id,
      title: selectedCourse ? `Course: ${selectedCourse.title}` : undefined,
    });

    setShowNewConversationModal(false);
    setSelectedInstructor(null);
    setSelectedCourse(null);
  };

  const getConversationStats = () => {
    const totalConversations = conversations.length;
    const unreadConversations = conversations.filter(c => c.unread_count && c.unread_count > 0).length;
    const recentConversations = conversations.filter(c => {
      const lastMessage = c.last_message;
      if (!lastMessage) return false;
      const messageDate = new Date(lastMessage.created_at);
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return messageDate > oneDayAgo;
    }).length;

    return { totalConversations, unreadConversations, recentConversations };
  };

  const stats = getConversationStats();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Messages
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Connect with instructors and receive real-time feedback
              </p>
            </div>
            <Button
              onClick={() => setShowNewConversationModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Conversation
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Conversations</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalConversations}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Badge className="h-5 w-5 bg-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Unread Messages</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.unreadConversations}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Clock className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Recent Activity</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.recentConversations}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Messaging System */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <MessagingSystem />
        </div>

        {/* New Conversation Modal */}
        {showNewConversationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-96 max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Start New Conversation</CardTitle>
                <CardDescription>
                  Choose an instructor and optionally a course to start messaging
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Instructor Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Instructor</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {instructors.map((instructor) => (
                      <div
                        key={instructor.id}
                        className={cn(
                          "flex items-center p-3 rounded-lg cursor-pointer border transition-colors",
                          selectedInstructor?.id === instructor.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:bg-gray-50"
                        )}
                        onClick={() => setSelectedInstructor(instructor)}
                      >
                        <Avatar className="h-8 w-8 mr-3">
                          <AvatarImage src={instructor.avatar_url || undefined} />
                          <AvatarFallback>
                            <BookOpen className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{instructor.full_name}</p>
                          <p className="text-xs text-gray-500">Instructor</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Course Selection (Optional) */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Select Course (Optional)
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    <div
                      className={cn(
                        "flex items-center p-3 rounded-lg cursor-pointer border transition-colors",
                        !selectedCourse
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:bg-gray-50"
                      )}
                      onClick={() => setSelectedCourse(null)}
                    >
                      <div className="h-8 w-8 mr-3 bg-gray-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">General Discussion</p>
                        <p className="text-xs text-gray-500">No specific course</p>
                      </div>
                    </div>
                    {courses.map((course) => (
                      <div
                        key={course.id}
                        className={cn(
                          "flex items-center p-3 rounded-lg cursor-pointer border transition-colors",
                          selectedCourse?.id === course.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:bg-gray-50"
                        )}
                        onClick={() => setSelectedCourse(course)}
                      >
                        <div className="h-8 w-8 mr-3 bg-blue-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{course.title}</p>
                          <p className="text-xs text-gray-500">{course.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowNewConversationModal(false);
                      setSelectedInstructor(null);
                      setSelectedCourse(null);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateConversation}
                    disabled={!selectedInstructor || createConversation.isPending}
                    className="flex-1"
                  >
                    {createConversation.isPending ? 'Creating...' : 'Start Conversation'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 