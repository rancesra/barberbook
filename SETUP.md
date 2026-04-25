# BarberBook — Guía completa de instalación y despliegue

## Requisitos previos

- Node.js 18+ instalado
- Cuenta en [Supabase](https://supabase.com) (gratis)
- Cuenta en [Vercel](https://vercel.com) (gratis)
- Cuenta de Google para Google Calendar API (opcional pero recomendado)

---

## Paso 1 — Instalar dependencias

```bash
cd barberia
npm install
```

---

## Paso 2 — Configurar Supabase

### 2.1 Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto (guarda la contraseña de la base de datos)
3. Espera a que el proyecto inicie (1-2 minutos)

### 2.2 Ejecutar el esquema SQL

1. En el panel de Supabase, ve a **SQL Editor**
2. Abre el archivo `supabase/schema.sql` de este proyecto
3. Pega todo el contenido y haz clic en **Run**
4. Esto crea todas las tablas, políticas RLS y datos demo

### 2.3 Obtener las credenciales

1. Ve a **Settings → API**
2. Copia:
   - `URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

### 2.4 Crear usuario admin

1. En Supabase ve a **Authentication → Users**
2. Haz clic en **Add user**
3. Ingresa email y contraseña para el admin de la barbería

---

## Paso 3 — Configurar Google Calendar API (opcional)

### 3.1 Crear proyecto en Google Cloud

1. Ve a [console.cloud.google.com](https://console.cloud.google.com)
2. Crea un nuevo proyecto llamado "BarberBook"
3. Ve a **APIs & Services → Enable APIs**
4. Busca y activa: **Google Calendar API**

### 3.2 Crear credenciales OAuth 2.0

1. Ve a **APIs & Services → Credentials**
2. Haz clic en **Create Credentials → OAuth 2.0 Client IDs**
3. Tipo de aplicación: **Web application**
4. Agrega en **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/google/callback` (desarrollo)
   - `https://tu-dominio.vercel.app/api/auth/google/callback` (producción)
5. Guarda el **Client ID** y **Client Secret**

### 3.3 Obtener refresh token por barbero

Para que cada barbero pueda conectar su calendario:

1. Agrega en la columna `google_refresh_token` de la tabla `barbers` el refresh token del barbero
2. Para obtener el refresh token, implementa el flujo OAuth o usa [OAuth Playground](https://developers.google.com/oauthplayground)
   - Scope requerido: `https://www.googleapis.com/auth/calendar.events`

> **Nota**: En la primera versión, puedes omitir Google Calendar y la app funcionará perfectamente guardando solo en Supabase.

---

## Paso 4 — Variables de entorno

Copia el archivo de ejemplo:

```bash
cp .env.local.example .env.local
```

Edita `.env.local` con tus valores reales:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Paso 5 — Correr localmente

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

### URLs importantes en desarrollo:

| URL | Descripción |
|-----|-------------|
| `http://localhost:3000` | Redirige a la barbería demo |
| `http://localhost:3000/barberia/barberia-elite` | Página pública de la barbería |
| `http://localhost:3000/barberia/barberia-elite/agendar` | Flujo de reserva |
| `http://localhost:3000/admin` | Panel administrativo |
| `http://localhost:3000/admin/login` | Login admin |

---

## Paso 6 — Desplegar en Vercel

### 6.1 Conectar repositorio

1. Sube el proyecto a GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial BarberBook setup"
   git remote add origin https://github.com/tu-usuario/barberbook.git
   git push -u origin main
   ```

2. Ve a [vercel.com](https://vercel.com) y conecta el repositorio

### 6.2 Configurar variables de entorno en Vercel

En el dashboard de Vercel → **Settings → Environment Variables**, agrega todas las variables de `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI` (cambia a tu dominio de Vercel)
- `NEXT_PUBLIC_APP_URL` (cambia a tu dominio de Vercel)

### 6.3 Deploy

Vercel hace el deploy automáticamente al hacer push a `main`.

---

## Paso 7 — Personalizar la barbería demo

Para cambiar los datos de la barbería "Barbería Elite" demo:

**Opción A — SQL Editor en Supabase:**
```sql
UPDATE barbershops SET 
  name = 'Tu Barbería',
  slug = 'tu-barberia',
  whatsapp = '+57300XXXXXXX',
  address = 'Tu dirección'
WHERE slug = 'barberia-elite';
```

**Opción B — Panel admin:**
1. Ve a `/admin/configuracion`
2. Edita los campos y guarda

---

## Agregar una nueva barbería (multi-barbería)

Para agregar una segunda barbería, inserta en SQL:

```sql
INSERT INTO barbershops (name, slug, whatsapp, address, timezone)
VALUES ('Mi Segunda Barbería', 'segunda-barberia', '+57300XXXXXXX', 'Calle 2 #456', 'America/Bogota');
```

La URL pública será: `/barberia/segunda-barberia`

---

## Estructura del proyecto

```
barberia/
├── app/
│   ├── api/
│   │   ├── availability/route.ts      # GET: disponibilidad de slots
│   │   └── appointments/
│   │       ├── route.ts               # POST: crear cita
│   │       └── [id]/route.ts          # PATCH: actualizar estado
│   ├── barberia/[slug]/
│   │   ├── page.tsx                   # Página pública
│   │   ├── agendar/page.tsx           # Flujo de reserva
│   │   └── barbero/[barberSlug]/page.tsx  # Redirect por barbero
│   ├── admin/
│   │   ├── login/page.tsx
│   │   ├── page.tsx                   # Dashboard
│   │   ├── reservas/page.tsx
│   │   ├── barberos/page.tsx
│   │   ├── servicios/page.tsx
│   │   ├── horarios/page.tsx
│   │   └── configuracion/page.tsx
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── booking/                       # Flujo de reserva
│   ├── public/                        # Página pública
│   ├── admin/                         # Panel admin
│   └── ui/                            # Componentes base
├── lib/
│   ├── supabase/                      # Cliente Supabase
│   ├── availability.ts                # Lógica de disponibilidad
│   ├── google-calendar.ts             # Integración Google Calendar
│   └── utils.ts                       # Utilidades
├── types/index.ts                     # Tipos TypeScript
├── middleware.ts                      # Protección de rutas admin
└── supabase/schema.sql                # Esquema de base de datos
```

---

## Propuesta de valor

> **"Convierte tus mensajes de WhatsApp en citas confirmadas automáticamente."**

**Links útiles por barbero:**
- `https://tu-dominio.com/barberia/barberia-elite/barbero/carlos-mendoza`
- Este link puede ir en Instagram bio o enviarse por WhatsApp

---

## Soporte y personalización

Para agregar funcionalidades:
- **Fotos de barberos**: Sube las imágenes a Supabase Storage y actualiza `photo_url` en la tabla `barbers`
- **Horarios especiales**: Usa la tabla `blocked_dates` para bloquear fechas específicas
- **Descansos**: Configura en la tabla `barber_breaks`
- **Múltiples barberías**: Cada barbería tiene su propio slug y datos independientes
