/*
  # Fonction pour récupérer les emails des utilisateurs

  Cette migration ajoute une fonction RPC sécurisée qui permet aux administrateurs
  de récupérer les emails des utilisateurs sans avoir besoin d'accéder directement
  à l'API admin de Supabase.
*/

-- Fonction pour récupérer les emails des utilisateurs (admin uniquement)
CREATE OR REPLACE FUNCTION get_user_emails()
RETURNS TABLE (id uuid, email text) AS $$
BEGIN
  -- Vérifier que l'utilisateur est admin
  IF NOT is_admin_secure() THEN
    RAISE EXCEPTION 'Vous n''avez pas les droits pour effectuer cette action';
  END IF;

  -- Retourner les emails des utilisateurs
  RETURN QUERY
  SELECT au.id, au.email
  FROM auth.users au
  ORDER BY au.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;