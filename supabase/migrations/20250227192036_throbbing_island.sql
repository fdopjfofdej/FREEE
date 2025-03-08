/*
  # Fix get_user_emails function type mismatch

  This migration fixes the type mismatch in the get_user_emails function.
  The error was: "Returned type character varying(255) does not match expected type text in column 2"
  
  We're updating the function to explicitly cast the email to text to ensure type compatibility.
*/

-- Drop the existing function
DROP FUNCTION IF EXISTS get_user_emails();

-- Recreate the function with proper type casting
CREATE OR REPLACE FUNCTION get_user_emails()
RETURNS TABLE (id uuid, email text) AS $$
BEGIN
  -- Vérifier que l'utilisateur est admin
  IF NOT is_admin_secure() THEN
    RAISE EXCEPTION 'Vous n''avez pas les droits pour effectuer cette action';
  END IF;

  -- Retourner les emails des utilisateurs avec cast explicite
  RETURN QUERY
  SELECT au.id, au.email::text
  FROM auth.users au
  ORDER BY au.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;