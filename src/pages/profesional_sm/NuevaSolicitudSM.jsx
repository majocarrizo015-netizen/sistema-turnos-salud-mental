import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase'
import { useAuth } from '../../context/AuthContext'
import TopBar from '../../components/TopBar'
import PopupSuccess from '../../components/PopupSuccess'
import PopupError from '../../components/PopupError'
import PopupModulo5 from '../../components/PopupModulo5'
import { PRIORIDADES } from '../../components/BadgePrioridad'

const modulosConfig = {
  1: { sesiones: 2, sesionesLocked: true, frecuencia: '', frecuenciaLocked: false },
  2: { sesiones: 4, sesionesLocked: true, frecuencia: '', frecuenciaLocked: false },
  3: { sesiones: 8, sesionesLocked: false, frecuencia: 'semanal', frecuenciaLocked: true },
  4: { sesiones: '', sesionesLocked: false, frecuencia: 'mensual', frecuenciaLocked: true },
  5: { sesiones: '', sesionesLocked: false, frecuencia: 'semanal', frecuenciaLocked: true },
}

const frecuencias = ['semanal', 'quincenal', 'mensual', 'a_definir']

export default function NuevaSolicitudSM() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    apellido: '', nombre: '', dni: '', fecha_nacimiento: '', obra_social: '',
    modulo: null, sesiones: '', frecuencia: '', diagnostico: '', prioridad: '',
    psiquiatra_articulante: '', observaciones: '',
  })
  const [popup, setPopup] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showModulo5, setShowModulo5] = useState(false)
  const [modulo5Sel, setModulo5Sel] = useState(null)

  const selectModulo = (m) => {
    const cfg = modulosConfig[m]
    setForm(f => ({
      ...f,
      modulo: m,
      sesiones: cfg.sesiones,
      frecuencia: cfg.frecuencia,
    }))
    if (m === 5) setShowModulo5(true)
  }

  const handleModulo5Continuar = (sel) => {
    setModulo5Sel(sel)
    setForm(f => ({ ...f, psiquiatra_articulante: sel.texto }))
    setShowModulo5(false)
  }

  const handleSave = async () => {
    if (!form.apellido || !form.nombre || !form.dni || !form.modulo || !form.prioridad) {
      setPopup({ type: 'error', msg: 'Complete todos los campos obligatorios' })
      return
    }
    if (form.modulo === 5 && !form.psiquiatra_articulante) {
      setPopup({ type: 'error', msg: 'Complete el tipo de consulta del Módulo 5' })
      setShowModulo5(true)
      return
    }
    setLoading(true)
    try {
      // Upsert paciente by DNI
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
        }).select().single()
        if (errPac) throw errPac
        pacienteId = nuevo.id
      }

      // Create solicitud
      const { data: sol, error: errSol } = await supabase.from('solicitudes').insert({
        paciente_id: pacienteId,
        profesional_id: user.id,
        modulo: form.modulo,
        sesiones: parseInt(form.sesiones) || null,
        frecuencia: form.frecuencia || null,
        diagnostico: form.diagnostico || null,
        prioridad: form.prioridad,
        estado: 'pendiente',
        psiquiatra_articulante: form.modulo === 5 ? form.psiquiatra_articulante : null,
        fecha_solicitud: new Date().toISOString(),
      }).select().single()
      if (errSol) throw errSol

      // Guardar la observación inicial como primer comentario del paciente
      if (form.observaciones.trim()) {
        await supabase.from('comentarios').insert({
          solicitud_id: sol.id,
          usuario_id: user.id,
          texto: form.observaciones.trim(),
          fecha: new Date().toISOString(),
        })
      }

      // Notify admin(s)
      const { data: admins } = await supabase.from('usuarios').select('id').eq('rol', 'administrativo')
      if (admins?.length) {
        await supabase.from('notificaciones').insert(
          admins.map(a => ({
            destinatario_id: a.id,
            tipo: 'nueva_solicitud',
            mensaje: `${form.apellido} ${form.nombre} — Nueva solicitud Módulo ${form.modulo}`,
            solicitud_id: sol.id,
            leida: false,
            fecha: new Date().toISOString(),
          }))
        )
      }
      setPopup({ type: 'success', msg: 'Solicitud cargada exitosamente' })
    } catch {
      setPopup({ type: 'error', msg: 'Error al cargar la Solicitud. Inténtelo nuevamente.' })
    }
    setLoading(false)
  }

  const cfg = form.modulo ? modulosConfig[form.modulo] : null

  return (
    <div className="min-h-screen bg-page-bg font-roboto pb-8">
      <TopBar title="Nueva Solicitud" showBack rol="profesional_sm" />

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Datos del Paciente */}
        <div className="bg-surface rounded-2xl p-4">
          <h2 className="text-xs font-medium text-profesional-sm-primary uppercase tracking-wider mb-3">Datos del Paciente</h2>
          <div className="space-y-3">
            <Field label="Apellido y Nombre *">
              <div className="grid grid-cols-2 gap-2">
                <input value={form.apellido} onChange={e => setForm(f => ({ ...f, apellido: e.target.value }))} placeholder="Apellido" className="input-field" />
                <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Nombre" className="input-field" />
              </div>
            </Field>
            <Field label="Documento">
              <input value={form.dni} onChange={e => setForm(f => ({ ...f, dni: e.target.value }))} placeholder="DNI" className="input-field" />
            </Field>
            <Field label="Fecha de Nacimiento">
              <input type="date" value={form.fecha_nacimiento} onChange={e => setForm(f => ({ ...f, fecha_nacimiento: e.target.value }))} className="input-field" />
            </Field>
            <Field label="Obra Social">
              <input value={form.obra_social} onChange={e => setForm(f => ({ ...f, obra_social: e.target.value }))} placeholder="Obra Social" className="input-field" />
            </Field>
          </div>
        </div>

        {/* Módulo */}
        <div className="bg-surface rounded-2xl p-4">
          <h2 className="text-xs font-medium text-profesional-sm-primary uppercase tracking-wider mb-3">Módulo</h2>
          <div className="grid grid-cols-3 gap-2">
            {[1,2,3,4,5].map(m => (
              <button
                key={m}
                onClick={() => selectModulo(m)}
                className={`py-3 rounded-lg text-sm font-medium border transition-colors ${
                  form.modulo === m
                    ? 'bg-profesional-sm-primary text-white border-profesional-sm-primary'
                    : 'bg-white text-text-primary border-border hover:border-profesional-sm-primary'
                }`}
              >
                Módulo {m}
              </button>
            ))}
          </div>

          {form.modulo && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Field label="Frecuencia">
                {cfg.frecuenciaLocked ? (
                  <div className="input-field-readonly">{form.frecuencia || '—'}</div>
                ) : (
                  <select value={form.frecuencia} onChange={e => setForm(f => ({ ...f, frecuencia: e.target.value }))} className="input-field">
                    <option value="">Seleccionar</option>
                    {frecuencias.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                )}
              </Field>
              <Field label="Cant. Sesiones">
                {cfg.sesionesLocked ? (
                  <div className="input-field-readonly">{form.sesiones}</div>
                ) : (
                  <input
                    type="number"
                    min={form.modulo === 3 ? 8 : 1}
                    max={form.modulo === 3 ? 12 : 999}
                    value={form.sesiones}
                    onChange={e => setForm(f => ({ ...f, sesiones: e.target.value }))}
                    placeholder={form.modulo === 3 ? '8-12' : 'Cantidad'}
                    className="input-field"
                  />
                )}
              </Field>
            </div>
          )}

          {form.modulo === 5 && (
            <div className="mt-3">
              <Field label="Tipo de consulta *">
                <button
                  type="button"
                  onClick={() => setShowModulo5(true)}
                  className="w-full text-left input-field flex items-center justify-between"
                >
                  <span className={form.psiquiatra_articulante ? 'text-text-primary' : 'text-text-secondary'}>
                    {form.psiquiatra_articulante || 'Seleccionar tipo de consulta'}
                  </span>
                  <span className="text-xs text-profesional-sm-primary font-medium">Editar</span>
                </button>
              </Field>
            </div>
          )}
        </div>

        {/* Diagnóstico y Prioridad */}
        <div className="bg-surface rounded-2xl p-4 space-y-3">
          <Field label="Diagnóstico">
            <input value={form.diagnostico} onChange={e => setForm(f => ({ ...f, diagnostico: e.target.value }))} placeholder="Diagnóstico" className="input-field" />
          </Field>
          <Field label="Prioridad *">
            <select value={form.prioridad} onChange={e => setForm(f => ({ ...f, prioridad: e.target.value }))} className="input-field">
              <option value="">Seleccionar</option>
              {PRIORIDADES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </Field>
          <Field label="Observaciones iniciales">
            <textarea
              value={form.observaciones}
              onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))}
              rows={3}
              placeholder="Comentario inicial sobre el paciente (opcional)"
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary outline-none focus:border-profesional-sm-primary resize-none"
            />
          </Field>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full py-3 rounded-lg bg-profesional-sm-primary text-white font-medium text-sm disabled:opacity-60"
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      {showModulo5 && (
        <PopupModulo5
          initial={modulo5Sel}
          onContinuar={handleModulo5Continuar}
          onClose={() => setShowModulo5(false)}
        />
      )}

      {popup?.type === 'success' && <PopupSuccess message={popup.msg} onClose={() => navigate('/sm/panel')} />}
      {popup?.type === 'error' && <PopupError message={popup.msg} onClose={() => setPopup(null)} />}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs text-text-secondary mb-1">{label}</label>
      {children}
    </div>
  )
}
