-- Ajouter la colonne details à la table car_reports si elle n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'car_reports' AND column_name = 'details'
  ) THEN
    ALTER TABLE car_reports ADD COLUMN details text;
  END IF;
END $$;

-- Mettre à jour la fonction report_car pour gérer correctement la colonne details
CREATE OR REPLACE FUNCTION report_car(
  p_car_id uuid,
  p_reason text,
  p_details text DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
  report_id uuid;
BEGIN
  -- Vérifier que l'utilisateur est authentifié
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Vous devez être connecté pour signaler une annonce';
  END IF;

  -- Vérifier que la voiture existe
  IF NOT EXISTS (SELECT 1 FROM cars WHERE id = p_car_id) THEN
    RAISE EXCEPTION 'Cette annonce n''existe pas';
  END IF;

  -- Vérifier que l'utilisateur n'a pas déjà signalé cette annonce
  IF EXISTS (
    SELECT 1 FROM car_reports 
    WHERE car_id = p_car_id AND reporter_id = auth.uid() AND status = 'pending'
  ) THEN
    RAISE EXCEPTION 'Vous avez déjà signalé cette annonce';
  END IF;

  -- Créer le signalement
  INSERT INTO car_reports (car_id, reporter_id, reason, details)
  VALUES (p_car_id, auth.uid(), p_reason, p_details)
  RETURNING id INTO report_id;

  RETURN report_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;