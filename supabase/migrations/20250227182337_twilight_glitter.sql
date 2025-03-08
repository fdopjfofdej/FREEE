/*
  # Fix infinite recursion in profiles policies
  
  1. Changes
    - Replace recursive policies with non-recursive alternatives
    - Create a secure admin check function that doesn't cause recursion
    - Fix RLS policies for the profiles table
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leur propre profil" ON profiles;
DROP POLICY IF EXISTS "Les admins peuvent voir tous les profils" ON profiles;
DROP POLICY IF EXISTS "Les admins peuvent modifier les profils" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Create a secure admin check function that doesn't cause recursion
CREATE OR REPLACE FUNCTION is_admin_secure()
RETURNS boolean AS $$
DECLARE
  user_role text;
BEGIN
  -- Direct query without using RLS
  SELECT role INTO user_role
  FROM profiles
  WHERE id = auth.uid();
  
  RETURN user_role = 'admin';
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create non-recursive policies
CREATE POLICY "Anyone can read profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own non-admin profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id AND (SELECT role FROM profiles WHERE id = auth.uid()) != 'admin')
  WITH CHECK (auth.uid() = id AND role = 'user');

CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (is_admin_secure())
  WITH CHECK (is_admin_secure());

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Update the is_admin function to use the secure version
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN is_admin_secure();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger function to ensure new users get a profile
CREATE OR REPLACE FUNCTION ensure_user_has_profile()
RETURNS trigger AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()) THEN
    INSERT INTO profiles (id, role, created_at)
    VALUES (auth.uid(), 'user', now());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get user role safely
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS text AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role
  FROM profiles
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, 'user');
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'user';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;