-- Fix messaging tables - run this in your Supabase SQL editor
-- This script safely handles existing tables and recreates policies

-- Check and create conversations table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'conversations') THEN
        CREATE TABLE public.conversations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
            instructor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
            course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
            title TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(student_id, instructor_id, course_id)
        );
    END IF;
END $$;

-- Check and create messages table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'messages') THEN
        CREATE TABLE public.messages (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
            sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
            content TEXT NOT NULL,
            message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image', 'feedback')),
            file_url TEXT,
            file_name TEXT,
            file_size INTEGER,
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

-- Check and create feedback table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'feedback') THEN
        CREATE TABLE public.feedback (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
            feedback_type TEXT CHECK (feedback_type IN ('assignment', 'general', 'question', 'clarification')),
            rating INTEGER CHECK (rating >= 1 AND rating <= 5),
            feedback_text TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

-- Enable RLS on messaging tables (safe to run multiple times)
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view conversations they are part of" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update conversations they are part of" ON public.conversations;

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can create messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;

DROP POLICY IF EXISTS "Users can view feedback for messages they can see" ON public.feedback;
DROP POLICY IF EXISTS "Users can create feedback for messages they can see" ON public.feedback;

-- Create RLS policies for conversations
CREATE POLICY "Users can view conversations they are part of" ON public.conversations
  FOR SELECT USING (
    student_id = auth.uid() OR instructor_id = auth.uid()
  );

CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (
    student_id = auth.uid() OR instructor_id = auth.uid()
  );

CREATE POLICY "Users can update conversations they are part of" ON public.conversations
  FOR UPDATE USING (
    student_id = auth.uid() OR instructor_id = auth.uid()
  );

-- Create RLS policies for messages
CREATE POLICY "Users can view messages in their conversations" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id AND (c.student_id = auth.uid() OR c.instructor_id = auth.uid())
    )
  );

CREATE POLICY "Users can create messages in their conversations" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id AND (c.student_id = auth.uid() OR c.instructor_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own messages" ON public.messages
  FOR UPDATE USING (sender_id = auth.uid());

-- Create RLS policies for feedback
CREATE POLICY "Users can view feedback for messages they can see" ON public.feedback
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.messages m
      JOIN public.conversations c ON c.id = m.conversation_id
      WHERE m.id = message_id AND (c.student_id = auth.uid() OR c.instructor_id = auth.uid())
    )
  );

CREATE POLICY "Users can create feedback for messages they can see" ON public.feedback
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.messages m
      JOIN public.conversations c ON c.id = m.conversation_id
      WHERE m.id = message_id AND (c.student_id = auth.uid() OR c.instructor_id = auth.uid())
    )
  );

-- Create triggers for updated_at columns (safe to run multiple times)
DROP TRIGGER IF EXISTS update_conversations_updated_at ON public.conversations;
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_messages_updated_at ON public.messages;
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to mark messages as read
CREATE OR REPLACE FUNCTION public.mark_messages_as_read(conversation_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.messages 
  SET is_read = TRUE 
  WHERE conversation_id = conversation_uuid 
    AND sender_id != auth.uid()
    AND is_read = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get unread message count
CREATE OR REPLACE FUNCTION public.get_unread_message_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM public.messages m
    JOIN public.conversations c ON c.id = m.conversation_id
    WHERE (c.student_id = user_uuid OR c.instructor_id = user_uuid)
      AND m.sender_id != user_uuid
      AND m.is_read = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 