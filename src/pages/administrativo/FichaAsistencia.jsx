import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../supabase'
import { useAuth } from '../../context/AuthContext'
import TopBar from '../../components/TopBar'
import BadgePrioridad from '../../components/BadgePrioridad'
import ProgressBar from '../../components/ProgressBar'
import PopupFaltas from '../../components/PopupFaltas'
import PopupFinSesiones from '../../components/PopupFinSesiones'
import PopupError from '../../components/PopupError'
import { useProtocoloFaltas } from '../../hooks/useProtocoloFaltas'

const asistenciaColors = {
  asistio: { label: 'Asistió', bg: '#E1F5EE', color: '#1D9E75' },
  no: { label: 'No asistió', bg: '#FCEBEB', color: '#E24B4A' },
  aviso: { label: 'Avisó', bg: '#FAEEDA', color: '#EF9F27' },
  pendiente: { label: 'Pendiente', bg: '#F1EFE8', color: '#888780' },
}

export default function FichaAsistencia() {
  const { solicitudId } = useParams()
  const navigate = useNavigate()
  const [solicitud, setSolicitud] = useState(null)
  const [sesiones, setSesiones] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const [showFinSesiones, setShowFinSesiones] = useState(false)

  const { protocoloData, showPopupFaltas, setShowPopupFaltas, checkProtocoloFaltas, activarProtocolo, justificarFalta } = useProtocoloFaltas()

  useEffect(() => {
    fetchData()
  }, [solicitudId])

  async function fetchData() {
    setLoading(true)
    const { data: sol } = await supabase
      .from('solicitudes')
      .select('*, pacientes(*), usuarios(nombre, apellido, matricula, id)')
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

  const today = new Date().toISOString().split('T')[0]

  const isPast = (fecha) => fecha && fecha <= today

  const setAsistencia = (id, value) => {
    setSesiones(prev => prev.map(s => s.id === id ? { ...s, asistencia: value } : s))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Save all changes
      for (const s of sesiones) {
        if (isPast(s.fecha) || s.asistencia !== 'pendiente') {
          await supabase.from('sesiones').update({ asistencia: s.asistencia }).eq('id', s.id)
        }
      }

      // Check for protocol
      const hasProtocol = await checkProtocoloFaltas(solicitudId)

      if (!hasProtocol) {
        // Check if last session was marked
        const lastSesion = sesiones[sesiones.length - 1]
        if (lastSesion && (lastSesion.asistencia === 'asistio' || lastSesion.asistencia === 'no' || lastSesion.asistencia === 'aviso')) {
          // Check if all sessions are complete (non-pending)
          const allNonPending = sesiones.every(s => s.asistencia !== 'pendiente')
          if (allNonPending) {
            setShowFinSesiones(true)
          }
        }
      }
    } catch (err) {
      setErrorMsg('Error al guardar la asistencia')
    }
    setSaving(false)
  }

  const handleActivarProtocolo = async (solId) => {
    await activarProtocolo(solId)
    // Notify professional
    if (solicitud?.usuarios?.id) {
      await supabase.from('notificaciones').insert({
        destinatario_id: solicitud.usuarios.id,
        tipo: 'protocolo_faltas',
        mensaje: `Protocolo de faltas activado para ${solicitud.pacientes?.apellido}, ${solicitud.pacientes?.nombre}`,
        solicitud_id: solId,
        leida: false,
        fecha: new Date().toISOString(),
      })
    }
    // Notify social service (find users with rol 'administrativo')
    const { data: admins } = await supabase.from('usuarios').select('id').eq('rol', 'administrativo')
    if (admins) {
      for (const a of admins) {
        await supabase.from('notificaciones').insert({
          destinatario_id: a.id,
          tipo: 'protocolo_faltas',
          mensaje: `Protocolo de faltas activado: ${solicitud?.pacientes?.apellido}, ${solicitud?.pacientes?.nombre}`,
          solicitud_id: solId,
          leida: false,
          fecha: new Date().toISOString(),
        })
      }
    }
    setShowFinSesiones(true)
  }

  const handleEnviarHistorial = async () => {
    await supabase.from('solicitudes').update({ estado: 'finalizado' }).eq('id', solicitudId)
    // Notify professional
    if (solicitud?.usuarios?.id) {
      await supabase.from('notificaciones').insert({
        destinatario_id: solicitud.usuarios.id,
        tipo: 'modulo_completo',
        mensaje: `Módulo ${solicitud.modulo} completado para ${solicitud.pacientes?.apellido}, ${solicitud.pacientes?.nombre}`,
        solicitud_id: solicitudId,
        leida: false,
        fecha: new Date().toISOString(),
      })
    }
    navigate('/admin/panel')
  }

  const handleAgregarSesiones = () => {
    navigate(`/admin/agregar-sesiones/${solicitudId}`)
  }

  if (loading) return <div className="min-h-screen bg-page-bg flex items-center justify-center text-text-secondary text-sm">Cargando...</div>

  const paciente = solicitud?.pacientes
  const profesional = solicitud?.usuarios
  const completadas = sesiones.filter(s => s.asistencia === 'asistio').length
  const total = sesiones.length

  return (
    <div className="min-h-screen bg-page-bg pb-8">
      <TopBar
        title={`${paciente?.apellido}, ${paciente?.nombre}`}
        subtitle={`${profesional?.nombre} ${profesional?.apellido} · Mat. ${profesional?.matricula || '-'}`}
        showBack
        backTo="/admin/panel"
        rol="administrativo"
      />

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Info */}
        <div className="bg-page-bg rounded-2xl border border-border p-4">
          <div className="grid grid-cols-2 gap-y-2 text-sm mb-3">
            <div><p className="text-xs text-text-secondary">Paciente</p><p className="font-medium text-text-primary">{paciente?.apellido}, {paciente?.nombre}</p></div>
            <div><p className="text-xs text-text-secondary">DNI</p><p className="text-text-primary">{paciente?.dni}</p></div>
            <div><p className="text-xs text-text-secondary">Profesional</p><p className="text-text-primary">{profesional?.nombre} {profesional?.apellido}</p></div>
            <div><p className="text-xs text-text-secondary">Diagnóstico</p><p className="text-text-primary text-xs">{solicitud?.diagnostico || '—'}</p></div>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-administrativo-light text-administrativo-primary border border-administrativo-primary font-medium">Módulo {solicitud?.modulo}</span>
            <BadgePrioridad prioridad={solicitud?.prioridad} />
          </div>
          <ProgressBar completed={completadas} total={total} color="#0F6E56" />
        </div>

        {/* Sessions */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-medium text-text-primary">Sesiones</h2>
            <button
              onClick={() => navigate(`/admin/agregar-sesiones/${solicitudId}`)}
              className="text-xs text-administrativo-primary font-medium"
            >
              + Agregar
            </button>
          </div>
          <div className="divide-y divide-border">
            {sesiones.map(s => {
              const past = isPast(s.fecha)
              const cfg = asistenciaColors[s.asistencia] || asistenciaColors.pendiente
              return (
                <div key={s.id} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm text-text-primary font-medium">Sesión {s.numero}</p>
                      <p className="text-xs text-text-secondary">
                        {s.fecha ? new Date(s.fecha + 'T00:00:00').toLocaleDateString('es-AR') : '—'}
                        {s.hora ? ` · ${s.hora.slice(0,5)}hs` : ''}
                      </p>
                    </div>
                    {past ? (
                      <div className="flex gap-1.5">
                        {['asistio', 'no', 'aviso'].map(v => (
                          <button
                            key={v}
                            onClick={() => setAsistencia(s.id, v)}
                            className="px-2 py-1 rounded-lg text-xs font-medium border transition-all"
                            style={s.asistencia === v
                              ? { backgroundColor: asistenciaColors[v].bg, color: asistenciaColors[v].color, borderColor: asistenciaColors[v].color }
                              : { backgroundColor: 'white', color: '#888780', borderColor: '#D3D1C7' }
                            }
                          >
                            {v === 'asistio' ? 'Sí' : v === 'no' ? 'No' : 'Avisó'}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                      </span>
                    )}
                  </div>
                  {s.justificacion && <p className="text-xs text-text-secondary mt-1 italic">{s.justificacion}</p>}
                </div>
              )
            })}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 rounded-xl bg-administrativo-primary text-white text-sm font-medium disabled:opacity-60"
        >
          {saving ? 'Guardando...' : 'Guardar Asistencia'}
        </button>
      </div>

      {showPopupFaltas && protocoloData && (
        <PopupFaltas
          data={protocoloData}
          onJustificar={justificarFalta}
          onActivarProtocolo={handleActivarProtocolo}
          onClose={() => setShowPopupFaltas(false)}
        />
      )}

      {showFinSesiones && (
        <PopupFinSesiones
          modulo={solicitud?.modulo}
          onEnviarHistorial={handleEnviarHistorial}
          onAgregarSesiones={handleAgregarSesiones}
        />
      )}

      {errorMsg && <PopupError message={errorMsg} onClose={() => setErrorMsg(null)} />}
    </div>
  )
}
