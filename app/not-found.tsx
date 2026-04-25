import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl font-bold text-gold mb-4">404</p>
        <h1 className="text-xl font-semibold text-text-primary mb-2">Página no encontrada</h1>
        <p className="text-text-secondary mb-8">
          El link que buscas no existe o fue movido.
        </p>
        <Link
          href="/"
          className="inline-flex items-center bg-gold text-bg-primary font-semibold py-3 px-6 rounded-xl hover:bg-gold-light transition-colors"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  )
}
