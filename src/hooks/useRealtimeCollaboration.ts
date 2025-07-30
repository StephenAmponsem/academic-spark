import { useState, useEffect, useCallback } from 'react';
import { realtimeService, RealtimeMessage, UserPresence, StudyGroupUpdate, HelpRequestUpdate } from '@/services/realtimeService';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useRealtimeMessages = (conversationId: string | null) => {
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!conversationId) return;

    const subscription = realtimeService.subscribeToMessages(conversationId, (message) => {
      setMessages(prev => [...prev, message]);
      toast.success(`New message from ${message.sender_name}`);
    });

    setIsConnected(true);

    return () => {
      realtimeService.unsubscribe(`messages:${conversationId}`);
      setIsConnected(false);
    };
  }, [conversationId]);

  const sendMessage = useCallback(async (content: string, senderName: string) => {
    if (!conversationId) return;

    try {
      await realtimeService.sendMessage({
        content,
        sender_id: 'current-user', // In real app, get from auth
        sender_name: senderName,
        conversation_id: conversationId,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  }, [conversationId]);

  return { messages, sendMessage, isConnected };
};

export const useRealtimePresence = () => {
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const subscription = realtimeService.subscribeToPresence((presence) => {
      setOnlineUsers(prev => {
        const existingIndex = prev.findIndex(u => u.user_id === presence.user_id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = presence;
          return updated;
        } else {
          return [...prev, presence];
        }
      });
    });

    // Update own presence
    if (user) {
      realtimeService.updatePresence({
        user_id: user.id,
        user_name: user.email || 'Anonymous',
        status: 'online',
        last_seen: new Date().toISOString(),
      });
    }

    return () => {
      realtimeService.unsubscribe('user_presence');
    };
  }, [user]);

  const updateOwnPresence = useCallback((status: 'online' | 'offline' | 'busy') => {
    if (!user) return;

    realtimeService.updatePresence({
      user_id: user.id,
      user_name: user.email || 'Anonymous',
      status,
      last_seen: new Date().toISOString(),
    });
  }, [user]);

  return { onlineUsers, updateOwnPresence };
};

export const useRealtimeStudyGroups = () => {
  const [studyGroups, setStudyGroups] = useState<StudyGroupUpdate[]>([]);

  useEffect(() => {
    const subscription = realtimeService.subscribeToStudyGroups((update) => {
      setStudyGroups(prev => {
        const existingIndex = prev.findIndex(g => g.id === update.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = update;
          return updated;
        } else {
          return [...prev, update];
        }
      });

      toast.success(`Study group "${update.name}" updated`);
    });

    return () => {
      realtimeService.unsubscribe('study_groups');
    };
  }, []);

  const joinGroup = useCallback(async (groupId: string) => {
    try {
      await realtimeService.joinStudyGroup(groupId, 'current-user');
      toast.success('Successfully joined study group!');
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error('Failed to join study group');
    }
  }, []);

  return { studyGroups, joinGroup };
};

export const useRealtimeHelpRequests = () => {
  const [helpRequests, setHelpRequests] = useState<HelpRequestUpdate[]>([]);

  useEffect(() => {
    const subscription = realtimeService.subscribeToHelpRequests((update) => {
      setHelpRequests(prev => {
        const existingIndex = prev.findIndex(r => r.id === update.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = update;
          return updated;
        } else {
          return [...prev, update];
        }
      });

      toast.success(`Help request "${update.title}" updated`);
    });

    return () => {
      realtimeService.unsubscribe('help_requests');
    };
  }, []);

  const createHelpRequest = useCallback(async (request: {
    title: string;
    description: string;
    subject: string;
    urgency: 'low' | 'medium' | 'high';
  }) => {
    try {
      await realtimeService.createHelpRequest({
        ...request,
        created_by: 'current-user',
      });
      toast.success('Help request created successfully!');
    } catch (error) {
      console.error('Error creating help request:', error);
      toast.error('Failed to create help request');
    }
  }, []);

  return { helpRequests, createHelpRequest };
};

export const useRealtimeNotifications = () => {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'message' | 'group' | 'help' | 'presence';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
  }>>([]);

  const addNotification = useCallback((notification: {
    type: 'message' | 'group' | 'help' | 'presence';
    title: string;
    message: string;
  }) => {
    const newNotification = {
      id: Date.now().toString(),
      ...notification,
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);
    toast(notification.title, {
      description: notification.message,
    });
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return { notifications, addNotification, markAsRead, clearAll };
}; 