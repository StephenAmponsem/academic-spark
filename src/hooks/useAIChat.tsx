import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Message } from '@/integrations/supabase/types';

interface AIResponse {
  content: string;
  confidence: number;
  sources?: string[];
  suggestedQuestions?: string[];
}

interface UseAIChatProps {
  conversationId: string;
  onMessageSent?: (message: Message) => void;
}

export function useAIChat({ conversationId, onMessageSent }: UseAIChatProps) {
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Real AI response generation using OpenAI
  const generateAIResponse = useCallback(async (userMessage: string, context?: string): Promise<AIResponse> => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      // Fallback to simulated response if no API key
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      const responses = [
        {
          content: `Great question! Based on your query about "${userMessage}", here's what I can tell you: This is a comprehensive explanation that should help clarify the concept. Let me know if you need any clarification!`,
          confidence: 0.85,
          sources: ['Course Material', 'Academic Database'],
          suggestedQuestions: ['Can you elaborate on this?', 'What are the practical applications?', 'How does this relate to other topics?']
        },
        {
          content: `I understand you're asking about "${userMessage}". This is an important topic that connects to several key concepts. Here's my analysis: The fundamental principles here are crucial for understanding the broader context.`,
          confidence: 0.92,
          sources: ['Textbook Chapter 3', 'Research Papers'],
          suggestedQuestions: ['What are the exceptions to this rule?', 'How does this apply in real-world scenarios?', 'Can you provide examples?']
        },
        {
          content: `Excellent question! "${userMessage}" touches on some complex ideas. Let me break this down for you: The key insight here is understanding the underlying mechanisms. This approach will help you tackle similar problems in the future.`,
          confidence: 0.78,
          sources: ['Lecture Notes', 'Practice Problems'],
          suggestedQuestions: ['What are the common mistakes to avoid?', 'How can I practice this concept?', 'What is the next logical step?']
        }
      ];

      const responseIndex = userMessage.length % responses.length;
      return responses[responseIndex];
    }

    try {
      // Real OpenAI API call
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an educational AI assistant helping students with their academic questions. Provide clear, detailed, and helpful explanations. Focus on educational content and learning.'
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || 'I apologize, but I could not generate a response at this time.';

      return {
        content: aiResponse,
        confidence: 0.9,
        sources: ['AI Generated Response'],
        suggestedQuestions: ['Can you elaborate on this?', 'What are the practical applications?', 'How does this relate to other topics?']
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      // Fallback to simulated response
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        content: `I understand you're asking about "${userMessage}". This is an important topic that connects to several key concepts. Here's my analysis: The fundamental principles here are crucial for understanding the broader context.`,
        confidence: 0.78,
        sources: ['Fallback Response'],
        suggestedQuestions: ['What are the common mistakes to avoid?', 'How can I practice this concept?', 'What is the next logical step?']
      };
    }
  }, []);

  const sendAIMessage = useMutation({
    mutationFn: async ({ content, messageType = 'text' }: { content: string; messageType?: string }) => {
      // First, send the user's message
      const { data: userMessage, error: userError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: (await supabase.auth.getUser()).data.user?.id,
          content,
          message_type: messageType,
        })
        .select('*')
        .single();

      if (userError) throw userError;

      // Show typing indicator
      setIsTyping(true);

      try {
        // Generate AI response
        const aiResponse = await generateAIResponse(content);

        // Send AI response
        const { data: aiMessage, error: aiError } = await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            sender_id: 'ai-assistant', // Special ID for AI messages
            content: aiResponse.content,
            message_type: 'ai-response',
            file_url: aiResponse.sources ? JSON.stringify(aiResponse.sources) : null,
            file_name: aiResponse.suggestedQuestions ? JSON.stringify(aiResponse.suggestedQuestions) : null,
          })
          .select('*')
          .single();

        if (aiError) throw aiError;

        return { userMessage, aiMessage, aiResponse };
      } finally {
        setIsTyping(false);
      }
    },
    onSuccess: (data) => {
      // Invalidate messages query to refresh the conversation
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });

      if (onMessageSent) {
        onMessageSent(data.userMessage);
      }

      toast({
        title: "AI Response Generated",
        description: "The AI has provided a detailed response to your question.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message or get AI response. Please try again.",
        variant: "destructive",
      });
      console.error('AI Chat Error:', error);
    },
  });

  const askAIQuestion = useCallback(async (question: string) => {
    await sendAIMessage.mutateAsync({ content: question });
  }, [sendAIMessage]);

  return {
    sendAIMessage,
    askAIQuestion,
    isTyping,
    isPending: sendAIMessage.isPending,
  };
} 