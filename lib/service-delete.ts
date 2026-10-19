/** Qué dice la hoja antes de borrar un servicio: con citas se oculta, sin citas se borra. */
export function deleteSheetFor(service: { name: string; appointments: number }) {
  if (service.appointments > 0) {
    const citas = service.appointments === 1 ? '1 cita' : `${service.appointments.toLocaleString('es-CO')} citas`
    return {
      title: `¿Ocultar "${service.name}"?`,
      message: `Tiene ${citas} en el historial, así que no se borra: se quita de la página para que nadie más lo agende. Las citas pasadas y los ingresos quedan intactos, y lo puedes volver a mostrar cuando quieras.`,
      confirmLabel: 'Ocultar servicio',
      destructive: true,
    }
  }
  return {
    title: `¿Eliminar "${service.name}"?`,
    message: 'No tiene ninguna cita, así que se borra para siempre.',
    confirmLabel: 'Eliminar servicio',
    destructive: true,
  }
}
