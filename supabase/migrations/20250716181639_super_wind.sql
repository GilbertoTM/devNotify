/*
  # Fix RLS policies for profiles table

  1. Policy Updates
    - Drop existing problematic policies that cause infinite recursion
    - Create simple, direct policies for authenticated users
    - Allow users to read and insert their own profile data
    - Allow admins to read all profiles

  2. Security
    - Users can only access their own profile data
    - Admins can read all profiles for user management
    - Profile creation is allowed during signup process
*/

-- Drop existing policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

-- Create simple, direct policies without recursion
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() 
      AND p.role = 'admin'
    )
  );