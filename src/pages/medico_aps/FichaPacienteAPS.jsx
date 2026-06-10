import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../supabase'
import TopBar from '../../components/TopBar'
import BadgePrioridad from '../../components/BadgePrioridad'
import ProgressBar from '../../components/ProgressBar'

const asistenciaConfig = {
  asistio: { label: 'Asistió', bg: '#E1F5EE', color: '#1D9E75' },
  no: { label: 'No asistió', bg: '#FCEBEB', color: '#E24B4A' },
  aviso: { label: 'Avisó', bg: '#FAEEDA', color: '#EF9F27' },
  pendiente: { label: 'Pendiente', bg: '#F1EFE8', color: '#888780' },
}

export default function FichaPacienteAPS() {
  const { solicitudId } = useParams()
  const navigate = useNavigate()
  const [solicitud, setSolicitud] = useState(null)
  const [sesiones, setSesiones] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const { data: sol } = await supabase
        .from('solicitudes')
        .select('*, pacientes(*), usuarios(nombre, apellido, matricula, especialidad)')
        .eq('id', solicitudId)
        .single()
      if (sol) setSolicitud(sol)

      const { data: ses } = await supabase
        .from('sesiones')
        .select('*')
        .eq('solicitud_id', solicitudId)
        .order('numero', { ascending: true })
      if (ses) setSesiones(ses)

      setLoading(false)
    }
    fetchData()
  }, [solicitudId])

  if (loading) return <div className="min-h-screen bg-page-bg flex items-center justify-center text-text-secondary text-sm">Cargando...</div>
  if (!solicitud) return <div className="min-h-screen bg-page-bg flex items-center justify-center text-text-secondary text-sm">No encontrado</div>

  const paciente = solicitud.pacientes
  const profesional = solicitud.usuarios
  const completadas = sesiones.filter(s => s.asistencia === 'asistio').length
  const total = sesiones.length || solicitud.sesiones || 0

  return (
    <div className="min-h-screen bg-page-bg pb-8">
      <TopBar
        title={`${paciente?.apellido}, ${paciente?.nombre}`}
        subtitle={`${profesional?.nombre} ${profesional?.apellido} · Mat. ${profesional?.matricula || '-'}`}
        showBack
        backTo="/aps/panel"
        rol="medico_aps"
      />

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        <div className="bg-page-bg rounded-2xl border border-border p-4">
          <h2 className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-3">Datos del Paciente</h2>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div><p className="text-xs text-text-secondary">Apellido y Nombre</p><p className="font-medium text-text-primary">{paciente?.apellido}, {paciente?.nombre}</p></div>
            <div><p className="text-xs text-text-secondary">DNI</p><p className="text-text-primary">{paciente?.dni}</p></div>
            <div><p className="text-xs text-text-secondary">Fecha Nac.</p><p className="text-text-primary">{paciente?.fecha_nacimiento ? new Date(paciente.fecha_nacimiento + 'T00:00:00').toLocaleDateString('es-AR') : '—'}</p></div>
            <div><p className="text-xs text-text-secondary">Obra Social</p><p className="text-text-primary">{paciente?.obra_social || '—'}</p></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-4">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium border" style={{ backgroundColor: '#F3E8FF', color: '#7C3AAB', borderColor: '#7C3AAB' }}>Módulo {solicitud.modulo}</span>
            <BadgePrioridad prioridad={solicitud.prioridad} />
          </div>
          {total > 0 && <ProgressBar completed={completadas} total={total} color="#7C3AAB" />}
        </div>

        {sesiones.length > 0 && (
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-xs font-medium text-text-secondary uppercase tracking-wider">Sesiones</h2>
            </div>
            <div className="divide-y divide-border">
              {sesiones.map(s => {
                const cfg = asistenciaConfig[s.asistencia] || asistenciaConfig.pendiente
                return (
                  <div key={s.id} className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-primary">Sesión {s.numero}</p>
                      <p className="text-xs text-text-secondary">
                        {s.fecha ? new Date(s.fecha + 'T00:00:00').toLocaleDateString('es-AR') : '—'}
                        {s.hora ? ` · ${s.hora.slice(0,5)}hs` : ''}
                      </p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                      {cfg.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {solicitud.resumen_hc && (
          <div className="bg-white rounded-2xl border border-border p-4">
            <h2 className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">Resumen HC</h2>
            <p className="text-sm text-text-primary">{solicitud.resumen_hc}</p>
          </div>
        )}

        <button
          onClick={() => navigate('/aps/panel')}
          className="w-full py-3 rounded-lg border border-border text-text-secondary text-sm"
        >
          Salir
        </button>
      </div>
    </div>
  )
}
