import { useState, useEffect, useCallback } from 'react';
import { realtimeService, RealtimeMessage, UserPresence, StudyGroupUpdate, HelpRequestUpdate, VideoCall, VoiceCall } from '@/services/realtimeService';
import useAuth from './useAuth';
import { toast } from 'sonner';

export const useRealtimeMessages = (conversationId: string | null) => {
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!conversationId) return;

    console.log(`🔗 Setting up message subscription for conversation: ${conversationId}`);
    setIsLoading(true);
    setHasError(false);

    try {
      const subscription = realtimeService.subscribeToMessages(conversationId, (message) => {
        setMessages(prev => [...prev, message]);
        toast.success(`New message from ${message.sender_name}`);
      });

      setIsConnected(true);
      setIsLoading(false);
    } catch (error) {
      console.error('❌ Failed to subscribe to messages:', error);
      setHasError(true);
      setIsLoading(false);
      toast.error('Failed to connect to messaging service. Please check database setup.');
    }

    return () => {
      console.log(`🔗 Cleaning up message subscription for conversation: ${conversationId}`);
      try {
        realtimeService.unsubscribe(`messages:${conversationId}`);
      } catch (error) {
        console.error('❌ Error unsubscribing from messages:', error);
      }
      setIsConnected(false);
    };
  }, [conversationId]);

  const sendMessage = useCallback(async (content: string, senderName: string) => {
    if (!conversationId) {
      toast.error('No conversation selected');
      return;
    }

    if (!content.trim()) {
      toast.error('Message cannot be empty');
      return;
    }

    try {
      setIsLoading(true);
      await realtimeService.sendMessage({
        content: content.trim(),
        sender_id: 'current-user', // In real app, get from auth
        sender_name: senderName,
        conversation_id: conversationId,
      });
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please check database setup.');
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  return { messages, sendMessage, isConnected, isLoading, hasError };
};

export const useRealtimePresence = () => {
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    console.log('🔗 Setting up presence subscription');
    setIsLoading(true);
    setHasError(false);

    try {
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

      // Load initial online users
      const loadOnlineUsers = async () => {
        try {
          const users = await realtimeService.getOnlineUsers();
          setOnlineUsers(users);
        } catch (error) {
          console.error('Error loading online users:', error);
          toast.error('Failed to load online users. Please check database setup.');
          setHasError(true);
        } finally {
          setIsLoading(false);
        }
      };

      loadOnlineUsers();

      // Update own presence
      if (user) {
        try {
          realtimeService.updatePresence({
            user_id: user.id,
            user_name: user.email || 'Anonymous',
            status: 'online',
            last_seen: new Date().toISOString(),
          });
        } catch (error) {
          console.error('Error updating presence:', error);
          setHasError(true);
        }
      }

      return () => {
        console.log('🔗 Cleaning up presence subscription');
        try {
          realtimeService.unsubscribe('user_presence');
        } catch (error) {
          console.error('❌ Error unsubscribing from presence:', error);
        }
      };
    } catch (error) {
      console.error('❌ Failed to setup presence subscription:', error);
      setHasError(true);
      setIsLoading(false);
      toast.error('Failed to connect to presence service. Please check database setup.');
    }
  }, [user]);

  const updateOwnPresence = useCallback((status: 'online' | 'offline' | 'busy') => {
    if (!user) {
      toast.error('You must be logged in to update presence');
      return;
    }

    try {
      realtimeService.updatePresence({
        user_id: user.id,
        user_name: user.email || 'Anonymous',
        status,
        last_seen: new Date().toISOString(),
      });
      toast.success(`Status updated to ${status}`);
    } catch (error) {
      console.error('Error updating presence:', error);
      toast.error('Failed to update status. Please check database setup.');
      setHasError(true);
    }
  }, [user]);

  return { onlineUsers, updateOwnPresence, isLoading, hasError };
};

