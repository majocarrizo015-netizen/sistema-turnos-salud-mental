// Supabase Edge Function: enviar-mail-servicio-social
//
// Envía el mail automático a Servicio Social cuando el admin activa el
// protocolo de faltas. La API key de Resend vive como SECRETO del proyecto
// (RESEND_API_KEY), nunca en el cliente.
//
// Deploy:
//   supabase functions deploy enviar-mail-servicio-social
//   supabase secrets set RESEND_API_KEY=re_xxxxxxxx
//
// El cliente la invoca con supabase.functions.invoke('enviar-mail-servicio-social', { body })

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Destinatario fijo de Servicio Social
const DESTINATARIO = 'serviciosocialsamic@gmail.com'
// Remitente: usar un dominio verificado en Resend en producción.
const REMITENTE = 'Gestión Hospitalaria <onboarding@resend.dev>'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('RESEND_API_KEY')
    if (!apiKey) {
      return json({ ok: false, error: 'missing_api_key' }, 500)
    }

    const {
      pacienteNombre,
      pacienteDni,
      profesionalNombre,
      fechas = [],
      derivanteNombre,
    } = await req.json()

    const asunto = `Abandono de tratamiento — ${pacienteNombre}`
    const dias = (Array.isArray(fechas) ? fechas : []).filter(Boolean).join(' y ')
    const cuerpo =
      `Desde el Departamento de Gestión Hospitalaria le avisamos que el paciente ${pacienteNombre}, ` +
      `DNI ${pacienteDni}, ha faltado a las sesiones con el profesional ${profesionalNombre}, ` +
      `los días ${dias}. Solicitamos su intervención por abandono del tratamiento psicológico ` +
      `solicitado por ${derivanteNombre}.`

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: REMITENTE,
        to: [DESTINATARIO],
        subject: asunto,
        text: cuerpo,
      }),
    })

    const data = await resp.json()
    if (!resp.ok) {
      return json({ ok: false, error: data }, 502)
    }
    return json({ ok: true, id: data?.id })
  } catch (err) {
    return json({ ok: false, error: String(err) }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
