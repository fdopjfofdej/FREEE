/*
  # Ajout de la fonction pour gérer les profils OAuth

  Cette migration ajoute une fonction pour créer automatiquement un profil
  lorsqu'un utilisateur se connecte via OAuth (Google).
*/

-- Fonction pour créer un profil lors de la connexion OAuth
CREATE OR REPLACE FUNCTION handle_oauth_user_profile()
RETURNS trigger AS $$
BEGIN
  -- Créer un profil si l'utilisateur n'en a pas déjà un
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    INSERT INTO public.profiles (id, role, created_at)
    VALUES (NEW.id, 'user', now());
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer un trigger pour les nouveaux utilisateurs OAuth
DROP TRIGGER IF EXISTS on_oauth_user_created ON auth.users;
CREATE TRIGGER on_oauth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  WHEN (NEW.email IS NOT NULL)
  EXECUTE FUNCTION handle_oauth_user_profile();