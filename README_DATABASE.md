# Database Setup for My Learning Feature

## Overview
The My Learning feature requires database tables to store course information and user enrollments. This document explains how to set up the required database structure.

## Required Tables

### 1. external_courses
Stores information about available courses from external providers.

### 2. enrolled_courses  
Tracks user enrollments with progress tracking.

### 3. course_access_logs
Records when users access courses for analytics.

## Setup Instructions

### Option 1: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `database_setup.sql`
4. Execute the script

### Option 2: Using Supabase CLI
```bash
supabase db reset
```

## Database Schema

### external_courses
- `id` (TEXT, PRIMARY KEY): Unique course identifier
- `title` (TEXT): Course title
- `description` (TEXT): Course description
- `provider` (TEXT): Course provider (e.g., Coursera, edX)
- `url` (TEXT): Course URL
- `duration` (TEXT): Course duration
- `rating` (DECIMAL): Course rating
- `students` (INTEGER): Number of enrolled students
- `is_live` (BOOLEAN): Whether course is live
- `instructor` (TEXT): Instructor name
- `category` (TEXT): Course category
- `thumbnail` (TEXT): Course thumbnail URL
- `created_at` (TIMESTAMP): Creation timestamp

### enrolled_courses
- `id` (UUID, PRIMARY KEY): Unique enrollment ID
- `user_id` (UUID): User ID (references auth.users)
- `course_id` (TEXT): Course ID (references external_courses)
- `progress_percentage` (INTEGER): User's progress (0-100)
- `enrolled_at` (TIMESTAMP): Enrollment timestamp

### course_access_logs
- `id` (UUID, PRIMARY KEY): Unique log ID
- `user_id` (UUID): User ID (references auth.users)
- `course_id` (TEXT): Course ID
- `course_title` (TEXT): Course title
- `provider` (TEXT): Course provider
- `accessed_at` (TIMESTAMP): Access timestamp

## Security Policies

The setup includes Row Level Security (RLS) policies to ensure:
- Users can only access their own enrollments
- Users can only view their own access logs
- All authenticated users can read external courses

## Fallback Behavior

If the database tables are not set up:
- The application will work with mock enrollments
- Course enrollment will still function but won't persist
- No errors will be shown to users
- The feature will gracefully degrade

## Troubleshooting

### Common Issues

1. **"relation does not exist" error**
   - Run the database setup script
   - Check that all tables were created successfully

2. **Permission denied errors**
   - Ensure RLS policies are properly configured
   - Check that the user is authenticated

3. **Enrollment not working**
   - Verify the enrolled_courses table exists
   - Check that the user has proper permissions

### Verification

To verify the setup is working:
1. Try enrolling in a course
2. Check the My Learning page
3. Verify the course appears in your enrolled courses
4. Test the delete functionality

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify the database tables exist in Supabase
3. Ensure all RLS policies are active
4. Check that the user is properly authenticated 