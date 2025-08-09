import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  BellRing, 
  Check, 
  MessageSquare, 
  Award, 
  CreditCard, 
  BookOpen,
  Users,
  Calendar,
  AlertCircle,
  Trash2,
  Settings,
  CheckCheck,
  X,
  Filter,
  Search,
  Volume2,
  VolumeX
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import useAuth from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'course_update' | 'new_message' | 'certificate' | 'payment' | 'collaboration' | 'reminder' | 'system';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  created_at: string;
  action_url?: string;
  action_text?: string;
  user_id: string;
  metadata?: any;
}

export function EnhancedNotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { user } = useAuth();

  // Load notifications from database
  useEffect(() => {
    if (!user) return;

    const loadNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error loading notifications:', error);
        return;
      }

      setNotifications(data || []);
      setIsLoading(false);
    };

    loadNotifications();

    // Subscribe to real-time notification updates
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          
          // Show toast notification
          if (soundEnabled && audioRef.current) {
            audioRef.current.play().catch(() => {
              // Ignore audio play errors
            });
          }

          // Show browser notification if permission granted
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(newNotification.title, {
              body: newNotification.message,
              icon: '/favicon.ico',
              tag: newNotification.id,
            });
          }

          // Show toast
          toast(newNotification.title, {
            description: newNotification.message,
            action: newNotification.action_url ? {
              label: newNotification.action_text || 'View',
              onClick: () => window.open(newNotification.action_url, '_blank'),
            } : undefined,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const updatedNotification = payload.new as Notification;
          setNotifications(prev => 
            prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, soundEnabled]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'unread' && !notification.read) ||
      (filter === 'read' && notification.read);

    const matchesSearch = 
      searchQuery === '' ||
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = cn(
      "h-4 w-4",
      priority === 'urgent' && "text-red-500",
      priority === 'high' && "text-orange-500",
      priority === 'medium' && "text-blue-500",
      priority === 'low' && "text-gray-500"
    );

    switch (type) {
      case 'course_update':
        return <BookOpen className={iconClass} />;
      case 'new_message':
        return <MessageSquare className={iconClass} />;
      case 'certificate':
        return <Award className={iconClass} />;
      case 'payment':
        return <CreditCard className={iconClass} />;
      case 'collaboration':
        return <Users className={iconClass} />;
      case 'reminder':
        return <Calendar className={iconClass} />;
      case 'system':
        return <AlertCircle className={iconClass} />;
      default:
        return <Bell className={iconClass} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 border-red-200';
      case 'high':
        return 'bg-orange-100 border-orange-200';
      case 'medium':
        return 'bg-blue-100 border-blue-200';
      case 'low':
        return 'bg-gray-100 border-gray-200';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  };

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      toast.error('Failed to mark notification as read');
      return;
    }

    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (error) {
      toast.error('Failed to mark all notifications as read');
      return;
    }

    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const deleteNotification = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      toast.error('Failed to delete notification');
      return;
    }

    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    toast.success('Notification deleted');
  };

  const NotificationItem = ({ notification }: { notification: Notification }) => (
    <div
      className={cn(
        "p-3 border-l-4 transition-all duration-200 hover:bg-gray-50",
        !notification.read && "bg-blue-50/50",
        getPriorityColor(notification.priority)
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getNotificationIcon(notification.type, notification.priority)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={cn(
              "text-sm font-medium text-gray-900 truncate",
              !notification.read && "font-semibold"
            )}>
              {notification.title}
            </h4>
            
            <div className="flex items-center gap-1 flex-shrink-0">
              {notification.priority === 'urgent' && (
                <Badge variant="destructive" className="text-xs">
                  Urgent
                </Badge>
              )}
              {notification.priority === 'high' && (
                <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                  High
                </Badge>
              )}
              {!notification.read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </span>
            
            <div className="flex items-center gap-1">
              {notification.action_url && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs px-2"
                  onClick={() => window.open(notification.action_url, '_blank')}
                >
                  {notification.action_text || 'View'}
                </Button>
              )}
              
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => markAsRead(notification.id)}
                >
                  <Check className="h-3 w-3" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                onClick={() => deleteNotification(notification.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      {/* Audio element for notification sound */}
      <audio
        ref={audioRef}
        preload="auto"
        src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzip2e/NeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzip2e/NeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzip2e/NeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzip2e/NeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzip2e/NeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzip2e/NeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzip2e/NeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzip2e/NeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzip2e/NeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzip2e/NeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzip2e/NeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzip2e/NeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzip2e/NeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzip2e/NeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzip2e/NeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzip2e/NeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzip2e/NeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzip2e/NeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzip2e/NeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzip2e/NeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzip2e/NeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzip2e/NeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzip2e/NeSsFJXfH8N2QQAoUXrTp66hVFA=="
      />

      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        className="relative p-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        {unreadCount > 0 ? (
          <BellRing className="h-5 w-5 text-blue-600" />
        ) : (
          <Bell className="h-5 w-5" />
        )}
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center bg-red-500">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-96 max-h-[500px] shadow-lg border z-50">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-1"
                >
                  {soundEnabled ? (
                    <Volume2 className="h-4 w-4" />
                  ) : (
                    <VolumeX className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="p-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Search and Actions */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <Tabs value={filter} onValueChange={(value: any) => setFilter(value)}>
                  <TabsList className="h-8">
                    <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                    <TabsTrigger value="unread" className="text-xs">Unread</TabsTrigger>
                    <TabsTrigger value="read" className="text-xs">Read</TabsTrigger>
                  </TabsList>
                </Tabs>

                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    <CheckCheck className="h-3 w-3 mr-1" />
                    Mark all read
                  </Button>
                )}
              </div>
            </div>
          </div>

          <ScrollArea className="max-h-80">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                Loading notifications...
              </div>
            ) : filteredNotifications.length > 0 ? (
              <div className="divide-y">
                {filteredNotifications.map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">
                  {searchQuery ? 'No notifications match your search' : 'No notifications'}
                </p>
              </div>
            )}
          </ScrollArea>
        </Card>
      )}
    </div>
  );
}

export default EnhancedNotificationCenter;