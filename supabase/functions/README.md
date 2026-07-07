# Supabase Edge Functions

## enviar-mail-servicio-social

Envía el mail automático a Servicio Social (serviciosocialsamic@gmail.com)
cuando el administrativo activa el protocolo de faltas. Corre server-side vía
**SMTP de Gmail**, así el remitente es una cuenta @gmail.com real y las
credenciales nunca se exponen en el cliente.

### Requisitos
- [Supabase CLI](https://supabase.com/docs/guides/cli) instalado y logueado.
- La cuenta de Gmail remitente: `gestionhospitalariasamic@gmail.com`.
- **Verificación en 2 pasos** activada en esa cuenta.
- Una **Contraseña de aplicación** (App Password) de 16 dígitos:
  Cuenta de Google → Seguridad → Verificación en 2 pasos → Contraseñas de
  aplicaciones → generar una nueva.

### Deploy
```bash
# 1. Vincular el proyecto (una sola vez)
supabase link --project-ref <TU_PROJECT_REF>

# 2. Cargar las credenciales de Gmail como secretos
supabase secrets set GMAIL_USER=gestionhospitalariasamic@gmail.com
supabase secrets set GMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx   # App Password, sin espacios

# 3. Desplegar la función
supabase functions deploy enviar-mail-servicio-social
```

### Notas
- El remitente es `Gestión Hospitalaria <GMAIL_USER>`. El destinatario es fijo:
  `serviciosocialsamic@gmail.com`.
- Límite de Gmail: ~500 mails/día, más que suficiente para este caso.
- El cliente la invoca con `supabase.functions.invoke('enviar-mail-servicio-social', { body })`
  desde `src/lib/enviarMailServicioSocial.js`.
