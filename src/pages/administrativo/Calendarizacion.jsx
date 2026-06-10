import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../supabase'
import { useAuth } from '../../context/AuthContext'
import TopBar from '../../components/TopBar'
import BadgePrioridad from '../../components/BadgePrioridad'
import BadgeFrecuencia from '../../components/BadgeFrecuencia'
import PopupSuccess from '../../components/PopupSuccess'
import PopupError from '../../components/PopupError'

export default function Calendarizacion() {
  const { solicitudId } = useParams()
  const navigate = useNavigate()
  const [solicitud, setSolicitud] = useState(null)
  const [sesiones, setSesiones] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [popup, setPopup] = useState(null)

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase
        .from('solicitudes')
        .select('*, pacientes(*), usuarios(nombre, apellido, matricula, especialidad)')
        .eq('id', solicitudId)
        .single()
      if (data) {
        setSolicitud(data)
        const count = data.sesiones || 1
        setSesiones(Array.from({ length: count }, (_, i) => ({ numero: i + 1, fecha: '', hora: '' })))
      }
      setLoading(false)
    }
    fetchData()
  }, [solicitudId])

  const updateSesion = (idx, field, value) => {
    setSesiones(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s))
  }

  const addSesion = () => {
    setSesiones(prev => [...prev, { numero: prev.length + 1, fecha: '', hora: '' }])
  }

  const handleSave = async () => {
    if (sesiones.some(s => !s.fecha || !s.hora)) {
      setPopup({ type: 'error', msg: 'Complete fecha y hora para todas las sesiones' })
      return
    }
    setSaving(true)
    try {
      const { error: sesErr } = await supabase.from('sesiones').insert(
        sesiones.map(s => ({
          solicitud_id: solicitudId,
          numero: s.numero,
          fecha: s.fecha,
          hora: s.hora,
          asistencia: 'pendiente',
        }))
      )
      if (sesErr) throw sesErr

      await supabase.from('solicitudes').update({ estado: 'en_tratamiento' }).eq('id', solicitudId)

      setPopup({ type: 'success', msg: 'Sesiones calendarizadas correctamente' })
    } catch {
      setPopup({ type: 'error', msg: 'Error al guardar las sesiones' })
    }
    setSaving(false)
  }

  if (loading) return <div className="min-h-screen bg-page-bg flex items-center justify-center text-text-secondary text-sm">Cargando...</div>

  const paciente = solicitud?.pacientes
  const profesional = solicitud?.usuarios

  return (
    <div className="min-h-screen bg-page-bg pb-8">
      <TopBar title="Calendarización" showBack backTo="/admin/panel" rol="administrativo" />

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Patient + professional info */}
        <div className="bg-page-bg rounded-2xl border border-border p-4">
          <div className="grid grid-cols-2 gap-y-2 text-sm mb-3">
            <div><p className="text-xs text-text-secondary">Paciente</p><p className="font-medium text-text-primary">{paciente?.apellido}, {paciente?.nombre}</p></div>
            <div><p className="text-xs text-text-secondary">DNI</p><p className="text-text-primary">{paciente?.dni}</p></div>
            <div><p className="text-xs text-text-secondary">Profesional</p><p className="text-text-primary">{profesional?.nombre} {profesional?.apellido}</p></div>
            <div><p className="text-xs text-text-secondary">Obra Social</p><p className="text-text-primary">{paciente?.obra_social || '—'}</p></div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-administrativo-light text-administrativo-primary border border-administrativo-primary font-medium">Módulo {solicitud?.modulo}</span>
            <BadgePrioridad prioridad={solicitud?.prioridad} />
            <BadgeFrecuencia frecuencia={solicitud?.frecuencia} />
          </div>
          {solicitud?.diagnostico && (
            <p className="text-xs text-text-secondary mt-2">Diagnóstico: {solicitud.diagnostico}</p>
          )}
        </div>

        {/* Sessions */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-medium text-text-primary">Sesiones ({sesiones.length})</h2>
            <button onClick={addSesion} className="text-xs text-administrativo-primary font-medium flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar
            </button>
          </div>
          <div className="divide-y divide-border">
            {sesiones.map((s, idx) => (
              <div key={idx} className="px-4 py-3 flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-administrativo-light text-administrativo-primary text-xs font-medium flex items-center justify-center flex-shrink-0">{s.numero}</span>
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={s.fecha}
                    onChange={e => updateSesion(idx, 'fecha', e.target.value)}
                    className="input-field text-xs"
                  />
                  <input
                    type="time"
                    value={s.hora}
                    onChange={e => updateSesion(idx, 'hora', e.target.value)}
                    className="input-field text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 rounded-xl bg-administrativo-primary text-white text-sm font-medium disabled:opacity-60"
        >
          {saving ? 'Guardando...' : 'Guardar y Confirmar'}
        </button>
      </div>

      {popup?.type === 'success' && <PopupSuccess message={popup.msg} onClose={() => navigate('/admin/panel')} />}
      {popup?.type === 'error' && <PopupError message={popup.msg} onClose={() => setPopup(null)} />}
    </div>
  )
}
