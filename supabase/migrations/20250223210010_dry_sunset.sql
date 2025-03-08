/*
  # Ajout de l'expertise

  1. Changements
    - Ajout de la colonne `expertisee` (boolean) à la table `cars`
    - Modification de la colonne `garantie` en boolean
*/

ALTER TABLE cars ADD COLUMN IF NOT EXISTS expertisee boolean DEFAULT false;
ALTER TABLE cars ALTER COLUMN garantie TYPE boolean USING CASE WHEN garantie > 0 THEN true ELSE false END;