const GALLERY_IMAGES = [
  {
    id: 1,
    src: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&q=80',
    alt: 'Corte fade',
  },
  {
    id: 2,
    src: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&q=80',
    alt: 'Barba perfilada',
  },
  {
    id: 3,
    src: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&q=80',
    alt: 'Degradado moderno',
  },
  {
    id: 4,
    src: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&q=80',
    alt: 'Corte clásico',
  },
  {
    id: 5,
    src: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&q=80',
    alt: 'Barbería interior',
  },
  {
    id: 6,
    src: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400&q=80',
    alt: 'Estilo urbano',
  },
]

export function GallerySection() {
  return (
    <section className="px-4 py-10 max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text-primary">Nuestro trabajo</h2>
        <p className="text-text-secondary text-sm mt-1">Resultados que hablan por sí solos</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {GALLERY_IMAGES.map((img) => (
          <div
            key={img.id}
            className="aspect-square rounded-2xl overflow-hidden bg-bg-secondary"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.src}
              alt={img.alt}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </section>
  )
}
