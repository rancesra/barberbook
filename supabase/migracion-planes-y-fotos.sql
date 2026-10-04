-- ============================================================
-- Migración: planes editables y fotos de barberos
-- Ejecutar una vez en el SQL Editor de Supabase
-- ============================================================

-- Etiqueta del plan destacado ("Más popular", "Especial", "Oferta"...).
-- Vacía = "Más popular".
ALTER TABLE plans ADD COLUMN IF NOT EXISTS badge_text VARCHAR(30);

-- Las fotos de los barberos se muestran con su URL pública; con el bucket
-- privado esa URL da error y la foto sale rota.
UPDATE storage.buckets SET public = true WHERE id = 'barbers';
