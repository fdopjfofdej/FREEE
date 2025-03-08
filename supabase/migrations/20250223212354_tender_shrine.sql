/*
  # Ajout du support de localisation pour les annonces

  1. Modifications
    - Ajout d'une colonne `location` de type `geometry(Point, 4326)` à la table `cars`
    - Ajout d'un index spatial pour optimiser les recherches géographiques
    - Ajout d'une fonction pour calculer la distance entre deux points

  2. Notes
    - Utilisation de PostGIS pour les fonctionnalités géographiques
    - L'index spatial améliore les performances des requêtes de proximité
*/

-- Activer l'extension PostGIS si elle n'est pas déjà activée
CREATE EXTENSION IF NOT EXISTS postgis;

-- Ajouter la colonne location
ALTER TABLE cars ADD COLUMN IF NOT EXISTS location geometry(Point, 4326);

-- Créer un index spatial
CREATE INDEX IF NOT EXISTS cars_location_idx ON cars USING GIST (location);

-- Fonction pour calculer la distance en kilomètres
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 float,
  lon1 float,
  lat2 float,
  lon2 float
) RETURNS float AS $$
BEGIN
  RETURN ST_DistanceSphere(
    ST_MakePoint(lon1, lat1),
    ST_MakePoint(lon2, lat2)
  ) / 1000;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour trouver les voitures dans un rayon donné
CREATE OR REPLACE FUNCTION find_cars_in_radius(
  center_lat float,
  center_lon float,
  radius_km float
) RETURNS SETOF cars AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM cars
  WHERE ST_DWithin(
    location,
    ST_SetSRID(ST_MakePoint(center_lon, center_lat), 4326),
    radius_km * 1000
  );
END;
$$ LANGUAGE plpgsql;