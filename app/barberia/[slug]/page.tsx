import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PublicHeader } from '@/components/public/PublicHeader'
import { HeroSection } from '@/components/public/HeroSection'
import { BarberCard } from '@/components/public/BarberCard'
import { ServicesSection } from '@/components/public/ServicesSection'
import { PlansSection } from '@/components/public/PlansSection'
import { GallerySection } from '@/components/public/GallerySection'
import { ReviewsSection } from '@/components/public/ReviewsSection'
import { LocationSection } from '@/components/public/LocationSection'
import { PublicFooter } from '@/components/public/PublicFooter'
import { calculateAvailability } from '@/lib/availability'
import type { Barber, DayAvailability } from '@/types'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('barbershops')
    .select('name, description')
    .eq('slug', slug)
    .single()
  if (!data) return { title: 'Barbería' }
  return {
    title: `${data.name} — Reserva tu cita`,
    description: data.description ?? undefined,
  }
}

export default async function BarbershopPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: barbershop } = await supabase
    .from('barbershops')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!barbershop) notFound()

  const [barbersRes, servicesRes, plansRes] = await Promise.all([
    supabase.from('barbers').select('*').eq('barbershop_id', barbershop.id).eq('is_active', true).order('sort_order'),
    supabase.from('services').select('*').eq('barbershop_id', barbershop.id).eq('is_active', true).order('sort_order'),
    supabase.from('plans').select('*').eq('barbershop_id', barbershop.id).eq('is_active', true).order('sort_order'),
  ])

  const barbers: Barber[] = barbersRes.data ?? []
  const services = servicesRes.data ?? []
  const plans = plansRes.data ?? []
  const firstService = services[0]

  const availabilityMap: Record<string, DayAvailability[]> = {}

  if (firstService) {
    await Promise.all(
      barbers.map(async (barber) => {
        const [whRes, brRes, apptRes, blkRes] = await Promise.all([
          supabase.from('barber_working_hours').select('*').eq('barber_id', barber.id),
          supabase.from('barber_breaks').select('*').eq('barber_id', barber.id).eq('is_active', true),
          supabase.from('appointments').select('*').eq('barber_id', barber.id).neq('status', 'cancelled').gte('start_time', new Date().toISOString()),
          supabase.from('blocked_dates').select('*').eq('barber_id', barber.id),
        ])
        availabilityMap[barber.id] = calculateAvailability({
          barberId: barber.id,
          durationMinutes: firstService.duration_minutes,
          workingHours: whRes.data ?? [],
          breaks: brRes.data ?? [],
          existingAppointments: apptRes.data ?? [],
          blockedDates: blkRes.data ?? [],
          timezone: barbershop.timezone,
        })
      })
    )
  }

  return (
    <div className="bg-bg-primary min-h-screen">
      <PublicHeader barbershop={barbershop} />
      <main>
        <HeroSection barbershop={barbershop} />

        {/* Barberos */}
        <section className="px-4 py-10 max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">Nuestros barberos</h2>
              <p className="text-text-secondary text-sm mt-1">Elige con quién quieres tu cita</p>
            </div>
            <Link href={`/barberia/${slug}/agendar`} className="text-gold text-sm font-medium hover:text-gold-light transition-colors">
              Ver todos →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {barbers.map((barber) => (
              <BarberCard
                key={barber.id}
                barber={barber}
                barbershopSlug={slug}
                availability={availabilityMap[barber.id] ?? []}
              />
            ))}
          </div>
        </section>

        <ServicesSection services={services} barbershop={barbershop} />

        {/* Planes */}
        {plans.length > 0 && (
          <div id="planes">
            <PlansSection plans={plans} barbershop={barbershop} />
          </div>
        )}

        <GallerySection />
        <ReviewsSection />
        <LocationSection barbershop={barbershop} />
      </main>
      <PublicFooter barbershop={barbershop} />
    </div>
  )
}
