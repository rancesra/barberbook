import { redirect } from 'next/navigation'

// Redirige al slug de la barbería demo
export default function HomePage() {
  redirect('/barberia/barberia-elite')
}
