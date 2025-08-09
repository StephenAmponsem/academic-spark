-- Update the handle_new_user function to check for role in user metadata
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Try to get role from user metadata, fallback to 'student'
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
  
  -- Insert the new user profile with the determined role
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    user_role
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Also create a function to update existing users who might have 'none' role
CREATE OR REPLACE FUNCTION fix_user_roles()
RETURNS void AS $$
BEGIN
  -- Update any profiles that have NULL or 'none' role to 'student'
  UPDATE public.profiles 
  SET role = 'student' 
  WHERE role IS NULL OR role = 'none' OR role = '';
  
  -- Also check auth.users metadata and update profiles accordingly
  UPDATE public.profiles 
  SET role = COALESCE(auth.users.raw_user_meta_data->>'role', 'student')
  FROM auth.users 
  WHERE profiles.id = auth.users.id 
  AND (profiles.role IS NULL OR profiles.role = 'none' OR profiles.role = '');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Run the fix function to update existing users
SELECT fix_user_roles();

-- Add a helpful comment
COMMENT ON FUNCTION handle_new_user() IS 'Automatically creates user profile with role from metadata on signup';
COMMENT ON FUNCTION fix_user_roles() IS 'Fixes existing users who have invalid or missing roles';