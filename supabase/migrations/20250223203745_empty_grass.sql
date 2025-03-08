/*
  # Ajout de détails supplémentaires pour les voitures

  1. Nouveaux champs
    - type_vehicule (berline, SUV, etc.)
    - carburant
    - transmission
    - puissance
    - cylindree
    - portes
    - places
    - couleur
    - premiere_main
    - garantie
    - options (array)
*/

ALTER TABLE cars ADD COLUMN IF NOT EXISTS type_vehicule text;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS carburant text;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS transmission text;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS puissance integer;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS cylindree integer;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS portes integer;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS places integer;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS couleur text;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS premiere_main boolean DEFAULT false;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS garantie integer; -- durée en mois
ALTER TABLE cars ADD COLUMN IF NOT EXISTS options text[] DEFAULT '{}'::text[];