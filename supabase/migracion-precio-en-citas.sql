-- ============================================================
-- Migración: precio guardado en cada cita
-- Ejecutar UNA vez en el SQL Editor de Supabase, ANTES de subir el código.
--
-- Los ingresos se calculaban con el precio actual del servicio, así que
-- cambiar un precio cambiaba los ingresos de todas las citas pasadas.
-- Ahora cada cita guarda lo que valía el día que se agendó.
-- ============================================================

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2);

-- Citas que ya existían: el precio de su servicio. Es el precio exacto,
-- porque ningún precio ha cambiado desde antes de la primera cita.
UPDATE appointments a
SET price = s.price
FROM services s
WHERE a.service_id = s.id
  AND a.price IS NULL;
