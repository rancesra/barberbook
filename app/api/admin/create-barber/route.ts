import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { name, phone, password, specialty, description, sort_order, photoBase64 } = await req.json()

    const supabase = createAdminClient()

    // 1. Obtener barbershop_id
    const { data: barbershop } = await supabase.from('barbershops').select('id').single()
    if (!barbershop) return NextResponse.json({ error: 'Barbería no encontrada' }, { status: 400 })

    // 2. Subir foto a Supabase Storage si viene
    let photo_url: string | null = null
    if (photoBase64) {
      const base64Data = photoBase64.replace(/^data:image\/webp;base64,/, '')
      const buffer = Buffer.from(base64Data, 'base64')
      const fileName = `${Date.now()}-${name.toLowerCase().replace(/\s+/g, '-')}.webp`

      const { error: uploadError } = await supabase.storage
        .from('barbers')
        .upload(fileName, buffer, { contentType: 'image/webp', upsert: true })

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('barbers').getPublicUrl(fileName)
        photo_url = urlData.publicUrl
      }
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
