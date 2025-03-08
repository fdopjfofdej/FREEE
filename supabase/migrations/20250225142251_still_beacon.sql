/*
  # Amélioration de la gestion des villes

  1. Changements
    - Ajout d'une colonne city avec valeur par défaut
    - Création d'un type enum pour les villes suisses
    - Ajout d'un index pour optimiser les recherches
    - Ajout d'une validation des villes

  2. Sécurité
    - Validation des données pour assurer l'intégrité
*/

-- Créer un type enum pour les villes suisses
CREATE TYPE swiss_city AS ENUM (
  'Zürich', 'Genève', 'Basel', 'Lausanne', 'Bern', 'Winterthur', 'Lucerne',
  'St. Gallen', 'Lugano', 'Biel/Bienne', 'Thun', 'Bellinzona', 'Fribourg',
  'Schaffhausen', 'Chur', 'Sion', 'Neuchâtel', 'Uster', 'Zug', 'Yverdon',
  'Montreux', 'Rapperswil', 'Davos', 'Aarau', 'Vevey'
);

-- Mettre à jour la table cars
DO $$ 
BEGIN
  -- Ajouter la colonne city si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'city') THEN
    ALTER TABLE cars ADD COLUMN city text;
  END IF;

  -- Mettre à jour les valeurs NULL existantes avec une valeur par défaut
  UPDATE cars SET city = 'Zürich' WHERE city IS NULL;

  -- Convertir la colonne en type enum
  ALTER TABLE cars 
    ALTER COLUMN city TYPE swiss_city USING city::swiss_city,
    ALTER COLUMN city SET NOT NULL;
END $$;

-- Créer un index pour optimiser les recherches par ville
CREATE INDEX IF NOT EXISTS cars_city_idx ON cars (city);

-- Fonction de validation des villes
CREATE OR REPLACE FUNCTION validate_swiss_city()
RETURNS trigger AS $$
BEGIN
  IF NEW.city IS NULL THEN
    RAISE EXCEPTION 'La ville est obligatoire';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger de validation
DROP TRIGGER IF EXISTS validate_swiss_city_trigger ON cars;
CREATE TRIGGER validate_swiss_city_trigger
  BEFORE INSERT OR UPDATE ON cars
  FOR EACH ROW
  EXECUTE FUNCTION validate_swiss_city();