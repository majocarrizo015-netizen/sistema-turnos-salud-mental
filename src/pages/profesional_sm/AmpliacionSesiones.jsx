import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../supabase'
import { useAuth } from '../../context/AuthContext'
import TopBar from '../../components/TopBar'
import BadgePrioridad from '../../components/BadgePrioridad'
import PopupSuccess from '../../components/PopupSuccess'
import PopupError from '../../components/PopupError'

export default function AmpliacionSesiones() {
  const { solicitudId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [solicitud, setSolicitud] = useState(null)
  const [form, setForm] = useState({ sesiones: '', diagnostico: '', prioridad: '', justificacion: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [popup, setPopup] = useState(null)

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase
        .from('solicitudes')
        .select('*, pacientes(*)')
        .eq('id', solicitudId)
        .single()
      if (data) {
        setSolicitud(data)
        setForm({ sesiones: data.sesiones || '', diagnostico: data.diagnostico || '', prioridad: data.prioridad || 'programado', justificacion: '' })
      }
      setLoading(false)
    }
    fetchData()
  }, [solicitudId])

  const handleSave = async () => {
    if (!form.justificacion.trim()) {
      setPopup({ type: 'error', msg: 'La justificación clínica es obligatoria' })
      return
    }
    setSaving(true)
    try {
      await supabase.from('solicitudes').update({
        sesiones: parseInt(form.sesiones) || solicitud.sesiones,
        diagnostico: form.diagnostico,
        prioridad: form.prioridad,
        justificacion_ampliacion: form.justificacion,
      }).eq('id', solicitudId)

      // Notify admin
      const { data: admins } = await supabase.from('usuarios').select('id').eq('rol', 'administrativo')
      if (admins?.length) {
        await supabase.from('notificaciones').insert(
          admins.map(a => ({
            destinatario_id: a.id,
            tipo: 'ampliacion',
            mensaje: `Solicitud de ampliación para ${solicitud.pacientes?.apellido} ${solicitud.pacientes?.nombre} por ${user.nombre} ${user.apellido}`,
            solicitud_id: solicitudId,
            leida: false,
            fecha: new Date().toISOString(),
          }))
        )
      }
      setPopup({ type: 'success', msg: 'Solicitud de ampliación enviada correctamente' })
    } catch {
      setPopup({ type: 'error', msg: 'Error al guardar la ampliación' })
    }
    setSaving(false)
  }

  if (loading) return <div className="min-h-screen bg-page-bg flex items-center justify-center text-text-secondary text-sm">Cargando...</div>

  const paciente = solicitud?.pacientes

  return (
    <div className="min-h-screen bg-page-bg pb-8">
      <TopBar title="Solicitar Ampliación" showBack rol="profesional_sm" />

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Read-only data */}
        <div className="bg-page-bg rounded-2xl border border-border p-4">
          <h2 className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-3">Datos del Tratamiento</h2>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div><p className="text-xs text-text-secondary">Paciente</p><p className="font-medium text-text-primary">{paciente?.apellido}, {paciente?.nombre}</p></div>
            <div><p className="text-xs text-text-secondary">DNI</p><p className="text-text-primary">{paciente?.dni}</p></div>
            <div><p className="text-xs text-text-secondary">Profesional</p><p className="text-text-primary">{user.nombre} {user.apellido}</p></div>
            <div><p className="text-xs text-text-secondary">Módulo</p><p className="text-text-primary">Módulo {solicitud?.modulo}</p></div>
            <div><p className="text-xs text-text-secondary">Frecuencia</p><p className="text-text-primary capitalize">{solicitud?.frecuencia || '—'}</p></div>
          </div>
        </div>

        {/* Editable */}
        <div className="bg-white rounded-2xl border border-border p-4 space-y-3">
          <h2 className="text-xs font-medium text-text-secondary uppercase tracking-wider">Modificar Solicitud</h2>
          <div>
            <label className="block text-xs text-text-secondary mb-1">Cantidad de Sesiones</label>
            <input
              type="number" min={1}
              value={form.sesiones}
              onChange={e => setForm(f => ({ ...f, sesiones: e.target.value }))}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1">Diagnóstico</label>
            <input value={form.diagnostico} onChange={e => setForm(f => ({ ...f, diagnostico: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1">Prioridad</label>
            <select value={form.prioridad} onChange={e => setForm(f => ({ ...f, prioridad: e.target.value }))} className="input-field bg-white">
              <option value="urgente">Urgente</option>
              <option value="prioritario">Prioritario</option>
              <option value="programado">Programado</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1">Justificación Clínica *</label>
            <textarea
              value={form.justificacion}
              onChange={e => setForm(f => ({ ...f, justificacion: e.target.value }))}
              rows={4}
              placeholder="Describa la justificación clínica para la ampliación..."
              className="w-full border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary outline-none focus:border-profesional-sm-primary resize-none"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 rounded-xl bg-profesional-sm-primary text-white text-sm font-medium disabled:opacity-60"
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      {popup?.type === 'success' && <PopupSuccess message={popup.msg} onClose={() => navigate('/sm/panel')} />}
      {popup?.type === 'error' && <PopupError message={popup.msg} onClose={() => setPopup(null)} />}
    </div>
  )
}
