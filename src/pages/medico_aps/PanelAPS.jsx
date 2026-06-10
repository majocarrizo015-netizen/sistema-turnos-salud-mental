import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase'
import { useAuth } from '../../context/AuthContext'
import TopBar from '../../components/TopBar'
import BadgePrioridad from '../../components/BadgePrioridad'
import ProgressBar from '../../components/ProgressBar'

export default function PanelAPS() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [solicitudes, setSolicitudes] = useState([])
  const [sesionesCount, setSesionesCount] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchData()
  }, [user.id])

  async function fetchData() {
    setLoading(true)
    const { data } = await supabase
      .from('solicitudes')
      .select('*, pacientes(*)')
      .eq('profesional_id', user.id)
      .in('estado', ['pendiente', 'en_tratamiento'])
      .order('fecha_solicitud', { ascending: false })

    if (data) {
      setSolicitudes(data)
      const ids = data.filter(s => s.estado === 'en_tratamiento').map(s => s.id)
      if (ids.length > 0) {
        const { data: sesData } = await supabase
          .from('sesiones').select('solicitud_id, asistencia').in('solicitud_id', ids)
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
      s.pacientes?.dni?.includes(q)
    )
  }

  const pendientes = filterFn(solicitudes.filter(s => s.estado === 'pendiente'))
  const enTratamiento = filterFn(solicitudes.filter(s => s.estado === 'en_tratamiento'))

  return (
    <div className="min-h-screen bg-page-bg">
      <TopBar
        title="Mis Derivaciones"
        subtitle={`${user.nombre} ${user.apellido} — Mat. ${user.matricula || 'N/A'}`}
        rol="medico_aps"
      />

      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex gap-2 mb-5">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar derivación..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-white text-sm text-text-primary outline-none focus:border-medico-aps-primary"
            />
          </div>
          <button
            onClick={() => navigate('/aps/nueva-solicitud')}
            className="px-4 py-2.5 rounded-xl text-white text-sm font-medium whitespace-nowrap flex items-center gap-1.5"
            style={{ backgroundColor: '#7C3AAB' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10 text-text-secondary text-sm">Cargando...</div>
        ) : (
          <>
            <section className="mb-6">
              <h2 className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">Pendientes de Asignación ({pendientes.length})</h2>
              {pendientes.length === 0 ? (
                <div className="bg-white rounded-xl border border-border p-4 text-sm text-text-secondary text-center">No hay derivaciones pendientes</div>
              ) : (
                <div className="space-y-2">
                  {pendientes.map(s => (
                    <div
                      key={s.id}
                      onClick={() => navigate(`/aps/ficha/${s.id}`)}
                      className="bg-white rounded-xl border border-border p-4 cursor-pointer hover:border-medico-aps-primary transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-text-primary text-sm">{s.pacientes?.apellido}, {s.pacientes?.nombre}</p>
                          <p className="text-xs text-text-secondary">DNI: {s.pacientes?.dni} · Módulo {s.modulo}</p>
                          <p className="text-xs text-text-secondary mt-0.5">{new Date(s.fecha_solicitud).toLocaleDateString('es-AR')}</p>
                        </div>
                        <BadgePrioridad prioridad={s.prioridad} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="mb-6">
              <h2 className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">Mis Pacientes en Tratamiento ({enTratamiento.length})</h2>
              {enTratamiento.length === 0 ? (
                <div className="bg-white rounded-xl border border-border p-4 text-sm text-text-secondary text-center">No hay pacientes en tratamiento</div>
              ) : (
                <div className="space-y-2">
                  {enTratamiento.map(s => {
                    const counts = sesionesCount[s.id] || { asistio: 0, total: s.sesiones || 0 }
                    return (
                      <div
                        key={s.id}
                        onClick={() => navigate(`/aps/ficha/${s.id}`)}
                        className="bg-white rounded-xl border border-border p-4 cursor-pointer hover:border-medico-aps-primary transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="min-w-0">
                            <p className="font-medium text-text-primary text-sm">{s.pacientes?.apellido}, {s.pacientes?.nombre}</p>
                            <p className="text-xs text-text-secondary">DNI: {s.pacientes?.dni} · Módulo {s.modulo}</p>
                          </div>
                          <BadgePrioridad prioridad={s.prioridad} />
                        </div>
                        <ProgressBar completed={counts.asistio} total={counts.total} color="#7C3AAB" />
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            <button
              onClick={() => navigate('/aps/historial')}
              className="w-full py-3 rounded-xl border border-border bg-white text-sm text-text-secondary flex items-center justify-center gap-2 hover:border-medico-aps-primary transition-colors"
            >
              Ver Historial
            </button>
          </>
        )}
      </div>
    </div>
  )
}
