import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import useAuth from "./useAuth";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
  conversation_id: string;
  user_id?: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  course_id?: string;
}

export const useConversations = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as Conversation[];
    },
    enabled: !!user,
  });
};

export const useMessages = (conversationId: string | null) => {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!conversationId,
  });
};

export const useCreateConversation = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (title: string = 'New Conversation') => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('conversations')
        .insert({
          title,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Conversation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
      toast.success('Conversation created successfully');
    },
    onError: (error) => {
      console.error('Error creating conversation:', error);
      toast.error('Failed to create conversation');
    },
  });
};

export const useSendMessage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      content, 
      conversationId, 
      role = 'user' as const 
    }: {
      content: string;
      conversationId: string;
      role?: 'user' | 'assistant';
    }) => {
      if (!user && role === 'user') throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          content,
          role,
          conversation_id: conversationId,
          user_id: role === 'user' ? user?.id : undefined,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Message;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['messages', data.conversation_id] });
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    },
  });
};

export const useUpdateConversationTitle = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      conversationId, 
      title 
    }: {
      conversationId: string;
      title: string;
    }) => {
      const { data, error } = await supabase
        .from('conversations')
        .update({ title })
        .eq('id', conversationId)
        .select()
        .single();

      if (error) throw error;
      return data as Conversation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
      toast.success('Conversation title updated');
    },
    onError: (error) => {
      console.error('Error updating conversation title:', error);
      toast.error('Failed to update conversation title');
    },
  });
};

export const useDeleteConversation = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      // First delete all messages in the conversation
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId);

      if (messagesError) throw messagesError;

      // Then delete the conversation
      const { error: conversationError } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (conversationError) throw conversationError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
      toast.success('Conversation deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    },
  });
};

// Real-time subscription hook
export const useRealtimeMessages = (conversationId: string | null, onNewMessage: (message: Message) => void) => {
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
          const newMessage = payload.new as Message;
          onNewMessage(newMessage);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, onNewMessage]);
};

// AI response generation hook
export const useAIResponse = () => {
  const sendMessage = useSendMessage();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAIResponse = async (userMessage: string, conversationId: string) => {
    // Check for API key in environment or localStorage
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY || localStorage.getItem('openai_api_key');
    
    if (!apiKey) {
      // Fallback to mock response if no API key
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      const responses = [
        "That's a great question! Let me help you understand this better.",
        "I can see you're interested in this topic. Here's what I know about it...",
        "Based on your question, I think the key points to consider are...",
        "This is an excellent inquiry. Let me break this down for you...",
        "I understand your question. Here's a comprehensive answer...",
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      const aiResponse = `${randomResponse} ${userMessage.toLowerCase().includes('help') ? 'I\'m here to help you with any questions you might have about the course material or learning process.' : 'Feel free to ask more specific questions if you need clarification.'}`;

      await sendMessage.mutateAsync({
        content: aiResponse,
        conversationId,
        role: 'assistant',
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Import AI service dynamically to avoid SSR issues
      const { educationalAI } = await import('@/integrations/openai/educationalAI');
      
      // Get conversation history for context
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      // Convert to OpenAI message format
      const conversationHistory = messages?.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })) || [];

      console.log('Generating AI response for:', userMessage);
      console.log('Conversation history length:', conversationHistory.length);

      // Generate AI response with educational context
      const aiResponse = await educationalAI.generateExplanation(
        userMessage,
        {
          difficulty: 'intermediate',
          learningStyle: 'reading',
        },
        conversationHistory
      );

      console.log('AI response received:', aiResponse);

      // Send AI response
      await sendMessage.mutateAsync({
        content: aiResponse.content,
        conversationId,
        role: 'assistant',
      });
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // More detailed error logging
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('Rate limit')) {
        toast.error('Rate limit exceeded. Please wait a few minutes and try again.');
        await sendMessage.mutateAsync({
          content: "I'm currently experiencing high demand. Please wait a few minutes and try your question again. This is a temporary rate limit from OpenAI.",
          conversationId,
          role: 'assistant',
        });
      } else {
        toast.error(`AI Error: ${errorMessage}`);
        await sendMessage.mutateAsync({
          content: "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment.",
          conversationId,
          role: 'assistant',
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return { generateAIResponse, isGenerating };
}; 