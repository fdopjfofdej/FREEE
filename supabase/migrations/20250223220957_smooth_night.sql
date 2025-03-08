/*
  # Add phone number validation

  1. Changes
    - Add phone number validation function
    - Add trigger for phone number validation
    - Update phone number format to Swiss format

  2. Validation Rules
    - Phone number is required
    - Must match Swiss format (0791234567 or +41791234567)
    - Trigger runs on INSERT and UPDATE
*/

-- Create a function to validate Swiss phone numbers
CREATE OR REPLACE FUNCTION is_valid_swiss_phone_number(phone text)
RETURNS boolean AS $$
BEGIN
  RETURN phone ~ '^(\+41|0)[1-9][0-9]{8}$';
END;
$$ LANGUAGE plpgsql;

-- Create a trigger function to validate phone numbers
CREATE OR REPLACE FUNCTION validate_swiss_phone_number()
RETURNS trigger AS $$
BEGIN
  -- Check if phone number is provided
  IF NEW.phone_number IS NULL THEN
    RAISE EXCEPTION 'Le numéro de téléphone est obligatoire';
  END IF;
  
  -- Validate phone number format
  IF NOT is_valid_swiss_phone_number(NEW.phone_number) THEN
    RAISE EXCEPTION 'Format de numéro de téléphone invalide. Utilisez le format 0791234567 ou +41791234567';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS validate_swiss_phone_number_trigger ON cars;

-- Create the trigger
CREATE TRIGGER validate_swiss_phone_number_trigger
  BEFORE INSERT OR UPDATE ON cars
  FOR EACH ROW
  EXECUTE FUNCTION validate_swiss_phone_number();