/*
  # Ajout du support des villes suisses

  1. Changements
    - Ajout d'une colonne `city` de type texte
    - Création d'un index pour optimiser les recherches
    - Ajout d'une validation pour s'assurer que la ville est fournie

  2. Notes
    - La colonne est ajoutée comme nullable pour permettre la migration des données existantes
    - Un index est créé pour améliorer les performances des recherches par ville
*/

-- Ajouter la colonne city si elle n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'city') THEN
    ALTER TABLE cars ADD COLUMN city text;
  END IF;
END $$;

-- Créer un index pour optimiser les recherches par ville
CREATE INDEX IF NOT EXISTS cars_city_idx ON cars (city);

-- Fonction de validation pour les nouvelles entrées
CREATE OR REPLACE FUNCTION validate_car_city()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.city IS NULL THEN
    RAISE EXCEPTION 'La ville est obligatoire pour les nouvelles annonces';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger de validation uniquement pour les nouvelles entrées
DROP TRIGGER IF EXISTS validate_car_city_trigger ON cars;
CREATE TRIGGER validate_car_city_trigger
  BEFORE INSERT ON cars
  FOR EACH ROW
  EXECUTE FUNCTION validate_car_city();