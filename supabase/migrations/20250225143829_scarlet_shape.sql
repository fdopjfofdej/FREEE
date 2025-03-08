-- Add text search columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'brand_search') THEN
    ALTER TABLE cars ADD COLUMN brand_search tsvector;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'model_search') THEN
    ALTER TABLE cars ADD COLUMN model_search tsvector;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'full_search') THEN
    ALTER TABLE cars ADD COLUMN full_search tsvector;
  END IF;
END $$;

-- Create GIN indexes for text search
CREATE INDEX IF NOT EXISTS cars_brand_search_idx ON cars USING GIN(brand_search);
CREATE INDEX IF NOT EXISTS cars_model_search_idx ON cars USING GIN(model_search);
CREATE INDEX IF NOT EXISTS cars_full_search_idx ON cars USING GIN(full_search);

-- Function to generate search vectors
CREATE OR REPLACE FUNCTION generate_car_search_vectors() RETURNS trigger AS $$
BEGIN
  -- Generate individual search vectors
  NEW.brand_search := to_tsvector('french', NEW.brand);
  NEW.model_search := to_tsvector('french', NEW.model);
  
  -- Generate combined search vector with city cast to text
  NEW.full_search := setweight(to_tsvector('french', NEW.brand), 'A') ||
                    setweight(to_tsvector('french', NEW.model), 'B') ||
                    setweight(to_tsvector('french', COALESCE(NEW.city::text, '')), 'C');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to maintain search vectors
DROP TRIGGER IF EXISTS cars_search_vectors_trigger ON cars;
CREATE TRIGGER cars_search_vectors_trigger
  BEFORE INSERT OR UPDATE OF brand, model, city
  ON cars
  FOR EACH ROW
  EXECUTE FUNCTION generate_car_search_vectors();

-- Update existing records with explicit type casting
UPDATE cars 
SET 
  brand_search = to_tsvector('french', brand),
  model_search = to_tsvector('french', model),
  full_search = setweight(to_tsvector('french', brand), 'A') ||
                setweight(to_tsvector('french', model), 'B') ||
                setweight(to_tsvector('french', COALESCE(city::text, '')), 'C');