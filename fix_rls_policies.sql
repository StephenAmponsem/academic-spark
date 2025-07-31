-- Fix RLS Policies for User Authentication
-- This script fixes the Row Level Security policies that are causing database errors

-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Allow authenticated users to read external courses" ON external_courses;
DROP POLICY IF EXISTS "Allow authenticated users to insert external courses" ON external_courses;
DROP POLICY IF EXISTS "Users can view their own enrollments" ON enrolled_courses;
DROP POLICY IF EXISTS "Users can insert their own enrollments" ON enrolled_courses;
DROP POLICY IF EXISTS "Users can update their own enrollments" ON enrolled_courses;
DROP POLICY IF EXISTS "Users can delete their own enrollments" ON enrolled_courses;

-- Create new, more permissive policies for profiles
CREATE POLICY "Enable read access for all users" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on id" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable delete for users based on id" ON public.profiles
  FOR DELETE USING (auth.uid() = id);

-- Create policies for user_settings
CREATE POLICY "Enable read access for all users" ON public.user_settings
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.user_settings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on id" ON public.user_settings
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable delete for users based on id" ON public.user_settings
  FOR DELETE USING (auth.uid() = id);

-- Create policies for external_courses
CREATE POLICY "Enable read access for all users" ON external_courses
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON external_courses
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON external_courses
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON external_courses
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for enrolled_courses
CREATE POLICY "Enable read access for users based on user_id" ON enrolled_courses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for authenticated users only" ON enrolled_courses
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on user_id" ON enrolled_courses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id" ON enrolled_courses
  FOR DELETE USING (auth.uid() = user_id);

-- Update the trigger function to handle errors better
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert profile with error handling
  BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
      NEW.id, 
      COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
      COALESCE(NEW.raw_user_meta_data ->> 'role', 'student')
    );
  EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't fail the signup
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
  END;
  
  -- Insert user settings with error handling
  BEGIN
    INSERT INTO public.user_settings (id)
    VALUES (NEW.id);
  EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't fail the signup
    RAISE WARNING 'Failed to create user settings for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 