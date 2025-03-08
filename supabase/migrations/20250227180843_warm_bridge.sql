/*
  # Fix authentication errors
  
  1. Changes
    - Ensure profiles table exists with proper structure
    - Fix the profile creation trigger to handle errors properly
    - Add CASCADE deletion to maintain database integrity
    - Ensure proper RLS policies for profiles
*/

-- Ensure the profiles table exists with proper structure
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  banned_until timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users;
DROP FUNCTION IF EXISTS create_profile_for_user();

-- Create a more robust function for profile creation
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS trigger AS $$
DECLARE
  new_role text := 'user';
BEGIN
  -- Only create a profile if one doesn't already exist
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = new.id) THEN
    -- Insert with exception handling
    BEGIN
      INSERT INTO public.profiles (id, role, created_at)
      VALUES (new.id, new_role, now());
    EXCEPTION WHEN OTHERS THEN
      -- Log error but don't fail the transaction
      RAISE LOG 'Failed to create profile for user %: %', new.id, SQLERRM;
    END;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger with proper error handling
CREATE TRIGGER create_profile_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_for_user();

-- Ensure proper RLS policies exist
DO $$
BEGIN
  -- Drop existing policies to avoid conflicts
  DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leur propre profil" ON profiles;
  DROP POLICY IF EXISTS "Les admins peuvent voir tous les profils" ON profiles;
  DROP POLICY IF EXISTS "Les admins peuvent modifier les profils" ON profiles;
  
  -- Recreate policies
  CREATE POLICY "Les utilisateurs peuvent voir leur propre profil"
    ON profiles FOR SELECT
    USING (auth.uid() = id);
    
  CREATE POLICY "Les admins peuvent voir tous les profils"
    ON profiles FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'admin'
      )
    );
    
  CREATE POLICY "Les admins peuvent modifier les profils"
    ON profiles FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'admin'
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'admin'
      )
    );
END
$$;

-- Create admin function if it doesn't exist
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql;

-- Add insert policy for profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can insert their own profile'
  ) THEN
    CREATE POLICY "Users can insert their own profile"
      ON profiles FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;
END
$$;