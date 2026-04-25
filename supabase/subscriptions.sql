-- ============================================================
-- BarberBook - Planes y Suscripciones
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- ============================================================
-- TABLA: plans (configurable desde admin)
-- ============================================================
CREATE TABLE IF NOT EXISTS plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  barbershop_id UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  subtitle VARCHAR(100),
  price DECIMAL(10, 2) NOT NULL,
  cuts_per_month INTEGER NOT NULL DEFAULT 2,
  benefits TEXT[] NOT NULL DEFAULT '{}',
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  color VARCHAR(7) DEFAULT '#C9A84C',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: subscriptions
-- ============================================================
DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM ('active', 'expired', 'pending', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  barbershop_id UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(30),
  google_user_id VARCHAR(255),
  cuts_used INTEGER DEFAULT 0,
  cuts_total INTEGER NOT NULL,
  status subscription_status DEFAULT 'pending',
  starts_at DATE,
  expires_at DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON subscriptions(customer_email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Triggers updated_at
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_plans" ON plans FOR SELECT USING (is_active = true);
CREATE POLICY "public_read_own_subscription" ON subscriptions FOR SELECT USING (true);

-- ============================================================
-- DATOS DEMO - 3 planes para Barbería Elite
-- ============================================================
INSERT INTO plans (barbershop_id, name, subtitle, price, cuts_per_month, benefits, is_popular, color, sort_order)
VALUES
  (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Clásico',
    'Para el cliente frecuente',
    20000,
    2,
    ARRAY[
      '2 cortes al mes',
      'Reserva con prioridad básica',
      'Sin tiempo de espera',
      'Válido con cualquier barbero'
    ],
    false,
    '#6B7280',
    1
  ),
  (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Premium',
    'El más solicitado',
    40000,
    4,
    ARRAY[
      '4 cortes al mes',
      'Reserva prioritaria',
      '1 arreglo de barba gratis',
      'Barbero fijo asignado',
      '10% descuento en servicios extra'
    ],
    true,
    '#C9A84C',
    2
  ),
  (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Elite',
    'Experiencia VIP completa',
    70000,
    99,
    ARRAY[
      'Cortes ilimitados',
      'Reserva inmediata sin espera',
      'Barbero exclusivo',
      'Barba incluida siempre',
      '20% descuento en servicios extra',
      'Atención fuera de horario'
    ],
    false,
    '#8B5CF6',
    3
  )
ON CONFLICT DO NOTHING;
