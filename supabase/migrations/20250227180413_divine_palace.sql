/*
  # Fix user authentication issues
  
  1. Changes
    - Modify the profile creation trigger to handle errors gracefully
    - Add IF NOT EXISTS checks to prevent duplicate profile creation
    - Ensure proper error handling for auth flows
*/

-- Drop the existing trigger that might be causing issues
DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users;

-- Create a more robust function for profile creation
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS trigger AS $$
BEGIN
  -- Only create a profile if one doesn't already exist
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = new.id) THEN
    BEGIN
      INSERT INTO profiles (id, role)
      VALUES (new.id, 'user');
    EXCEPTION WHEN OTHERS THEN
      -- Log error but don't fail the transaction
      RAISE NOTICE 'Failed to create profile for user %: %', new.id, SQLERRM;
    END;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger with proper error handling
CREATE TRIGGER create_profile_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_for_user();

-- Ensure the profiles table exists with proper structure
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  banned_until timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on profiles if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Ensure proper RLS policies exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Les utilisateurs peuvent voir leur propre profil'
  ) THEN
    CREATE POLICY "Les utilisateurs peuvent voir leur propre profil"
      ON profiles FOR SELECT
      USING (auth.uid() = id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Les admins peuvent voir tous les profils'
  ) THEN
    CREATE POLICY "Les admins peuvent voir tous les profils"
      ON profiles FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid()
          AND role = 'admin'
        )
      );
  END IF;
END
$$;