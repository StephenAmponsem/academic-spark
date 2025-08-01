import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import useAuth from '@/hooks/useAuth';

export interface Course {
  id: string;
  title: string;
  description: string | null;
  instructor_id: string | null;
  difficulty_level: string | null;
  duration_hours: number | null;
  price: number | null;
  thumbnail_url: string | null;
  is_published: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CourseWithInstructor extends Course {
  instructor?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export const useCourses = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          instructor:profiles!instructor_id(full_name, avatar_url)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch courses",
          variant: "destructive",
        });
        throw error;
      }

      return data as CourseWithInstructor[];
    },
  });
};

export const useMyCourses = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  return useQuery({
    queryKey: ['my-courses', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('instructor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch your courses",
          variant: "destructive",
        });
        throw error;
      }

      return data as Course[];
    },
    enabled: !!user,
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (courseData: Omit<Course, 'id' | 'created_at' | 'updated_at' | 'instructor_id'>) => {
      if (!user) throw new Error('User must be authenticated');

      const { data, error } = await supabase
        .from('courses')
        .insert([{ ...courseData, instructor_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['my-courses'] });
      toast({
        title: "Success",
        description: "Course created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create course",
        variant: "destructive",
      });
      console.error('Create course error:', error);
    },
  });
};

export const useEnrollments = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  return useQuery({
    queryKey: ['enrollments', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          course:courses(
            *,
            instructor:profiles!instructor_id(full_name, avatar_url)
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch enrollments",
          variant: "destructive",
        });
        throw error;
      }

      return data;
    },
    enabled: !!user,
  });
};

export const useEnrollInCourse = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (courseId: string) => {
      if (!user) throw new Error('User must be authenticated');

      const { data, error } = await supabase
        .from('enrollments')
        .insert([{ 
          user_id: user.id, 
          course_id: courseId,
          progress_percentage: 0 
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      toast({
        title: "Success",
        description: "Successfully enrolled in course",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message.includes('duplicate') 
          ? "You are already enrolled in this course"
          : "Failed to enroll in course",
        variant: "destructive",
      });
    },
  });
};