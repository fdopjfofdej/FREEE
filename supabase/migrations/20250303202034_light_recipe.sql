/*
  # Admin Functions and Security Improvements

  1. Changes
     - Create a more secure admin check function
     - Add a function to safely count pending reports
     - Add a function to resolve reports
     - Improve user email retrieval with better error handling
  
  2. Security
     - Ensure proper security definer settings
     - Add error handling to prevent crashes
*/

-- Create a more secure admin check function
CREATE OR REPLACE FUNCTION is_admin_secure()
RETURNS boolean AS $$
DECLARE
  user_role text;
  user_id uuid;
BEGIN
  -- Get the current user ID
  user_id := auth.uid();
  
  -- If no user is logged in, return false
  IF user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Direct query without using RLS
  SELECT role INTO user_role
  FROM profiles
  WHERE id = user_id;
  
  RETURN user_role = 'admin';
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to count pending reports safely
CREATE OR REPLACE FUNCTION count_pending_reports()
RETURNS integer AS $$
DECLARE
  report_count integer;
BEGIN
  -- Check if user is admin
  IF NOT is_admin_secure() THEN
    RETURN 0;
  END IF;
  
  -- Count pending reports
  SELECT COUNT(*) INTO report_count
  FROM car_reports
  WHERE status = 'pending';
  
  RETURN report_count;
EXCEPTION
  WHEN OTHERS THEN
    RETURN 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing function if it exists to avoid return type error
DROP FUNCTION IF EXISTS resolve_report(uuid, text);

-- Function to resolve reports safely
CREATE FUNCTION resolve_report(
  p_report_id uuid,
  p_status text
)
RETURNS void AS $$
BEGIN
  -- Check if user is admin
  IF NOT is_admin_secure() THEN
    RAISE EXCEPTION 'Vous n''avez pas les droits pour effectuer cette action';
  END IF;
  
  -- Validate status
  IF p_status NOT IN ('resolved', 'dismissed') THEN
    RAISE EXCEPTION 'Statut invalide. Utilisez "resolved" ou "dismissed"';
  END IF;
  
  -- Update report
  UPDATE car_reports
  SET 
    status = p_status,
    resolved_at = now(),
    resolved_by = auth.uid()
  WHERE id = p_report_id;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing function if it exists to avoid return type error
DROP FUNCTION IF EXISTS get_user_emails();

-- Improved function to get user emails with better error handling
CREATE FUNCTION get_user_emails()
RETURNS TABLE (id uuid, email text) AS $$
BEGIN
  -- Check if user is admin
  IF NOT is_admin_secure() THEN
    RAISE EXCEPTION 'Vous n''avez pas les droits pour effectuer cette action';
  END IF;

  -- Return user emails
  RETURN QUERY
  SELECT au.id, au.email::text
  FROM auth.users au
  ORDER BY au.created_at DESC;
EXCEPTION
  WHEN OTHERS THEN
    -- Return empty result instead of error
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;