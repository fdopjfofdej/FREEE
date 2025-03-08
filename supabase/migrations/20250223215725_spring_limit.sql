/*
  # Add phone number validation and required fields

  1. Changes
    - Add phone number with format validation
    - Add expertisee flag
    - Add professional seller fields
    - Add consumption field
    - Ensure phone number format compliance
*/

-- First add the columns without constraints
DO $$ BEGIN
  -- Add columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'phone_number') THEN
    ALTER TABLE cars ADD COLUMN phone_number text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'expertisee') THEN
    ALTER TABLE cars ADD COLUMN expertisee boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'is_professional') THEN
    ALTER TABLE cars ADD COLUMN is_professional boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'company_name') THEN
    ALTER TABLE cars ADD COLUMN company_name text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'consommation') THEN
    ALTER TABLE cars ADD COLUMN consommation numeric;
  END IF;
END $$;

-- Create a function to validate phone numbers
CREATE OR REPLACE FUNCTION is_valid_phone_number(phone text)
RETURNS boolean AS $$
BEGIN
  RETURN phone ~ '^(\+33|0)[1-9][0-9]{8}$';
END;
$$ LANGUAGE plpgsql;

-- Create a trigger function to ensure phone number is provided and valid for new entries
CREATE OR REPLACE FUNCTION validate_car_phone_number()
RETURNS trigger AS $$
BEGIN
  -- Check if phone number is provided
  IF NEW.phone_number IS NULL THEN
    RAISE EXCEPTION 'Le numéro de téléphone est obligatoire';
  END IF;
  
  -- Validate phone number format
  IF NOT is_valid_phone_number(NEW.phone_number) THEN
    RAISE EXCEPTION 'Format de numéro de téléphone invalide. Utilisez le format 0612345678 ou +33612345678';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS validate_car_phone_number_trigger ON cars;

-- Create the trigger for new entries
CREATE TRIGGER validate_car_phone_number_trigger
  BEFORE INSERT OR UPDATE ON cars
  FOR EACH ROW
  EXECUTE FUNCTION validate_car_phone_number();