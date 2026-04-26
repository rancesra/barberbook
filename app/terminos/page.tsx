export const metadata = {
  title: 'Términos de Servicio — Barbería Artist Studio',
}

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary px-6 py-12 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Términos de Servicio</h1>
      <p className="text-text-muted text-sm mb-10">Última actualización: abril 2026</p>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">1. Aceptación de los términos</h2>
        <p className="text-text-secondary text-sm leading-relaxed">
          Al usar la plataforma de reservas de Barbería Artist Studio, aceptas estos términos de servicio.
          Si no estás de acuerdo, por favor no uses el servicio.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">2. Descripción del servicio</h2>
        <p className="text-text-secondary text-sm leading-relaxed">
          Barbería Artist Studio ofrece una plataforma de reservas en línea que permite a los clientes
          agendar citas con nuestros barberos. El servicio es gratuito para los clientes.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">3. Reservas y cancelaciones</h2>
        <p className="text-text-secondary text-sm leading-relaxed">
          Las citas reservadas a través de nuestra plataforma están sujetas a disponibilidad.
          Si necesitas cancelar o reprogramar, por favor contáctanos por WhatsApp con al menos
          2 horas de anticipación.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">4. Uso de Google Calendar</h2>
        <p className="text-text-secondary text-sm leading-relaxed">
          Si decides conectar tu Google Calendar, autorizas a la aplicación a crear eventos
          relacionados con tus citas. Puedes revocar este acceso en cualquier momento desde
          tu cuenta de Google.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">5. Responsabilidades</h2>
        <p className="text-text-secondary text-sm leading-relaxed">
          Barbería Artist Studio no se hace responsable por cancelaciones de último momento
          por causas de fuerza mayor. Nos comprometemos a notificarte por WhatsApp ante
          cualquier inconveniente con tu cita.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">6. Contacto</h2>
        <p className="text-text-secondary text-sm leading-relaxed">
          Para cualquier consulta sobre estos términos:{' '}
          <a href="mailto:ramirezrances070@gmail.com" className="text-gold underline">
            ramirezrances070@gmail.com
          </a>{' '}
          o por WhatsApp al{' '}
          <a href="https://wa.me/573156669991" target="_blank" rel="noopener noreferrer" className="text-gold underline">
            +57 315 666 9991
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
