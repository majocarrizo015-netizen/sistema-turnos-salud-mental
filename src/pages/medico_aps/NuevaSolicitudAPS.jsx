import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase'
import { useAuth } from '../../context/AuthContext'
import TopBar from '../../components/TopBar'
import PopupSuccess from '../../components/PopupSuccess'
import PopupError from '../../components/PopupError'

export default function NuevaSolicitudAPS() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    apellido: '', nombre: '', dni: '', fecha_nacimiento: '', obra_social: '', contacto: '',
    diagnostico: '', prioridad: 'programado', resumen_hc: '',
  })
  const [popup, setPopup] = useState(null)
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const handleSave = async () => {
    if (!form.apellido || !form.nombre || !form.dni) {
      setPopup({ type: 'error', msg: 'Complete los datos del paciente (apellido, nombre y DNI son obligatorios)' })
      return
    }
    if (!form.prioridad) {
      setPopup({ type: 'error', msg: 'Seleccione una prioridad' })
      return
    }
    setLoading(true)
    try {
      // Upsert paciente
      let pacienteId
      const { data: existente } = await supabase.from('pacientes').select('id').eq('dni', form.dni).single()
      if (existente) {
        pacienteId = existente.id
      } else {
        const { data: nuevo, error: errPac } = await supabase.from('pacientes').insert({
          nombre: form.nombre,
          apellido: form.apellido,
          dni: form.dni,
          fecha_nacimiento: form.fecha_nacimiento || null,
          obra_social: form.obra_social || null,
          contacto: form.contacto || null,
        }).select().single()
        if (errPac) throw errPac
        pacienteId = nuevo.id
      }

      // Create solicitud (modulo 1 fixed for APS)
      const { data: sol, error: errSol } = await supabase.from('solicitudes').insert({
        paciente_id: pacienteId,
        profesional_id: user.id,
        modulo: 1,
        sesiones: 2,
        frecuencia: 'a_definir',
        diagnostico: form.diagnostico || null,
        prioridad: form.prioridad,
        estado: 'pendiente',
        resumen_hc: form.resumen_hc || null,
        fecha_solicitud: new Date().toISOString(),
      }).select().single()
      if (errSol) throw errSol

      // Notify admins
      const { data: admins } = await supabase.from('usuarios').select('id').eq('rol', 'administrativo')
      if (admins?.length) {
        await supabase.from('notificaciones').insert(
          admins.map(a => ({
            destinatario_id: a.id,
            tipo: 'nueva_solicitud',
            mensaje: `Nueva derivación APS: ${form.apellido} ${form.nombre} — Módulo 1 por ${user.nombre} ${user.apellido}`,
            solicitud_id: sol.id,
            leida: false,
            fecha: new Date().toISOString(),
          }))
        )
      }
      setPopup({ type: 'success', msg: 'Derivación enviada correctamente' })
    } catch (err) {
      setPopup({ type: 'error', msg: 'Error al enviar la derivación' })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-page-bg pb-8">
      <TopBar title="Nueva Interconsulta" showBack backTo="/aps/panel" rol="medico_aps" />

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Patient data */}
        <div className="bg-white rounded-2xl border border-border p-4">
          <h2 className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: '#7C3AAB' }}>Datos del Paciente</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-text-secondary mb-1">Apellido *</label>
                <input value={form.apellido} onChange={e => set('apellido', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">Nombre *</label>
                <input value={form.nombre} onChange={e => set('nombre', e.target.value)} className="input-field" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-text-secondary mb-1">DNI *</label>
                <input value={form.dni} onChange={e => set('dni', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">Fecha de nacimiento</label>
                <input type="date" value={form.fecha_nacimiento} onChange={e => set('fecha_nacimiento', e.target.value)} className="input-field" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-text-secondary mb-1">Obra Social</label>
                <input value={form.obra_social} onChange={e => set('obra_social', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">Contacto</label>
                <input value={form.contacto} onChange={e => set('contacto', e.target.value)} className="input-field" />
              </div>
            </div>
          </div>
        </div>

        {/* Module (fixed) + Clinical data */}
        <div className="bg-white rounded-2xl border border-border p-4 space-y-3">
          <h2 className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: '#7C3AAB' }}>Datos Clínicos</h2>

          <div className="bg-page-bg rounded-lg p-3 flex items-center justify-between">
            <span className="text-xs text-text-secondary">Módulo (fijo)</span>
            <span className="text-sm font-medium px-3 py-1 rounded-full text-white" style={{ backgroundColor: '#7C3AAB' }}>Módulo 1</span>
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1">Diagnóstico</label>
            <input value={form.diagnostico} onChange={e => set('diagnostico', e.target.value)} className="input-field" />
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1">Prioridad *</label>
            <div className="flex gap-2">
              {[
                { v: 'urgente', label: 'Urgente', color: '#E24B4A', bg: '#FCEBEB' },
                { v: 'prioritario', label: 'Prioritario', color: '#EF9F27', bg: '#FAEEDA' },
                { v: 'programado', label: 'Programado', color: '#1D9E75', bg: '#E1F5EE' },
              ].map(p => (
                <button
                  key={p.v}
                  type="button"
                  onClick={() => set('prioridad', p.v)}
                  className="flex-1 py-2 rounded-lg text-xs font-medium border transition-all"
                  style={form.prioridad === p.v
                    ? { borderColor: p.color, backgroundColor: p.bg, color: p.color }
                    : { borderColor: '#D3D1C7', color: '#888780' }
                  }
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1">Resumen Historia Clínica</label>
            <textarea
              value={form.resumen_hc}
              onChange={e => set('resumen_hc', e.target.value)}
              rows={5}
              placeholder="Describa el motivo de derivación y resumen de la historia clínica..."
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary outline-none resize-none"
              style={{ '--tw-ring-color': '#7C3AAB' }}
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full py-3 rounded-lg text-white text-sm font-medium disabled:opacity-60"
          style={{ backgroundColor: '#7C3AAB' }}
        >
          {loading ? 'Enviando...' : 'Enviar Derivación'}
        </button>
      </div>

      {popup?.type === 'success' && <PopupSuccess message={popup.msg} onClose={() => navigate('/aps/panel')} />}
      {popup?.type === 'error' && <PopupError message={popup.msg} onClose={() => setPopup(null)} />}
    </div>
  )
}
