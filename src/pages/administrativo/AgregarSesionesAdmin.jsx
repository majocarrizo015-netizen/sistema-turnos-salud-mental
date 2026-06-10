import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../supabase'
import TopBar from '../../components/TopBar'
import PopupSuccess from '../../components/PopupSuccess'
import PopupError from '../../components/PopupError'

export default function AgregarSesionesAdmin() {
  const { solicitudId } = useParams()
  const navigate = useNavigate()
  const [solicitud, setSolicitud] = useState(null)
  const [pastSesiones, setPastSesiones] = useState([])
  const [newSesiones, setNewSesiones] = useState([{ fecha: '', hora: '' }])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [popup, setPopup] = useState(null)

  useEffect(() => {
    async function fetchData() {
      const { data: sol } = await supabase
        .from('solicitudes')
        .select('*, pacientes(*), usuarios(nombre, apellido, matricula)')
        .eq('id', solicitudId)
        .single()
      if (sol) setSolicitud(sol)

      const { data: ses } = await supabase
        .from('sesiones')
        .select('*')
        .eq('solicitud_id', solicitudId)
        .order('numero', { ascending: true })
      if (ses) setPastSesiones(ses)

      setLoading(false)
    }
    fetchData()
  }, [solicitudId])

  const addRow = () => {
    setNewSesiones(prev => [...prev, { fecha: '', hora: '' }])
  }

  const updateRow = (idx, field, value) => {
    setNewSesiones(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r))
  }

  const removeRow = (idx) => {
    setNewSesiones(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSave = async () => {
    if (newSesiones.some(s => !s.fecha || !s.hora)) {
      setPopup({ type: 'error', msg: 'Complete fecha y hora para todas las sesiones' })
      return
    }
    setSaving(true)
    try {
      const startNum = pastSesiones.length + 1
      await supabase.from('sesiones').insert(
        newSesiones.map((s, i) => ({
          solicitud_id: solicitudId,
          numero: startNum + i,
          fecha: s.fecha,
          hora: s.hora,
          asistencia: 'pendiente',
        }))
      )
      // Update total sesiones in solicitud
      await supabase.from('solicitudes')
        .update({ sesiones: pastSesiones.length + newSesiones.length })
        .eq('id', solicitudId)

      setPopup({ type: 'success', msg: 'Sesiones agregadas correctamente' })
    } catch {
      setPopup({ type: 'error', msg: 'Error al agregar sesiones' })
    }
    setSaving(false)
  }

  if (loading) return <div className="min-h-screen bg-page-bg flex items-center justify-center text-text-secondary text-sm">Cargando...</div>

  const asistenciaColors = {
    asistio: { bg: '#E1F5EE', color: '#1D9E75' },
    no: { bg: '#FCEBEB', color: '#E24B4A' },
    aviso: { bg: '#FAEEDA', color: '#EF9F27' },
    pendiente: { bg: '#F1EFE8', color: '#888780' },
  }

  return (
    <div className="min-h-screen bg-page-bg pb-8">
      <TopBar title="Agregar Sesiones" showBack rol="administrativo" />

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Info */}
        <div className="bg-page-bg rounded-2xl border border-border p-4">
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div><p className="text-xs text-text-secondary">Paciente</p><p className="font-medium text-text-primary">{solicitud?.pacientes?.apellido}, {solicitud?.pacientes?.nombre}</p></div>
            <div><p className="text-xs text-text-secondary">Módulo</p><p className="text-text-primary">Módulo {solicitud?.modulo}</p></div>
            <div><p className="text-xs text-text-secondary">Profesional</p><p className="text-text-primary">{solicitud?.usuarios?.nombre} {solicitud?.usuarios?.apellido}</p></div>
            <div><p className="text-xs text-text-secondary">Frecuencia</p><p className="text-text-primary capitalize">{solicitud?.frecuencia || '—'}</p></div>
          </div>
        </div>

        {/* Past sessions */}
        {pastSesiones.length > 0 && (
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-sm font-medium text-text-primary">Sesiones anteriores</h2>
            </div>
            <div className="divide-y divide-border">
              {pastSesiones.map(s => {
                const cfg = asistenciaColors[s.asistencia] || asistenciaColors.pendiente
                return (
                  <div key={s.id} className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-primary">Sesión {s.numero}</p>
                      <p className="text-xs text-text-secondary">{s.fecha ? new Date(s.fecha + 'T00:00:00').toLocaleDateString('es-AR') : '—'}{s.hora ? ` · ${s.hora.slice(0,5)}hs` : ''}</p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                      {s.asistencia}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* New sessions */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-medium text-text-primary">Nuevas Sesiones</h2>
            <button onClick={addRow} className="text-xs text-administrativo-primary font-medium flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar
            </button>
          </div>
          <div className="divide-y divide-border">
            {newSesiones.map((s, idx) => (
              <div key={idx} className="px-4 py-3 flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-administrativo-light text-administrativo-primary text-xs font-medium flex items-center justify-center flex-shrink-0">
                  {pastSesiones.length + idx + 1}
                </span>
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <input type="date" value={s.fecha} onChange={e => updateRow(idx, 'fecha', e.target.value)} className="input-field text-xs" />
                  <input type="time" value={s.hora} onChange={e => updateRow(idx, 'hora', e.target.value)} className="input-field text-xs" />
                </div>
                {newSesiones.length > 1 && (
                  <button onClick={() => removeRow(idx)} className="text-urgente">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 rounded-lg bg-administrativo-primary text-white text-sm font-medium disabled:opacity-60"
        >
          {saving ? 'Guardando...' : 'Guardar Sesiones'}
        </button>
      </div>

      {popup?.type === 'success' && <PopupSuccess message={popup.msg} onClose={() => navigate('/admin/panel')} />}
      {popup?.type === 'error' && <PopupError message={popup.msg} onClose={() => setPopup(null)} />}
    </div>
  )
}
