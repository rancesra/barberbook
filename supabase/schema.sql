-- ============================================================
-- BarberBook - Esquema de base de datos para Supabase
-- Ejecutar completo en el SQL Editor de Supabase
-- ============================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- ============================================================
-- TABLA: barbershops
-- ============================================================
CREATE TABLE IF NOT EXISTS barbershops (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  whatsapp VARCHAR(30),
  instagram VARCHAR(100),
  address TEXT,
  google_maps_url TEXT,
  timezone VARCHAR(50) DEFAULT 'America/Bogota',
  primary_color VARCHAR(7) DEFAULT '#0E0E0E',
  accent_color VARCHAR(7) DEFAULT '#C9A84C',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: barbers
-- ============================================================
CREATE TABLE IF NOT EXISTS barbers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  barbershop_id UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  photo_url TEXT,
  specialty VARCHAR(255),
  description TEXT,
  phone VARCHAR(30),
  calendar_id VARCHAR(255),
  google_refresh_token TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(barbershop_id, slug)
);

-- ============================================================
-- TABLA: services
-- ============================================================
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  barbershop_id UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  price DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: customers
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- ============================================================
-- TABLA: appointments
-- ============================================================
DO $$ BEGIN
  CREATE TYPE appointment_status AS ENUM (
    'confirmed', 'cancelled', 'completed', 'no_show', 'sync_pending'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  barbershop_id UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  barber_id UUID NOT NULL REFERENCES barbers(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status appointment_status DEFAULT 'confirmed',
  notes TEXT,
  google_calendar_event_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT no_overlap EXCLUDE USING gist (
    barber_id WITH =,
    tstzrange(start_time, end_time, '[)') WITH &&
  ) WHERE (status NOT IN ('cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_appointments_barber_date ON appointments(barber_id, start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_barbershop_date ON appointments(barbershop_id, start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- ============================================================
-- TABLA: barber_working_hours
-- ============================================================
CREATE TABLE IF NOT EXISTS barber_working_hours (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  barber_id UUID NOT NULL REFERENCES barbers(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(barber_id, day_of_week)
);

-- ============================================================
-- TABLA: barber_breaks
-- ============================================================
CREATE TABLE IF NOT EXISTS barber_breaks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  barber_id UUID NOT NULL REFERENCES barbers(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- ============================================================
-- TABLA: blocked_dates
-- ============================================================
CREATE TABLE IF NOT EXISTS blocked_dates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  barber_id UUID REFERENCES barbers(id) ON DELETE CASCADE,
  barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  reason VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT barber_or_barbershop CHECK (barber_id IS NOT NULL OR barbershop_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_blocked_dates_barber ON blocked_dates(barber_id, date);

-- ============================================================
-- FUNCIÓN Y TRIGGERS: updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_barbershops_updated_at BEFORE UPDATE ON barbershops FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_barbers_updated_at BEFORE UPDATE ON barbers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE barbershops ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE barber_working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE barber_breaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_barbershops" ON barbershops FOR SELECT USING (is_active = true);
CREATE POLICY "public_read_barbers" ON barbers FOR SELECT USING (is_active = true);
CREATE POLICY "public_read_services" ON services FOR SELECT USING (is_active = true);
CREATE POLICY "public_read_working_hours" ON barber_working_hours FOR SELECT USING (true);
CREATE POLICY "public_read_breaks" ON barber_breaks FOR SELECT USING (true);
CREATE POLICY "public_read_blocked_dates" ON blocked_dates FOR SELECT USING (true);
CREATE POLICY "public_insert_customers" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "public_insert_appointments" ON appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "public_read_appointments" ON appointments FOR SELECT USING (true);

-- ============================================================
-- DATOS DEMO
-- ============================================================

INSERT INTO barbershops (id, name, slug, description, whatsapp, instagram, address, google_maps_url, timezone)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Barbería Elite',
  'barberia-elite',
  'Cortes modernos, barba y estilo urbano. Reserva tu cita en segundos.',
  '+573001234567',
  '@barberia_elite',
  'Calle Principal #123, Centro',
  'https://maps.google.com/?q=Calle+Principal+123',
  'America/Bogota'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO barbers (id, barbershop_id, name, slug, specialty, description, sort_order)
VALUES
  ('b1111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Carlos Mendoza',  'carlos-mendoza', 'Degradados y barba',       'Especialista en cortes modernos y fades limpios. Más de 8 años de experiencia.', 1),
  ('b2222222-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Miguel Santos',   'miguel-santos',  'Corte clásico y barba',    'Experto en estilos clásicos y perfilado profesional. Atención de primera.',      2),
  ('b3333333-3333-3333-3333-333333333333', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Luis Ramírez',    'luis-ramirez',   'Diseños y cortes urbanos', 'Ideal para estilos creativos y personalizados. Especialista en diseños.',        3)
ON CONFLICT (barbershop_id, slug) DO NOTHING;

INSERT INTO services (barbershop_id, name, description, duration_minutes, price, sort_order)
VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Corte clásico',   'Corte limpio y preciso con tijera o máquina.',        60, 10.00, 1),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Degradado (Fade)', 'Degradado profesional en todos los estilos.',        60, 12.00, 2),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Corte + Barba',   'Combo completo: corte y perfilado de barba.',         90, 15.00, 3),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Barba',           'Perfilado, arreglo y diseño de barba profesional.',   30,  7.00, 4),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Diseño',          'Cortes creativos con diseños personalizados.',        60, 12.00, 5),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Corte infantil',  'Cortes para niños hasta 12 años.',                    45,  8.00, 6);

-- Horarios Carlos (Lunes a Sábado activo, Domingo cerrado)
INSERT INTO barber_working_hours (barber_id, day_of_week, start_time, end_time, is_active) VALUES
  ('b1111111-1111-1111-1111-111111111111', 0, '08:30', '19:30', false),
  ('b1111111-1111-1111-1111-111111111111', 1, '08:30', '19:30', true),
  ('b1111111-1111-1111-1111-111111111111', 2, '08:30', '19:30', true),
  ('b1111111-1111-1111-1111-111111111111', 3, '08:30', '19:30', true),
  ('b1111111-1111-1111-1111-111111111111', 4, '08:30', '19:30', true),
  ('b1111111-1111-1111-1111-111111111111', 5, '08:30', '19:30', true),
  ('b1111111-1111-1111-1111-111111111111', 6, '08:30', '19:30', true)
ON CONFLICT (barber_id, day_of_week) DO NOTHING;

-- Horarios Miguel
INSERT INTO barber_working_hours (barber_id, day_of_week, start_time, end_time, is_active) VALUES
  ('b2222222-2222-2222-2222-222222222222', 0, '08:30', '19:30', false),
  ('b2222222-2222-2222-2222-222222222222', 1, '08:30', '19:30', true),
  ('b2222222-2222-2222-2222-222222222222', 2, '08:30', '19:30', true),
  ('b2222222-2222-2222-2222-222222222222', 3, '08:30', '19:30', true),
  ('b2222222-2222-2222-2222-222222222222', 4, '08:30', '19:30', true),
  ('b2222222-2222-2222-2222-222222222222', 5, '08:30', '19:30', true),
  ('b2222222-2222-2222-2222-222222222222', 6, '08:30', '19:30', true)
ON CONFLICT (barber_id, day_of_week) DO NOTHING;

-- Horarios Luis
INSERT INTO barber_working_hours (barber_id, day_of_week, start_time, end_time, is_active) VALUES
  ('b3333333-3333-3333-3333-333333333333', 0, '08:30', '19:30', false),
  ('b3333333-3333-3333-3333-333333333333', 1, '08:30', '19:30', true),
  ('b3333333-3333-3333-3333-333333333333', 2, '08:30', '19:30', true),
  ('b3333333-3333-3333-3333-333333333333', 3, '08:30', '19:30', true),
  ('b3333333-3333-3333-3333-333333333333', 4, '08:30', '19:30', true),
  ('b3333333-3333-3333-3333-333333333333', 5, '08:30', '19:30', true),
  ('b3333333-3333-3333-3333-333333333333', 6, '08:30', '19:30', true)
ON CONFLICT (barber_id, day_of_week) DO NOTHING;
