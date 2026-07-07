import { supabase } from '../supabase'

/**
 * Dispara el mail automático a Servicio Social cuando se activa el protocolo
 * de faltas. El envío real lo hace la Supabase Edge Function
 * `enviar-mail-servicio-social` (server-side, vía SMTP de Gmail), de modo que
 * las credenciales NUNCA quedan expuestas en el cliente y se evita el CORS.
 *
 * Deploy de la función y secretos (una sola vez):
 *   supabase functions deploy enviar-mail-servicio-social
 *   supabase secrets set GMAIL_USER=tucuenta@gmail.com
 *   supabase secrets set GMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx
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
