/*
  # Ajout de la validation des numéros de téléphone

  1. Modifications
    - Ajout de colonnes si elles n'existent pas :
      - phone_number (text)
      - expertisee (boolean)
      - is_professional (boolean)
      - company_name (text)
      - consommation (numeric)
    
  2. Validation
    - Création d'une fonction de validation pour les numéros de téléphone suisses
    - Ajout d'un trigger pour valider les numéros lors de l'insertion/mise à jour
*/

-- Ajout des colonnes si elles n'existent pas
DO $$ 
BEGIN
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

-- Fonction de validation des numéros de téléphone (format suisse)
CREATE OR REPLACE FUNCTION is_valid_phone_number(phone text)
RETURNS boolean AS $$
BEGIN
  RETURN phone ~ '^(\+41|0)[1-9][0-9]{8}$';
END;
$$ LANGUAGE plpgsql;

-- Fonction trigger pour valider les numéros de téléphone
CREATE OR REPLACE FUNCTION validate_car_phone_number()
RETURNS trigger AS $$
BEGIN
  -- Vérification de la présence du numéro
  IF NEW.phone_number IS NULL THEN
    RAISE EXCEPTION 'Le numéro de téléphone est obligatoire';
  END IF;
  
  -- Validation du format
  IF NOT is_valid_phone_number(NEW.phone_number) THEN
    RAISE EXCEPTION 'Format de numéro de téléphone invalide. Utilisez le format 0791234567 ou +41791234567';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Suppression du trigger s'il existe
DROP TRIGGER IF EXISTS validate_car_phone_number_trigger ON cars;

-- Création du trigger
CREATE TRIGGER validate_car_phone_number_trigger
  BEFORE INSERT OR UPDATE ON cars
  FOR EACH ROW
  EXECUTE FUNCTION validate_car_phone_number();