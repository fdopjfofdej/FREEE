/*
  # Configuration du stockage pour les images de voitures

  1. Création du bucket
    - Création du bucket 'car-images' pour stocker les images des voitures
  
  2. Politiques de sécurité
    - Lecture publique des images
    - Upload restreint aux utilisateurs authentifiés
    - Suppression restreinte aux propriétaires des images
*/

-- Création du bucket pour les images
INSERT INTO storage.buckets (id, name, public)
VALUES ('car-images', 'car-images', true);

-- Politique de lecture publique
CREATE POLICY "Images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'car-images');

-- Politique d'upload pour les utilisateurs authentifiés
CREATE POLICY "Users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'car-images'
  AND auth.role() = 'authenticated'
);

-- Politique de suppression pour les propriétaires
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'car-images'
  AND owner = auth.uid()
);