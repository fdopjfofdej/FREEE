/*
  # Add city search and validation

  1. Changes
    - Add city column if not exists
    - Add city_search column for text search
    - Add GIN index for fast text search
    - Add trigger to maintain search vector
    - Add validation for Swiss cities
    - Add validation for required city on new entries

  2. Notes
    - Using tsvector for efficient text search
    - City is required for new entries
    - Includes validation for Swiss cities
*/

-- Ajouter la colonne city si elle n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'city') THEN
    ALTER TABLE cars ADD COLUMN city text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'city_search') THEN
    ALTER TABLE cars ADD COLUMN city_search tsvector;
  END IF;
END $$;

-- Créer un index GIN pour la recherche textuelle
CREATE INDEX IF NOT EXISTS cars_city_search_idx ON cars USING GIN(city_search);

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

-- Fonction pour générer le vecteur de recherche
CREATE OR REPLACE FUNCTION generate_city_search() RETURNS trigger AS $$
BEGIN
  IF NEW.city IS NOT NULL THEN
    NEW.city_search := to_tsvector('french', NEW.city::text);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour maintenir le vecteur de recherche à jour
DROP TRIGGER IF EXISTS cars_city_search_trigger ON cars;
CREATE TRIGGER cars_city_search_trigger
  BEFORE INSERT OR UPDATE OF city
  ON cars
  FOR EACH ROW
  EXECUTE FUNCTION generate_city_search();

-- Fonction de validation pour les nouvelles entrées
CREATE OR REPLACE FUNCTION validate_car_city()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.city IS NULL THEN
    RAISE EXCEPTION 'La ville est obligatoire pour les nouvelles annonces';
  END IF;

  IF NEW.city IS NOT NULL AND NOT is_valid_swiss_city(NEW.city::text) THEN
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

-- Mettre à jour les vecteurs de recherche pour les entrées existantes
UPDATE cars SET city_search = to_tsvector('french', city::text) WHERE city IS NOT NULL;