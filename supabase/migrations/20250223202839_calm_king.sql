/*
  # Création de la table des voitures

  1. Nouvelle Table
    - `cars`
      - `id` (uuid, clé primaire)
      - `title` (text, titre de l'annonce)
      - `description` (text, description de la voiture)
      - `price` (integer, prix en centimes)
      - `year` (integer, année du véhicule)
      - `mileage` (integer, kilométrage)
      - `brand` (text, marque)
      - `model` (text, modèle)
      - `images` (text[], URLs des images)
      - `user_id` (uuid, référence à auth.users)
      - `created_at` (timestamp with time zone)

  2. Sécurité
    - Activation de RLS sur la table `cars`
    - Politiques pour:
      - Lecture publique
      - Création pour les utilisateurs authentifiés
      - Modification/Suppression uniquement par le propriétaire
*/

CREATE TABLE cars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  price integer NOT NULL,
  year integer NOT NULL,
  mileage integer NOT NULL,
  brand text NOT NULL,
  model text NOT NULL,
  images text[] DEFAULT '{}',
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cars ENABLE ROW LEVEL SECURITY;

-- Politique de lecture publique
CREATE POLICY "Cars are viewable by everyone" ON cars
  FOR SELECT USING (true);

-- Politique de création pour les utilisateurs authentifiés
CREATE POLICY "Users can create cars" ON cars
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Politique de modification pour le propriétaire
CREATE POLICY "Users can update their own cars" ON cars
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Politique de suppression pour le propriétaire
CREATE POLICY "Users can delete their own cars" ON cars
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);