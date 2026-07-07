// Supabase Edge Function: enviar-mail-servicio-social
//
// Envía el mail automático a Servicio Social cuando el admin activa el
// protocolo de faltas. Usa SMTP de Gmail, de modo que el remitente es una
// cuenta @gmail.com real. Las credenciales viven como SECRETOS del proyecto,
// nunca en el cliente.
//
// Deploy:
//   supabase functions deploy enviar-mail-servicio-social
//   supabase secrets set GMAIL_USER=tucuenta@gmail.com
//   supabase secrets set GMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx   (App Password de 16 dígitos)
//
// El cliente la invoca con supabase.functions.invoke('enviar-mail-servicio-social', { body })

import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Destinatario fijo de Servicio Social
const DESTINATARIO = 'serviciosocialsamic@gmail.com'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const gmailUser = Deno.env.get('GMAIL_USER')
    const gmailPass = Deno.env.get('GMAIL_APP_PASSWORD')
    if (!gmailUser || !gmailPass) {
      return json({ ok: false, error: 'missing_gmail_credentials' }, 500)
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

    const client = new SMTPClient({
      connection: {
        hostname: 'smtp.gmail.com',
        port: 465,
        tls: true,
        auth: { username: gmailUser, password: gmailPass },
      },
    })

    await client.send({
      from: `Gestión Hospitalaria <${gmailUser}>`,
      to: DESTINATARIO,
      subject: asunto,
      content: cuerpo,
    })
    await client.close()

    return json({ ok: true })
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
