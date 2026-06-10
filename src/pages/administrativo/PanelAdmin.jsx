import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase'
import { useAuth } from '../../context/AuthContext'
import TopBar from '../../components/TopBar'
import BadgePrioridad from '../../components/BadgePrioridad'
import ProgressBar from '../../components/ProgressBar'

export default function PanelAdmin() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [solicitudes, setSolicitudes] = useState([])
  const [sesionesCount, setSesionesCount] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const { data } = await supabase
      .from('solicitudes')
      .select('*, pacientes(*), usuarios(nombre, apellido, matricula, especialidad)')
      .in('estado', ['pendiente', 'en_tratamiento'])
      .order('fecha_solicitud', { ascending: false })

    if (data) {
      setSolicitudes(data)
      const ids = data.filter(s => s.estado === 'en_tratamiento').map(s => s.id)
      if (ids.length > 0) {
        const { data: sesData } = await supabase
          .from('sesiones')
          .select('solicitud_id, asistencia')
          .in('solicitud_id', ids)
        if (sesData) {
          const counts = {}
          sesData.forEach(s => {
            if (!counts[s.solicitud_id]) counts[s.solicitud_id] = { asistio: 0, total: 0 }
            counts[s.solicitud_id].total++
            if (s.asistencia === 'asistio') counts[s.solicitud_id].asistio++
          })
          setSesionesCount(counts)
        }
      }
    }
    setLoading(false)
  }

  const filterFn = (list) => {
    if (!search) return list
    const q = search.toLowerCase()
    return list.filter(s =>
      s.pacientes?.nombre?.toLowerCase().includes(q) ||
      s.pacientes?.apellido?.toLowerCase().includes(q) ||
      s.pacientes?.dni?.includes(q) ||
      s.usuarios?.nombre?.toLowerCase().includes(q) ||
      s.usuarios?.apellido?.toLowerCase().includes(q)
    )
  }

  const pendientes = filterFn(solicitudes.filter(s => s.estado === 'pendiente'))
  const enTratamiento = filterFn(solicitudes.filter(s => s.estado === 'en_tratamiento'))
  const ampliaciones = filterFn(solicitudes.filter(s => s.justificacion_ampliacion && s.estado === 'en_tratamiento'))

  return (
    <div className="min-h-screen bg-page-bg">
      <TopBar
        title="Panel Administrativo"
        subtitle={`${user.nombre} ${user.apellido}`}
        rol="administrativo"
      />

      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="relative mb-5">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar paciente o profesional..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-border bg-white text-sm text-text-primary outline-none focus:border-administrativo-primary"
          />
        </div>

        {loading ? (
          <div className="text-center py-10 text-text-secondary text-sm">Cargando...</div>
        ) : (
          <>
            <Section title={`Nuevas Solicitudes (${pendientes.length})`}>
              {pendientes.length === 0 ? (
                <EmptyState text="No hay nuevas solicitudes" />
              ) : pendientes.map(s => (
                <SolicitudCard
                  key={s.id}
                  s={s}
                  onClick={() => navigate(`/admin/calendarizacion/${s.id}`)}
                  label="Calendarizar"
                  color="#0F6E56"
                />
              ))}
            </Section>

            <Section title={`Pacientes en Tratamiento (${enTratamiento.length})`}>
              {enTratamiento.length === 0 ? (
                <EmptyState text="No hay pacientes en tratamiento" />
              ) : enTratamiento.map(s => {
                const counts = sesionesCount[s.id] || { asistio: 0, total: s.sesiones || 0 }
                return (
                  <div
                    key={s.id}
                    onClick={() => navigate(`/admin/asistencia/${s.id}`)}
                    className="bg-white rounded-lg border border-border p-4 cursor-pointer hover:border-administrativo-primary transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0">
                        <p className="font-medium text-text-primary text-sm">{s.pacientes?.apellido}, {s.pacientes?.nombre}</p>
                        <p className="text-xs text-text-secondary">DNI: {s.pacientes?.dni} · Módulo {s.modulo}</p>
                        <p className="text-xs text-text-secondary">{s.usuarios?.nombre} {s.usuarios?.apellido}</p>
                      </div>
                      <BadgePrioridad prioridad={s.prioridad} />
                    </div>
                    <ProgressBar completed={counts.asistio} total={counts.total} color="#0F6E56" />
                  </div>
                )
              })}
            </Section>

            {ampliaciones.length > 0 && (
              <Section title={`Ampliaciones Pendientes (${ampliaciones.length})`}>
                {ampliaciones.map(s => (
                  <SolicitudCard
                    key={s.id}
                    s={s}
                    onClick={() => navigate(`/admin/agregar-sesiones/${s.id}`)}
                    label="Gestionar"
                    color="#0F6E56"
                    subtitle={`Módulo ${s.modulo} · ${s.usuarios?.nombre} ${s.usuarios?.apellido}`}
                  />
                ))}
              </Section>
            )}

            <button
              onClick={() => navigate('/admin/historial')}
              className="w-full py-3 rounded-lg border border-border bg-white text-sm text-text-secondary flex items-center justify-center gap-2 hover:border-administrativo-primary transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ver Historial
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section className="mb-6">
      <h2 className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  )
}

function EmptyState({ text }) {
  return <div className="bg-white rounded-lg border border-border p-4 text-sm text-text-secondary text-center">{text}</div>
}

function SolicitudCard({ s, onClick, label, color, subtitle }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-border p-4 cursor-pointer hover:shadow-sm transition-shadow"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-text-primary text-sm">{s.pacientes?.apellido}, {s.pacientes?.nombre}</p>
          <p className="text-xs text-text-secondary">{subtitle || `DNI: ${s.pacientes?.dni} · Módulo ${s.modulo}`}</p>
          <p className="text-xs text-text-secondary">{new Date(s.fecha_solicitud).toLocaleDateString('es-AR')}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <BadgePrioridad prioridad={s.prioridad} />
          <span className="text-xs font-medium px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: color }}>{label}</span>
        </div>
      </div>
    </div>
  )
}