export const useRealtimeStudyGroups = () => {
  const [studyGroups, setStudyGroups] = useState<StudyGroupUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    console.log('🔗 Setting up study groups subscription');
    setIsLoading(true);
    setHasError(false);

    try {
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

      // Load initial study groups
      const loadStudyGroups = async () => {
        try {
          const groups = await realtimeService.getStudyGroups();
          setStudyGroups(groups);
        } catch (error) {
          console.error('Error loading study groups:', error);
          toast.error('Failed to load study groups. Please check database setup.');
          setHasError(true);
        } finally {
          setIsLoading(false);
        }
      };

      loadStudyGroups();

      return () => {
        console.log('🔗 Cleaning up study groups subscription');
        try {
          realtimeService.unsubscribe('study_groups');
        } catch (error) {
          console.error('❌ Error unsubscribing from study groups:', error);
        }
      };
    } catch (error) {
      console.error('❌ Failed to setup study groups subscription:', error);
      setHasError(true);
      setIsLoading(false);
      toast.error('Failed to connect to study groups service. Please check database setup.');
    }
  }, []);

  const joinGroup = useCallback(async (groupId: string) => {
    try {
      setIsLoading(true);
      await realtimeService.joinStudyGroup(groupId, 'current-user');
      toast.success('Successfully joined study group!');
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error('Failed to join study group. Please check database setup.');
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const leaveGroup = useCallback(async (groupId: string) => {
    try {
      setIsLoading(true);
      await realtimeService.leaveStudyGroup(groupId, 'current-user');
      toast.success('Successfully left study group');
    } catch (error) {
      console.error('Error leaving group:', error);
      toast.error('Failed to leave study group. Please check database setup.');
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createGroup = useCallback(async (group: {
    name: string;
    description: string;
    subject: string;
    max_members?: number;
    meeting_time?: string;
  }) => {
    try {
      setIsLoading(true);
      await realtimeService.createStudyGroup({
        ...group,
        created_by: 'current-user',
      });
      toast.success('Study group created successfully!');
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create study group. Please check database setup.');
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { studyGroups, joinGroup, leaveGroup, createGroup, isLoading, hasError };
};

export const useRealtimeHelpRequests = () => {
  const [helpRequests, setHelpRequests] = useState<HelpRequestUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    console.log('🔗 Setting up help requests subscription');
    setIsLoading(true);
    setHasError(false);

    try {
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

      // Load initial help requests
      const loadHelpRequests = async () => {
        try {
          const requests = await realtimeService.getHelpRequests();
          setHelpRequests(requests);
        } catch (error) {
          console.error('Error loading help requests:', error);
          toast.error('Failed to load help requests. Please check database setup.');
          setHasError(true);
        } finally {
          setIsLoading(false);
        }
      };

      loadHelpRequests();

      return () => {
        console.log('🔗 Cleaning up help requests subscription');
        try {
          realtimeService.unsubscribe('help_requests');
        } catch (error) {
          console.error('❌ Error unsubscribing from help requests:', error);
        }
      };
    } catch (error) {
      console.error('❌ Failed to setup help requests subscription:', error);
      setHasError(true);
      setIsLoading(false);
      toast.error('Failed to connect to help requests service. Please check database setup.');
    }
  }, []);

  const createHelpRequest = useCallback(async (request: {
    title: string;
    description: string;
    subject: string;
    urgency: 'low' | 'medium' | 'high';
  }) => {
    try {
      setIsLoading(true);
      await realtimeService.createHelpRequest({
        ...request,
        created_by: 'current-user',
      });
      toast.success('Help request created successfully!');
    } catch (error) {
      console.error('Error creating help request:', error);
      toast.error('Failed to create help request. Please check database setup.');
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { helpRequests, createHelpRequest, isLoading, hasError };
};

export const useRealtimeVideoCalls = () => {
  const [videoCalls, setVideoCalls] = useState<VideoCall[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    console.log('🔗 Setting up video calls subscription');
    setIsLoading(true);
    setHasError(false);

    try {
      const subscription = realtimeService.subscribeToVideoCalls((call) => {
        setVideoCalls(prev => {
          const existingIndex = prev.findIndex(c => c.id === call.id);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = call;
            return updated;
          } else {
            return [...prev, call];
          }
        });

        toast.success(`Video call "${call.title}" updated`);
      });

      setIsLoading(false);

      return () => {
        console.log('🔗 Cleaning up video calls subscription');
        try {
          realtimeService.unsubscribe('video_calls');
        } catch (error) {
          console.error('❌ Error unsubscribing from video calls:', error);
        }
      };
    } catch (error) {
      console.error('❌ Failed to setup video calls subscription:', error);
      setHasError(true);
      setIsLoading(false);
      toast.error('Failed to connect to video calls service. Please check database setup.');
    }
  }, []);

  const createVideoCall = useCallback(async (call: {
    room_id: string;
    title: string;
  }) => {
    try {
      setIsLoading(true);
      await realtimeService.createVideoCall({
        ...call,
        host_id: 'current-user',
      });
      toast.success('Video call created successfully!');
    } catch (error) {
      console.error('Error creating video call:', error);
      toast.error('Failed to create video call. Please check database setup.');
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { videoCalls, createVideoCall, isLoading, hasError };
};

export const useRealtimeVoiceCalls = () => {
  const [voiceCalls, setVoiceCalls] = useState<VoiceCall[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    console.log('🔗 Setting up voice calls subscription');
    setIsLoading(true);
    setHasError(false);

    try {
      const subscription = realtimeService.subscribeToVoiceCalls((call) => {
        setVoiceCalls(prev => {
          const existingIndex = prev.findIndex(c => c.id === call.id);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = call;
            return updated;
          } else {
            return [...prev, call];
          }
        });

        toast.success(`Voice call status updated`);
      });

      setIsLoading(false);

      return () => {
        console.log('🔗 Cleaning up voice calls subscription');
        try {
          realtimeService.unsubscribe('voice_calls');
        } catch (error) {
          console.error('❌ Error unsubscribing from voice calls:', error);
        }
      };
    } catch (error) {
      console.error('❌ Failed to setup voice calls subscription:', error);
      setHasError(true);
      setIsLoading(false);
      toast.error('Failed to connect to voice calls service. Please check database setup.');
    }
  }, []);

  const createVoiceCall = useCallback(async (receiverId: string) => {
    try {
      setIsLoading(true);
      await realtimeService.createVoiceCall({
        caller_id: 'current-user',
        receiver_id: receiverId,
      });
      toast.success('Voice call initiated!');
    } catch (error) {
      console.error('Error creating voice call:', error);
      toast.error('Failed to initiate voice call. Please check database setup.');
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCallStatus = useCallback(async (callId: string, status: 'answered' | 'ended' | 'missed') => {
    try {
      setIsLoading(true);
      await realtimeService.updateVoiceCallStatus(callId, status);
      toast.success(`Call ${status}`);
    } catch (error) {
      console.error('Error updating call status:', error);
      toast.error('Failed to update call status. Please check database setup.');
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { voiceCalls, createVoiceCall, updateCallStatus, isLoading, hasError };
};

export const useRealtimeNotifications = () => {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'message' | 'group' | 'help' | 'presence' | 'system';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
  }>>([]);

  const addNotification = useCallback((notification: {
    type: 'message' | 'group' | 'help' | 'presence' | 'system';
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
    toast.success('All notifications cleared');
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  }, []);

  return { notifications, addNotification, markAsRead, clearAll, markAllAsRead };
}; 