/*
  # Add city column to cars table

  1. Changes
    - Add city column to cars table
    - Make city column required for new entries
    - Add index on city column for faster searches

  2. Notes
    - The city column will store the display name of the city
    - We're using text type since city names can vary in length
*/

-- Add city column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'city') THEN
    ALTER TABLE cars ADD COLUMN city text;
  END IF;
END $$;

-- Create an index on the city column for faster searches
CREATE INDEX IF NOT EXISTS cars_city_idx ON cars (city);

-- Add a trigger to ensure city is provided for new entries
CREATE OR REPLACE FUNCTION validate_car_city()
RETURNS trigger AS $$
BEGIN
  IF NEW.city IS NULL THEN
    RAISE EXCEPTION 'La ville est obligatoire';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS validate_car_city_trigger ON cars;
CREATE TRIGGER validate_car_city_trigger
  BEFORE INSERT OR UPDATE ON cars
  FOR EACH ROW
  EXECUTE FUNCTION validate_car_city();