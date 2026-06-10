import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase'
import { useAuth } from '../../context/AuthContext'
import TopBar from '../../components/TopBar'
import BadgePrioridad from '../../components/BadgePrioridad'
import BadgeFrecuencia from '../../components/BadgeFrecuencia'
import ProgressBar from '../../components/ProgressBar'
import { useNotificaciones } from '../../hooks/useNotificaciones'

export default function PanelSM() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { unreadCount } = useNotificaciones()
  const [search, setSearch] = useState('')
  const [pendientes, setPendientes] = useState([])
  const [tratamiento, setTratamiento] = useState([])
  const [historial, setHistorial] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [user])

  const fetchData = async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('solicitudes')
      .select('*, pacientes(*), sesiones(*)')
      .eq('profesional_id', user.id)
      .order('fecha_solicitud', { ascending: false })

    if (data) {
      setPendientes(data.filter(s => s.estado === 'pendiente'))
      setTratamiento(data.filter(s => s.estado === 'en_tratamiento'))
      setHistorial(data.filter(s => s.estado === 'finalizado' || s.estado === 'baja_protocolo'))
    }
    setLoading(false)
  }

  const filterBySearch = (list) => {
    if (!search) return list
    const q = search.toLowerCase()
    return list.filter(s =>
      s.pacientes?.nombre?.toLowerCase().includes(q) ||
      s.pacientes?.apellido?.toLowerCase().includes(q) ||
      s.pacientes?.dni?.includes(q)
    )
  }

  const SolicitudCard = ({ s, showProgress = false }) => {
    const completadas = s.sesiones?.filter(se => se.asistencia === 'asistio').length || 0
    const total = s.sesiones?.length || 0
    return (
      <button
        onClick={() => navigate(`/sm/ficha/${s.id}`)}
        className="w-full bg-surface border border-border rounded-2xl p-4 text-left hover:shadow-sm transition-shadow"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-profesional-sm-light flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-profesional-sm-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">
              {s.pacientes?.apellido}, {s.pacientes?.nombre}
            </p>
            <p className="text-xs text-text-secondary">Módulo {s.modulo} · Sesiones {completadas}/{s.sesiones?.length || s.sesiones || 0}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <BadgePrioridad prioridad={s.prioridad} />
          </div>
        </div>
        {showProgress && total > 0 && (
          <div className="mt-3">
            <ProgressBar completed={completadas} total={total} color="#534AB7" />
          </div>
        )}
      </button>
    )
  }

  return (
    <div className="min-h-screen bg-page-bg font-roboto">
      <TopBar
        title="Salud Mental"
        subtitle={`${user?.nombre} ${user?.apellido} · Mat. ${user?.matricula || '-'}`}
        rol="profesional_sm"
      />

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar"
            className="w-full bg-surface border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-profesional-sm-primary/30"
          />
        </div>

        {/* Nueva Solicitud */}
        <button
          onClick={() => navigate('/sm/nueva-solicitud')}
          className="w-full py-3 rounded-xl text-white font-medium text-sm bg-profesional-sm-primary"
        >
          Nueva Solicitud
        </button>

        {loading ? (
          <div className="text-center py-8 text-text-secondary text-sm">Cargando...</div>
        ) : (
          <>
            {/* Pendientes */}
            <section>
              <h2 className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">Pendientes de Asignación</h2>
              <div className="space-y-2">
                {filterBySearch(pendientes).length === 0
                  ? <p className="text-xs text-text-secondary text-center py-3">No hay solicitudes pendientes</p>
                  : filterBySearch(pendientes).map(s => <SolicitudCard key={s.id} s={s} />)
                }
              </div>
            </section>

            {/* En tratamiento */}
            <section>
              <h2 className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">Mis Pacientes en Tratamiento</h2>
              <div className="space-y-2">
                {filterBySearch(tratamiento).length === 0
                  ? <p className="text-xs text-text-secondary text-center py-3">Sin pacientes en tratamiento</p>
                  : filterBySearch(tratamiento).map(s => <SolicitudCard key={s.id} s={s} showProgress />)
                }
              </div>
            </section>

            {/* Historial link */}
            <section>
              <h2 className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">Historial</h2>
              <button
                onClick={() => navigate('/sm/historial')}
                className="w-full bg-surface border border-border rounded-2xl px-4 py-3 text-sm text-text-secondary text-left hover:shadow-sm"
              >
                {historial.length > 0 ? `${historial.length} paciente(s) en historial →` : 'No registra Pacientes'}
              </button>
            </section>
          </>
        )}
      </div>
    </div>
  )
}
