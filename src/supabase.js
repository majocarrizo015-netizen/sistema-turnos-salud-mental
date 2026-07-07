import { createClient } from '@supabase/supabase-js'

// Run this in Supabase SQL Editor:
// create extension if not exists "uuid-ossp";
//
// create table usuarios (
//   id uuid primary key default uuid_generate_v4(),
//   dni text unique not null,
//   nombre text not null,
//   apellido text not null,
//   matricula text,
//   rol text not null check (rol in ('profesional_sm','administrativo','medico_aps')),
//   especialidad text
// );
//
// create table pacientes (
//   id uuid primary key default uuid_generate_v4(),
//   nombre text not null,
//   apellido text not null,
//   dni text unique not null,
//   fecha_nacimiento date,
//   obra_social text,
//   contacto text
// );
//
// create table solicitudes (
//   id uuid primary key default uuid_generate_v4(),
//   paciente_id uuid references pacientes(id),
//   profesional_id uuid references usuarios(id),
//   modulo int not null,
//   sesiones int,
//   frecuencia text,
//   diagnostico text,
//   prioridad text check (prioridad in ('alta','moderada','programada')),
//   estado text default 'pendiente' check (estado in ('pendiente','en_tratamiento','finalizado','baja_protocolo')),
//   psiquiatra_articulante text,
//   justificacion_ampliacion text,
//   resumen_hc text,
//   fecha_solicitud timestamptz default now()
// );
//
// create table sesiones (
//   id uuid primary key default uuid_generate_v4(),
//   solicitud_id uuid references solicitudes(id),
//   numero int,
//   fecha date,
//   hora time,
//   asistencia text default 'pendiente' check (asistencia in ('asistio','no','aviso','pendiente')),
//   justificacion text
// );
//
// create table notificaciones (
//   id uuid primary key default uuid_generate_v4(),
//   destinatario_id uuid references usuarios(id),
//   tipo text,
//   mensaje text,
//   leida boolean default false,
//   fecha timestamptz default now(),
//   solicitud_id uuid references solicitudes(id)
// );
//
// create table comentarios (
//   id uuid primary key default uuid_generate_v4(),
//   solicitud_id uuid references solicitudes(id),
//   usuario_id uuid references usuarios(id),
//   texto text not null,
//   fecha timestamptz default now()
// );
//
// alter table comentarios enable row level security;
// create policy "Allow all on comentarios"
//   on comentarios for all using (true) with check (true);
//
// -- MIGRACIÓN de prioridades (si la tabla solicitudes ya existía):
// -- alter table solicitudes drop constraint if exists solicitudes_prioridad_check;
// -- update solicitudes set prioridad = 'alta' where prioridad in ('urgente','prioritario');
// -- update solicitudes set prioridad = 'programada' where prioridad = 'programado';
// -- alter table solicitudes add constraint solicitudes_prioridad_check
// --   check (prioridad in ('alta','moderada','programada'));

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
