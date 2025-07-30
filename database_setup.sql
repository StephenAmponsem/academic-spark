-- Create external_courses table to store course information
CREATE TABLE IF NOT EXISTS external_courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  provider TEXT NOT NULL,
  url TEXT NOT NULL,
  duration TEXT,
  rating DECIMAL(3,2),
  students INTEGER DEFAULT 0,
  is_live BOOLEAN DEFAULT false,
  instructor TEXT,
  category TEXT,
  thumbnail TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create enrolled_courses table to track user enrollments
CREATE TABLE IF NOT EXISTS enrolled_courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT REFERENCES external_courses(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Create course_access_logs table to track course access
CREATE TABLE IF NOT EXISTS course_access_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT,
  course_title TEXT,
  provider TEXT,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_enrolled_courses_user_id ON enrolled_courses(user_id);
CREATE INDEX IF NOT EXISTS idx_enrolled_courses_course_id ON enrolled_courses(course_id);
CREATE INDEX IF NOT EXISTS idx_course_access_logs_user_id ON course_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_external_courses_category ON external_courses(category);

-- Enable Row Level Security (RLS)
ALTER TABLE external_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrolled_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_access_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for external_courses (read-only for all authenticated users)
DROP POLICY IF EXISTS "Allow authenticated users to read external courses" ON external_courses;
CREATE POLICY "Allow authenticated users to read external courses" ON external_courses
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to insert external courses" ON external_courses;
CREATE POLICY "Allow authenticated users to insert external courses" ON external_courses
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policies for enrolled_courses (users can only access their own enrollments)
DROP POLICY IF EXISTS "Users can view their own enrollments" ON enrolled_courses;
CREATE POLICY "Users can view their own enrollments" ON enrolled_courses
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own enrollments" ON enrolled_courses;
CREATE POLICY "Users can insert their own enrollments" ON enrolled_courses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own enrollments" ON enrolled_courses;
CREATE POLICY "Users can update their own enrollments" ON enrolled_courses
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own enrollments" ON enrolled_courses;
CREATE POLICY "Users can delete their own enrollments" ON enrolled_courses
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for course_access_logs (users can only access their own logs)
DROP POLICY IF EXISTS "Users can view their own access logs" ON course_access_logs;
CREATE POLICY "Users can view their own access logs" ON course_access_logs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own access logs" ON course_access_logs;
CREATE POLICY "Users can insert their own access logs" ON course_access_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id); 