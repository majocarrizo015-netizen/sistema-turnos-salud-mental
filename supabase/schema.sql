-- =====================================================================
--  Sistema de Turnos - Salud Mental - Hospital SAMIC El Calafate
--  Script de base de datos (Supabase / PostgreSQL)
--
--  SEGURO de correr sobre una base existente:
--  - Usa "if not exists": no pisa tablas ni borra datos.
--  - Crea la tabla nueva "comentarios".
--  - Migra las prioridades viejas (urgente/prioritario/programado)
--    a las nuevas (alta/moderada/programada).
--  - Deja políticas de acceso (RLS) permisivas: el control por rol lo
--    hace la app (login propio contra la tabla usuarios, sin Supabase Auth).
--
--  Cómo usarlo: Supabase → SQL Editor → pegar todo → Run.
--  Se puede correr más de una vez sin problema (es idempotente).
-- =====================================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------
-- Tablas (no se tocan si ya existen)
-- ---------------------------------------------------------------------
create table if not exists usuarios (
  id uuid primary key default uuid_generate_v4(),
  dni text unique not null,
  nombre text not null,
  apellido text not null,
  matricula text,
  rol text not null check (rol in ('profesional_sm','administrativo','medico_aps')),
  especialidad text
);

create table if not exists pacientes (
  id uuid primary key default uuid_generate_v4(),
  nombre text not null,
  apellido text not null,
  dni text unique not null,
  fecha_nacimiento date,
  obra_social text,
  contacto text
);

create table if not exists solicitudes (
  id uuid primary key default uuid_generate_v4(),
  paciente_id uuid references pacientes(id),
  profesional_id uuid references usuarios(id),
  modulo int not null,
  sesiones int,
  frecuencia text,
  diagnostico text,
  prioridad text,
  estado text default 'pendiente' check (estado in ('pendiente','en_tratamiento','finalizado','baja_protocolo')),
  psiquiatra_articulante text,
  justificacion_ampliacion text,
  resumen_hc text,
  fecha_solicitud timestamptz default now()
);

create table if not exists sesiones (
  id uuid primary key default uuid_generate_v4(),
  solicitud_id uuid references solicitudes(id),
  numero int,
  fecha date,
  hora time,
  asistencia text default 'pendiente' check (asistencia in ('asistio','no','aviso','pendiente')),
  justificacion text
);

create table if not exists notificaciones (
  id uuid primary key default uuid_generate_v4(),
  destinatario_id uuid references usuarios(id),
  tipo text,
  mensaje text,
  leida boolean default false,
  fecha timestamptz default now(),
  solicitud_id uuid references solicitudes(id)
);

-- Tabla NUEVA: comentarios (registro permanente en la ficha del paciente)
create table if not exists comentarios (
  id uuid primary key default uuid_generate_v4(),
  solicitud_id uuid references solicitudes(id),
  usuario_id uuid references usuarios(id),
  texto text not null,
  fecha timestamptz default now()
);

-- ---------------------------------------------------------------------
-- Migración de prioridades  (urgente/prioritario → alta ; programado → programada)
-- ---------------------------------------------------------------------
alter table solicitudes drop constraint if exists solicitudes_prioridad_check;

update solicitudes set prioridad = 'alta'       where prioridad in ('urgente','prioritario');
update solicitudes set prioridad = 'programada' where prioridad = 'programado';

alter table solicitudes
  add constraint solicitudes_prioridad_check
  check (prioridad in ('alta','moderada','programada'));

-- ---------------------------------------------------------------------
-- RLS + políticas permisivas (acceso vía anon key; la app controla por rol)
-- ---------------------------------------------------------------------
alter table usuarios       enable row level security;
alter table pacientes      enable row level security;
alter table solicitudes    enable row level security;
alter table sesiones       enable row level security;
alter table notificaciones enable row level security;
alter table comentarios    enable row level security;

drop policy if exists "Allow all on usuarios"       on usuarios;
drop policy if exists "Allow all on pacientes"      on pacientes;
drop policy if exists "Allow all on solicitudes"    on solicitudes;
drop policy if exists "Allow all on sesiones"       on sesiones;
drop policy if exists "Allow all on notificaciones" on notificaciones;
drop policy if exists "Allow all on comentarios"    on comentarios;

create policy "Allow all on usuarios"       on usuarios       for all using (true) with check (true);
create policy "Allow all on pacientes"      on pacientes      for all using (true) with check (true);
create policy "Allow all on solicitudes"    on solicitudes    for all using (true) with check (true);
create policy "Allow all on sesiones"       on sesiones       for all using (true) with check (true);
create policy "Allow all on notificaciones" on notificaciones for all using (true) with check (true);
create policy "Allow all on comentarios"    on comentarios    for all using (true) with check (true);
