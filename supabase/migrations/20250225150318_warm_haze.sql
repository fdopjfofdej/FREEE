/*
  # Fix city column type

  1. Changes
    - Drop existing triggers and functions that depend on city column
    - Convert city column from enum to text type
    - Recreate necessary triggers and functions
    - Keep the index for performance
*/

-- Drop existing triggers and functions that depend on city
DROP TRIGGER IF EXISTS cars_city_search_trigger ON cars;
DROP TRIGGER IF EXISTS cars_search_vectors_trigger ON cars;
DROP TRIGGER IF EXISTS validate_car_city_trigger ON cars;

DROP FUNCTION IF EXISTS generate_city_search();
DROP FUNCTION IF EXISTS generate_car_search_vectors();
DROP FUNCTION IF EXISTS validate_car_city();

-- Convert city column to text
ALTER TABLE cars ALTER COLUMN city TYPE text;

-- Recreate the search vector function
CREATE OR REPLACE FUNCTION generate_car_search_vectors() RETURNS trigger AS $$
BEGIN
  -- Generate individual search vectors
  NEW.brand_search := to_tsvector('french', NEW.brand);
  NEW.model_search := to_tsvector('french', NEW.model);
  
  -- Generate combined search vector
  NEW.full_search := setweight(to_tsvector('french', NEW.brand), 'A') ||
                    setweight(to_tsvector('french', NEW.model), 'B') ||
                    setweight(to_tsvector('french', COALESCE(NEW.city, '')), 'C');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the validation function
CREATE OR REPLACE FUNCTION validate_car_city()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.city IS NULL THEN
    RAISE EXCEPTION 'La ville est obligatoire pour les nouvelles annonces';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the triggers
CREATE TRIGGER cars_search_vectors_trigger
  BEFORE INSERT OR UPDATE OF brand, model, city
  ON cars
  FOR EACH ROW
  EXECUTE FUNCTION generate_car_search_vectors();

CREATE TRIGGER validate_car_city_trigger
  BEFORE INSERT ON cars
  FOR EACH ROW
  EXECUTE FUNCTION validate_car_city();

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS cars_city_idx ON cars (city);
CREATE INDEX IF NOT EXISTS cars_brand_search_idx ON cars USING GIN(brand_search);
CREATE INDEX IF NOT EXISTS cars_model_search_idx ON cars USING GIN(model_search);
CREATE INDEX IF NOT EXISTS cars_full_search_idx ON cars USING GIN(full_search);

-- Update existing records
UPDATE cars 
SET 
  brand_search = to_tsvector('french', brand),
  model_search = to_tsvector('french', model),
  full_search = setweight(to_tsvector('french', brand), 'A') ||
                setweight(to_tsvector('french', model), 'B') ||
                setweight(to_tsvector('french', COALESCE(city, '')), 'C');