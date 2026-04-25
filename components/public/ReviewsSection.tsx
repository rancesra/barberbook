const REVIEWS = [
  {
    id: 1,
    name: 'Andrés M.',
    rating: 5,
    text: 'Excelente atención y muy puntuales. Reservé por el link y llegué directo al turno.',
    service: 'Degradado',
  },
  {
    id: 2,
    name: 'Ricardo V.',
    rating: 5,
    text: 'El degradado quedó perfecto. Carlos es un crack, lo recomiendo 100%.',
    service: 'Corte + Barba',
  },
  {
    id: 3,
    name: 'Santiago P.',
    rating: 5,
    text: 'Super fácil reservar por WhatsApp. En menos de 1 minuto tenía mi cita confirmada.',
    service: 'Barba',
  },
]

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={i < count ? 'text-gold' : 'text-border'}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

export function ReviewsSection() {
  return (
    <section className="px-4 py-10 max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text-primary">Lo que dicen nuestros clientes</h2>
        <div className="flex items-center gap-2 mt-2">
          <Stars count={5} />
          <span className="text-text-secondary text-sm">5.0 · Más de 200 reseñas</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {REVIEWS.map((review) => (
          <div key={review.id} className="card p-4">
            <Stars count={review.rating} />
            <p className="text-text-secondary text-sm mt-3 mb-4 italic">&ldquo;{review.text}&rdquo;</p>
            <div className="flex items-center justify-between">
              <p className="text-text-primary text-sm font-semibold">{review.name}</p>
              <span className="text-xs text-text-muted">{review.service}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
