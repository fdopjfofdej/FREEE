/*
  # Ajout de la colonne consommation

  1. Modifications
    - Ajout de la colonne `consommation` à la table `cars`
      - Type: numeric pour stocker des décimaux
      - Permet NULL car toutes les voitures n'auront pas cette information
*/

ALTER TABLE cars ADD COLUMN IF NOT EXISTS consommation numeric;