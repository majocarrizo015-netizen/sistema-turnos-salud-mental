import { supabase } from '../supabase'

/**
 * Dispara el mail automático a Servicio Social cuando se activa el protocolo
 * de faltas. El envío real lo hace la Supabase Edge Function
 * `enviar-mail-servicio-social` (server-side), de modo que la API key de Resend
 * NUNCA queda expuesta en el cliente y se evita el bloqueo por CORS.
 *
 * Deploy de la función y secreto (una sola vez):
 *   supabase functions deploy enviar-mail-servicio-social
 *   supabase secrets set RESEND_API_KEY=re_xxxxxxxx
 *
 * Es best-effort: si falla, no interrumpe el flujo del protocolo de faltas.
 *
 * @param {object} params
 * @param {string} params.pacienteNombre    "Nombre Apellido" del paciente
 * @param {string} params.pacienteDni
 * @param {string} params.profesionalNombre  "Nombre Apellido" del profesional tratante
 * @param {string[]} params.fechas           fechas de las 2 sesiones faltadas (dd/mm/aaaa)
 * @param {string} params.derivanteNombre    "Nombre Apellido" del médico derivante
 * @returns {Promise<{ok: boolean, error?: any}>}
 */
export async function enviarMailServicioSocial({
  pacienteNombre,
  pacienteDni,
  profesionalNombre,
  fechas = [],
  derivanteNombre,
}) {
  try {
    const { data, error } = await supabase.functions.invoke('enviar-mail-servicio-social', {
      body: { pacienteNombre, pacienteDni, profesionalNombre, fechas, derivanteNombre },
    })
    if (error) {
      console.error('[ServicioSocial] Error al invocar la Edge Function:', error)
      return { ok: false, error }
    }
    if (data && data.ok === false) {
      console.error('[ServicioSocial] La Edge Function reportó un error:', data.error)
      return { ok: false, error: data.error }
    }
    return { ok: true }
  } catch (err) {
    console.error('[ServicioSocial] Fallo al enviar el mail:', err)
    return { ok: false, error: err }
  }
}
