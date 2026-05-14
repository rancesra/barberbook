'use client'
import { useState } from 'react'
import { FileDown, Loader2 } from 'lucide-react'
import { format, parseISO, subMonths } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { es } from 'date-fns/locale'

const TZ = 'America/Bogota'

export function DownloadMonthlyReport() {
  const [loading, setLoading] = useState(false)

  const lastMonth = subMonths(toZonedTime(new Date(), TZ), 1)
  const monthLabel = format(lastMonth, 'MMMM yyyy', { locale: es })
  const monthParam = format(lastMonth, 'yyyy-MM')

  const handleDownload = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/reports/monthly?month=${monthParam}`)
      if (!res.ok) throw new Error('Error al obtener datos')
      const data = await res.json()

      // Importar jsPDF dinámicamente (solo cuando se necesita)
      const { default: jsPDF } = await import('jspdf')
      const { default: autoTable } = await import('jspdf-autotable')

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageW = doc.internal.pageSize.getWidth()

      // ── Encabezado ──
      doc.setFillColor(18, 18, 18)
      doc.rect(0, 0, pageW, 35, 'F')

      doc.setTextColor(201, 168, 76) // gold
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
      doc.text(`Reporte mensual — ${monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}`, pageW / 2, 29, { align: 'center' })

      // ── Resumen ──
      const appts = data.appointments as {
        start_time: string
        status: string
        service: { name: string; price: number } | null
        customer: { name: string; phone: string } | null
      }[]

      const total = appts.reduce((sum, a) => sum + (a.service?.price ?? 0), 0)
      const promedio = appts.length > 0 ? Math.round(total / appts.length) : 0

      // Contar servicios
      const serviceCounts: Record<string, number> = {}
      appts.forEach(a => {
        const name = a.service?.name ?? 'Sin servicio'
        serviceCounts[name] = (serviceCounts[name] ?? 0) + 1
      })

      doc.setTextColor(40, 40, 40)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('Resumen del mes', 14, 44)

      const formatPrice = (n: number) =>
        '$' + n.toLocaleString('es-CO', { minimumFractionDigits: 0 })

      autoTable(doc, {
        startY: 48,
        head: [],
        body: [
          ['Total de citas', `${appts.length}`],
          ['Total ganado', formatPrice(total)],
          ['Promedio por cita', formatPrice(promedio)],
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

      // ── Tabla de citas ──
      const finalY = (doc as any).lastAutoTable?.finalY ?? 80

      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(40, 40, 40)
      doc.text('Detalle de citas', 14, finalY + 10)

      const rows = appts.map(a => {
        const d = toZonedTime(parseISO(a.start_time), TZ)
        return [
          format(d, "d MMM", { locale: es }),
          format(d, 'h:mm a'),
          a.customer?.name ?? '—',
          a.customer?.phone ?? '—',
          a.service?.name ?? '—',
          a.service?.price ? formatPrice(a.service.price) : '—',
        ]
      })

      autoTable(doc, {
        startY: finalY + 14,
        head: [['Fecha', 'Hora', 'Cliente', 'Teléfono', 'Servicio', 'Valor']],
        body: rows,
        theme: 'striped',
        headStyles: {
          fillColor: [201, 168, 76],
          textColor: [18, 18, 18],
          fontStyle: 'bold',
          fontSize: 9,
        },
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

      // ── Pie de página ──
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
    } catch (e) {
      alert('Error al generar el reporte. Intenta de nuevo.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center gap-2 w-full px-4 py-3 rounded-xl border border-border bg-bg-secondary hover:border-gold/40 hover:bg-gold/5 transition-all text-sm font-medium text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading
        ? <Loader2 size={16} className="text-gold animate-spin" />
        : <FileDown size={16} className="text-gold" />
      }
      <div className="text-left">
        <p className="text-text-primary font-semibold text-sm">Descargar reporte</p>
        <p className="text-text-muted text-xs capitalize">{monthLabel}</p>
      </div>
    </button>
  )
}
