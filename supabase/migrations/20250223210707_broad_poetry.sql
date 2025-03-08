/*
  # Ajout des informations du vendeur

  1. Nouvelles colonnes
    - `phone_number` (text) : Numéro de téléphone du vendeur
    - `is_professional` (boolean) : Indique si le vendeur est un professionnel
    - `company_name` (text) : Nom de l'entreprise pour les vendeurs professionnels

  2. Sécurité
    - Mise à jour des politiques RLS pour protéger les numéros de téléphone
*/

-- Ajout des colonnes pour les informations du vendeur
ALTER TABLE cars ADD COLUMN IF NOT EXISTS phone_number text;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS is_professional boolean DEFAULT false;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS company_name text;

-- Politique pour masquer le numéro de téléphone aux utilisateurs non authentifiés
CREATE POLICY "Mask phone number for unauthenticated users"
ON cars
FOR SELECT
TO public
USING (
  CASE 
    WHEN auth.role() = 'authenticated' THEN true
    ELSE phone_number IS NULL
  END
);