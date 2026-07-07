import { Resend } from 'resend'

/**
 * Envía el mail automático a Servicio Social cuando se activa el protocolo de faltas.
 *
 * IMPORTANTE (producción): Resend está pensado para ejecutarse en el backend.
 * Llamarlo desde el navegador expone la API key y puede ser bloqueado por CORS.
 * Para producción se recomienda mover este envío a una Supabase Edge Function
 * (o serverless) y llamar esa función desde el cliente. Aquí se implementa el
 * envío directo según lo solicitado, de forma best-effort: si falla, no
 * interrumpe el flujo del protocolo de faltas.
 *
 * @param {object} params
 * @param {string} params.pacienteNombre    "Nombre Apellido" del paciente
 * @param {string} params.pacienteDni
 * @param {string} params.profesionalNombre  "Nombre Apellido" del profesional tratante
 * @param {string[]} params.fechas           fechas de las 2 sesiones faltadas (dd/mm/aaaa)
 * @param {string} params.derivanteNombre    "Dr/Lic. Nombre Apellido" del médico derivante
 * @returns {Promise<{ok: boolean, error?: any}>}
 */
export async function enviarMailServicioSocial({
  pacienteNombre,
  pacienteDni,
  profesionalNombre,
  fechas = [],
  derivanteNombre,
}) {
  const apiKey = import.meta.env.VITE_RESEND_API_KEY
  if (!apiKey) {
    console.warn('[ServicioSocial] VITE_RESEND_API_KEY no configurada: se omite el envío de mail.')
    return { ok: false, error: 'missing_api_key' }
  }

  const asunto = `Abandono de tratamiento — ${pacienteNombre}`
  const dias = fechas.filter(Boolean).join(' y ')
  const cuerpo =
    `Desde el Departamento de Gestión Hospitalaria le avisamos que el paciente ${pacienteNombre}, ` +
    `DNI ${pacienteDni}, ha faltado a las sesiones con el profesional ${profesionalNombre}, ` +
    `los días ${dias}. Solicitamos su intervención por abandono del tratamiento psicológico ` +
    `solicitado por ${derivanteNombre}.`

  try {
    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from: 'Gestión Hospitalaria <onboarding@resend.dev>',
      to: ['serviciosocialsamic@gmail.com'],
      subject: asunto,
      text: cuerpo,
    })
    if (error) {
      console.error('[ServicioSocial] Error de Resend:', error)
      return { ok: false, error }
    }
    return { ok: true }
  } catch (err) {
    console.error('[ServicioSocial] Fallo al enviar el mail:', err)
    return { ok: false, error: err }
  }
}
