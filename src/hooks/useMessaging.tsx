import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Conversation, Message, Feedback } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

export function useConversations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: conversations = [], isLoading, error } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          student:profiles!conversations_student_id_fkey(*),
          instructor:profiles!conversations_instructor_id_fkey(*),
          course:courses(*),
          last_message:messages(
            *,
            sender:profiles(*)
          )
        `)
        .or(`student_id.eq.${user.id},instructor_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as Conversation[];
    },
  });

  const createConversation = useMutation({
    mutationFn: async ({ 
      studentId, 
      instructorId, 
      courseId, 
      title 
    }: { 
      studentId: string; 
      instructorId: string; 
      courseId?: string; 
      title?: string; 
    }) => {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          student_id: studentId,
          instructor_id: instructorId,
          course_id: courseId,
          title,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast({
        title: "Conversation created",
        description: "You can now start messaging.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create conversation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    conversations,
    isLoading,
    error,
    createConversation,
  };
}

export function useMessages(conversationId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading, error } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles(*),
          feedback(*)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!conversationId,
  });

  const sendMessage = useMutation({
    mutationFn: async ({ 
      content, 
      messageType = 'text',
      fileUrl,
      fileName,
      fileSize 
    }: { 
      content: string; 
      messageType?: 'text' | 'file' | 'image' | 'feedback';
      fileUrl?: string;
      fileName?: string;
      fileSize?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          message_type: messageType,
          file_url: fileUrl,
          file_name: fileName,
          file_size: fileSize,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const markAsRead = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('mark_messages_as_read', {
        conversation_uuid: conversationId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    markAsRead,
  };
}

export function useRealTimeMessages(conversationId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);
}

export function useFeedback() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addFeedback = useMutation({
    mutationFn: async ({ 
      messageId, 
      feedbackType, 
      rating, 
      feedbackText 
    }: { 
      messageId: string; 
      feedbackType: 'assignment' | 'general' | 'question' | 'clarification';
      rating?: number;
      feedbackText?: string;
    }) => {
      const { data, error } = await supabase
        .from('feedback')
        .insert({
          message_id: messageId,
          feedback_type: feedbackType,
          rating,
          feedback_text: feedbackText,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      toast({
        title: "Feedback added",
        description: "Your feedback has been recorded.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add feedback",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    addFeedback,
  };
}

export function useUnreadCount() {
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unread-count'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { data, error } = await supabase.rpc('get_unread_message_count', {
        user_uuid: user.id,
      });

      if (error) throw error;
      return data || 0;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return unreadCount;
} 