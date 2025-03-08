/*
  # Add city validation for Swiss cities

  1. Changes
    - Add city column if not exists
    - Add validation for Swiss cities using text type
    - Add index for faster searches
    - Add trigger for required city on new entries

  2. Notes
    - Using text type for city names
    - Validating against a list of Swiss cities
    - City is required for new entries
*/

-- Ajouter la colonne city si elle n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'city') THEN
    ALTER TABLE cars ADD COLUMN city text;
  END IF;
END $$;

-- Créer une fonction pour valider les villes suisses
CREATE OR REPLACE FUNCTION is_valid_swiss_city(city_name text)
RETURNS boolean AS $$
BEGIN
  RETURN city_name = ANY(ARRAY[
    'Zürich', 'Genève', 'Basel', 'Lausanne', 'Bern', 'Winterthur', 'Lucerne',
    'St. Gallen', 'Lugano', 'Biel/Bienne', 'Thun', 'Bellinzona', 'Fribourg',
    'Schaffhausen', 'Chur', 'Sion', 'Neuchâtel', 'Uster', 'Zug', 'Yverdon',
    'Montreux', 'Rapperswil', 'Davos', 'Aarau', 'Vevey'
  ]::text[]);
END;
$$ LANGUAGE plpgsql;

-- Créer un index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS cars_city_idx ON cars (city);

-- Fonction de validation pour les nouvelles entrées
CREATE OR REPLACE FUNCTION validate_car_city()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.city IS NULL THEN
    RAISE EXCEPTION 'La ville est obligatoire pour les nouvelles annonces';
  END IF;

  IF NEW.city IS NOT NULL AND NOT is_valid_swiss_city(NEW.city) THEN
    RAISE EXCEPTION 'La ville % n''est pas une ville suisse valide', NEW.city;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger de validation
DROP TRIGGER IF EXISTS validate_car_city_trigger ON cars;
CREATE TRIGGER validate_car_city_trigger
  BEFORE INSERT OR UPDATE ON cars
  FOR EACH ROW
  EXECUTE FUNCTION validate_car_city();