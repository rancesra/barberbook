export const metadata = {
  title: 'Política de Privacidad — Barbería Artist Studio',
}

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary px-6 py-12 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Política de Privacidad</h1>
      <p className="text-text-muted text-sm mb-10">Última actualización: abril 2026</p>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">1. Información que recopilamos</h2>
        <p className="text-text-secondary text-sm leading-relaxed">
          Cuando usas nuestra aplicación para reservar una cita, podemos recopilar: nombre completo,
          número de teléfono, dirección de correo electrónico y notas opcionales que nos proporciones.
          Si inicias sesión con Google, también recopilamos tu nombre y foto de perfil pública.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">2. Cómo usamos tu información</h2>
        <p className="text-text-secondary text-sm leading-relaxed">
          Usamos tu información exclusivamente para gestionar y confirmar tus citas en Barbería Artist Studio.
          Si autorizas el acceso a Google Calendar, agregaremos tu cita como evento en tu calendario personal.
          No vendemos ni compartimos tu información con terceros.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">3. Google Calendar</h2>
        <p className="text-text-secondary text-sm leading-relaxed">
          Si decides conectar tu Google Calendar, solicitamos permiso para crear eventos de citas en tu calendario.
          Solo creamos eventos relacionados con tus reservas. Puedes revocar este permiso en cualquier momento
          desde la configuración de tu cuenta de Google en{' '}
          <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-gold underline">
            myaccount.google.com/permissions
          </a>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">4. Almacenamiento de datos</h2>
        <p className="text-text-secondary text-sm leading-relaxed">
          Tus datos se almacenan de forma segura en Supabase, un servicio de base de datos con cifrado en tránsito
          y en reposo. No conservamos datos de pago — los pagos se coordinan directamente por WhatsApp.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">5. Tus derechos</h2>
        <p className="text-text-secondary text-sm leading-relaxed">
          Tienes derecho a solicitar la eliminación de tus datos en cualquier momento. Para hacerlo,
          contáctanos por WhatsApp al{' '}
          <a href="https://wa.me/573156669991" target="_blank" rel="noopener noreferrer" className="text-gold underline">
            +57 315 666 9991
          </a>{' '}
          y procesaremos tu solicitud en un plazo de 7 días hábiles.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">6. Contacto</h2>
        <p className="text-text-secondary text-sm leading-relaxed">
          Si tienes preguntas sobre esta política de privacidad, puedes contactarnos en:{' '}
          <a href="mailto:ramirezrances070@gmail.com" className="text-gold underline">
            ramirezrances070@gmail.com
          </a>
        </p>
      </section>

      <div className="border-t border-border pt-6 mt-10">
        <p className="text-text-muted text-xs">
          © 2026 Barbería Artist Studio · Floridablanca, Colombia
        </p>
      </div>
    </div>
  )
}
