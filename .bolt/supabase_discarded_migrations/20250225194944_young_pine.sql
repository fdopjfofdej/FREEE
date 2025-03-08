/*
  # Ajout des rôles administrateurs et tables de modération

  1. Nouvelles Tables
    - `profiles`
      - `id` (uuid, clé primaire)
      - `role` (text, 'user' ou 'admin')
      - `banned_until` (timestamptz, nullable)
      - `created_at` (timestamptz)
    
    - `car_reports`
      - `id` (uuid, clé primaire)
      - `car_id` (uuid, référence vers cars)
      - `reporter_id` (uuid, référence vers auth.users)
      - `reason` (text)
      - `status` (text: 'pending', 'resolved', 'dismissed')
      - `created_at` (timestamptz)
      - `resolved_at` (timestamptz, nullable)
      - `resolved_by` (uuid, référence vers auth.users)

  2. Sécurité
    - RLS activé sur les deux tables
    - Politiques pour les administrateurs et utilisateurs
*/

-- Table des profils utilisateurs
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  banned_until timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Table des signalements d'annonces
CREATE TABLE IF NOT EXISTS car_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id uuid REFERENCES cars(id) ON DELETE CASCADE,
  reporter_id uuid REFERENCES auth.users(id),
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id),
  CONSTRAINT car_reports_resolved_check CHECK (
    (status IN ('resolved', 'dismissed') AND resolved_at IS NOT NULL AND resolved_by IS NOT NULL) OR
    (status = 'pending' AND resolved_at IS NULL AND resolved_by IS NULL)
  )
);

-- Activer RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_reports ENABLE ROW LEVEL SECURITY;

-- Politiques pour profiles
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

-- Politiques pour car_reports
CREATE POLICY "Les utilisateurs peuvent créer des signalements"
  ON car_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Les utilisateurs peuvent voir leurs signalements"
  ON car_reports FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "Les admins peuvent voir tous les signalements"
  ON car_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Les admins peuvent modifier les signalements"
  ON car_reports FOR UPDATE
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

-- Trigger pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, role)
  VALUES (new.id, 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users;
CREATE TRIGGER create_profile_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_for_user();

-- Fonction pour vérifier si un utilisateur est admin
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

-- Fonction pour vérifier si un utilisateur est banni
CREATE OR REPLACE FUNCTION is_banned()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND banned_until > now()
  );
END;
$$ LANGUAGE plpgsql;