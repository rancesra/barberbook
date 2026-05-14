'use client'
import { useEffect, useState } from 'react'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { toZonedTime, fromZonedTime } from 'date-fns-tz'
import { es } from 'date-fns/locale'
import { FileDown, Loader2, BarChart2, TrendingUp, DollarSign, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'

const TZ = 'America/Bogota'

interface MonthStat {
  label: string
  monthParam: string
  earned: number
  count: number
}

export default function ReportesPage() {
  const [stats, setStats] = useState<MonthStat[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const supabase = createClient()
    const now = toZonedTime(new Date(), TZ)

    const { data: barber } = await supabase
      .from('barbers')
      .select('id')
      .eq('is_active', true)
      .order('sort_order')
      .limit(1)
      .single()

    if (!barber) { setLoading(false); return }

    // Últimos 6 meses (sin el mes actual)
    const months: MonthStat[] = []
    for (let i = 1; i <= 6; i++) {
      const target = subMonths(now, i)
      const start = fromZonedTime(startOfMonth(target), TZ).toISOString()
      const end   = fromZonedTime(endOfMonth(target), TZ).toISOString()
      const label = format(target, 'MMMM yyyy', { locale: es })
      const monthParam = format(target, 'yyyy-MM')

      const { data } = await supabase
        .from('appointments')
        .select('service:services(price)')
        .eq('barber_id', barber.id)
        .gte('start_time', start)
        .lte('start_time', end)
        .neq('status', 'cancelled')

      const earned = (data ?? []).reduce((sum: number, row: any) => sum + (row.service?.price ?? 0), 0)
      months.push({ label, monthParam, earned, count: (data ?? []).length })
    }

    setStats(months)
    setLoading(false)
  }

  const handleDownload = async (monthParam: string, label: string) => {
    setDownloading(monthParam)
    try {
      const res = await fetch(`/api/reports/monthly?month=${monthParam}`)
      if (!res.ok) throw new Error('Error')
      const data = await res.json()

      const { default: jsPDF } = await import('jspdf')
      const { default: autoTable } = await import('jspdf-autotable')

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageW = doc.internal.pageSize.getWidth()

      // Encabezado
      doc.setFillColor(18, 18, 18)
      doc.rect(0, 0, pageW, 35, 'F')
      doc.setTextColor(201, 168, 76)
      doc.setFontSize(22)
      doc.setFont('helvetica', 'bold')
      doc.text('ARTIST STUDIO', pageW / 2, 14, { align: 'center' })
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(180, 180, 180)
      doc.text('Barbería Premium · Floridablanca', pageW / 2, 21, { align: 'center' })
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      const titleLabel = label.charAt(0).toUpperCase() + label.slice(1)
      doc.text(`Reporte mensual — ${titleLabel}`, pageW / 2, 29, { align: 'center' })

      const appts = data.appointments as {
        start_time: string
        service: { name: string; price: number } | null
        customer: { name: string; phone: string } | null
      }[]

      const total = appts.reduce((sum, a) => sum + (a.service?.price ?? 0), 0)
      const promedio = appts.length > 0 ? Math.round(total / appts.length) : 0
      const fp = (n: number) => '$' + n.toLocaleString('es-CO')

      // Contar por servicio
      const serviceCounts: Record<string, number> = {}
      appts.forEach(a => {
        const name = a.service?.name ?? 'Sin servicio'
        serviceCounts[name] = (serviceCounts[name] ?? 0) + 1
      })

      // Resumen
      doc.setTextColor(40, 40, 40)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('Resumen del mes', 14, 44)

      autoTable(doc, {
        startY: 48,
        head: [],
        body: [
          ['Total de citas', `${appts.length}`],
          ['Total ganado', fp(total)],
          ['Promedio por cita', fp(promedio)],
          ...Object.entries(serviceCounts).map(([name, count]) => [name, `${count} cita${count !== 1 ? 's' : ''}`]),
        ],
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 2 },
        columnStyles: {
          0: { textColor: [100, 100, 100], cellWidth: 70 },
          1: { textColor: [30, 30, 30], fontStyle: 'bold' },
        },
        margin: { left: 14, right: 14 },
      })

      const finalY = (doc as any).lastAutoTable?.finalY ?? 80
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(40, 40, 40)
      doc.text('Detalle de citas', 14, finalY + 10)

      const rows = appts.map(a => {
        const d = toZonedTime(new Date(a.start_time), TZ)
        return [
          format(d, 'd MMM', { locale: es }),
          format(d, 'h:mm a'),
          a.customer?.name ?? '—',
          a.customer?.phone ?? '—',
          a.service?.name ?? '—',
          a.service?.price ? fp(a.service.price) : '—',
        ]
      })

      autoTable(doc, {
        startY: finalY + 14,
        head: [['Fecha', 'Hora', 'Cliente', 'Teléfono', 'Servicio', 'Valor']],
        body: rows,
        theme: 'striped',
        headStyles: { fillColor: [201, 168, 76], textColor: [18, 18, 18], fontStyle: 'bold', fontSize: 9 },
        bodyStyles: { fontSize: 8.5, textColor: [40, 40, 40] },
        alternateRowStyles: { fillColor: [248, 248, 248] },
        columnStyles: {
          0: { cellWidth: 18 },
          1: { cellWidth: 18 },
          2: { cellWidth: 40 },
          3: { cellWidth: 32 },
          4: { cellWidth: 40 },
          5: { cellWidth: 22, halign: 'right' },
        },
        margin: { left: 14, right: 14 },
      })

      // Pie
      const pageCount = (doc as any).internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(7.5)
        doc.setTextColor(180, 180, 180)
        doc.text(
          `Generado el ${format(new Date(), "d 'de' MMMM yyyy", { locale: es })} · Artist Studio`,
          pageW / 2,
          doc.internal.pageSize.getHeight() - 6,
          { align: 'center' }
        )
      }

      doc.save(`reporte-${monthParam}.pdf`)
    } catch {
      alert('Error al generar el reporte.')
    } finally {
      setDownloading(null)
    }
  }

  if (loading) return (
    <div className="p-6">
      <div className="animate-pulse space-y-3">
        {[1,2,3].map(i => <div key={i} className="h-20 bg-bg-secondary rounded-xl" />)}
      </div>
    </div>
  )

  const totalGeneral = stats.reduce((sum, s) => sum + s.earned, 0)
  const totalCitas   = stats.reduce((sum, s) => sum + s.count, 0)
  const mejorMes     = stats.reduce((best, s) => s.earned > best.earned ? s : best, stats[0])

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Reportes</h1>
        <p className="text-text-secondary text-sm mt-1">Historial y descarga de reportes mensuales</p>
      </div>

      {/* Resumen general */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={14} className="text-gold" />
            <p className="text-text-muted text-xs">Últimos 6 meses</p>
          </div>
          <p className="text-xl font-bold text-text-primary">{formatPrice(totalGeneral)}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={14} className="text-gold" />
            <p className="text-text-muted text-xs">Total citas</p>
          </div>
          <p className="text-xl font-bold text-text-primary">{totalCitas}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-gold" />
            <p className="text-text-muted text-xs">Mejor mes</p>
          </div>
          <p className="text-sm font-bold text-text-primary capitalize">{mejorMes?.label.split(' ')[0] ?? '—'}</p>
          <p className="text-xs text-gold font-semibold">{mejorMes ? formatPrice(mejorMes.earned) : '—'}</p>
        </div>
      </div>

      {/* Lista de meses */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">Meses anteriores</p>
        {stats.map((s) => (
          <div key={s.monthParam} className="card p-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-text-primary capitalize">{s.label}</p>
              <p className="text-text-muted text-xs mt-0.5">
                {s.count} cita{s.count !== 1 ? 's' : ''} · {formatPrice(s.earned)}
              </p>
            </div>
            <button
              onClick={() => handleDownload(s.monthParam, s.label)}
              disabled={downloading === s.monthParam}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold/10 border border-gold/30 text-gold text-sm font-semibold hover:bg-gold/20 transition-all disabled:opacity-50"
            >
              {downloading === s.monthParam
                ? <Loader2 size={14} className="animate-spin" />
                : <FileDown size={14} />
              }
              PDF
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
