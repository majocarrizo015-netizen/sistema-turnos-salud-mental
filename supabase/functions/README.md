# Supabase Edge Functions

## enviar-mail-servicio-social

Envía el mail automático a Servicio Social (serviciosocialsamic@gmail.com)
cuando el administrativo activa el protocolo de faltas. Corre server-side, así
la API key de Resend nunca se expone en el cliente.

### Requisitos
- [Supabase CLI](https://supabase.com/docs/guides/cli) instalado y logueado.
- Cuenta en [resend.com](https://resend.com) con una API key.

### Deploy
```bash
# 1. Vincular el proyecto (una sola vez)
supabase link --project-ref <TU_PROJECT_REF>

# 2. Cargar el secreto con la API key de Resend
supabase secrets set RESEND_API_KEY=re_xxxxxxxx

# 3. Desplegar la función
supabase functions deploy enviar-mail-servicio-social
```

### Notas de producción
- En `index.ts`, cambiar el remitente `onboarding@resend.dev` por una dirección
  de un dominio verificado en Resend para evitar que el mail caiga en spam.
- El cliente la invoca con `supabase.functions.invoke('enviar-mail-servicio-social', { body })`
  desde `src/lib/enviarMailServicioSocial.js`.
