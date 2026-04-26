/** @type {import('next').NextConfig} */
const SLUG = 'artist-studio'

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  async rewrites() {
    return [
      { source: '/agendar',           destination: `/barberia/${SLUG}/agendar` },
      { source: '/mi-suscripcion',    destination: `/barberia/${SLUG}/mi-suscripcion` },
    ]
  },
}

export default nextConfig
