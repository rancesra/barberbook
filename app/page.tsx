import BarbershopPage from './barberia/[slug]/page'

export default function HomePage() {
  return BarbershopPage({ params: Promise.resolve({ slug: 'artist-studio' }) })
}
