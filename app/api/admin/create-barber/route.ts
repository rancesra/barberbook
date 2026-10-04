import { createAdminClient, createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { uploadBarberPhoto } from '@/lib/barber-photo'

export async function POST(req: Request) {
  try {
    // Verificar que el usuario esté autenticado
    const authClient = await createClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { name, phone, password, specialty, description, sort_order, photoBase64 } = await req.json()

    const supabase = createAdminClient()

    // 1. Obtener barbershop_id
    const { data: barbershop } = await supabase.from('barbershops').select('id').single()
    if (!barbershop) return NextResponse.json({ error: 'Barbería no encontrada' }, { status: 400 })

    // 2. Subir foto a Supabase Storage si viene
    let photo_url: string | null = null
    if (photoBase64) {
      const upload = await uploadBarberPhoto(supabase, photoBase64, name)
      if ('error' in upload) return NextResponse.json({ error: upload.error }, { status: 400 })
      photo_url = upload.url
    }

    // 3. Crear cuenta Auth del barbero
    const email = `${phone}@barberartist.app`
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) return NextResponse.json({ error: `Error creando cuenta: ${authError.message}` }, { status: 400 })

    // 4. Crear el barbero en la tabla
    const slug = name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-')
    const { data: barber, error: barberError } = await supabase.from('barbers').insert({
      barbershop_id: barbershop.id,
      name,
      slug,
      specialty: specialty || null,
      description: description || null,
      phone,
      photo_url,
      sort_order: sort_order ?? 0,
      is_active: true,
      auth_user_id: authData.user.id,
    }).select().single()

    if (barberError) return NextResponse.json({ error: `Error creando barbero: ${barberError.message}` }, { status: 400 })

    return NextResponse.json({ success: true, barber })
  } catch (e) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
