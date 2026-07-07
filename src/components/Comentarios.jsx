import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'

/**
 * Registro de comentarios de una solicitud/paciente.
 * - Todos los roles VEN los comentarios en orden cronológico (autor + fecha/hora).
 * - Sólo profesional_sm y medico_aps pueden AGREGAR comentarios (canAdd).
 * - Los comentarios no son editables ni eliminables: son registro permanente.
 *
 * @param {string} solicitudId
 * @param {object} user   usuario logueado ({ id, nombre, apellido })
 * @param {boolean} canAdd
 * @param {string} accent color primario del rol (para el botón)
 */
export default function Comentarios({ solicitudId, user, canAdd = false, accent = '#534AB7' }) {
  const [comentarios, setComentarios] = useState([])
  const [texto, setTexto] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchComentarios = useCallback(async () => {
    const { data } = await supabase
      .from('comentarios')
      .select('*, usuarios(nombre, apellido)')
      .eq('solicitud_id', solicitudId)
      .order('fecha', { ascending: true })
    if (data) setComentarios(data)
  }, [solicitudId])

  useEffect(() => {
    if (solicitudId) fetchComentarios()
  }, [solicitudId, fetchComentarios])

  const handleAgregar = async () => {
    if (!texto.trim()) return
    setSaving(true)
    const { error } = await supabase.from('comentarios').insert({
      solicitud_id: solicitudId,
      usuario_id: user.id,
      texto: texto.trim(),
      fecha: new Date().toISOString(),
    })
    if (!error) {
      setTexto('')
      await fetchComentarios()
    }
    setSaving(false)
  }

  const formatFecha = (f) => {
    if (!f) return ''
    const d = new Date(f)
    return d.toLocaleDateString('es-AR') + ' · ' + d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="bg-white rounded-lg border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="text-xs font-medium text-text-secondary uppercase tracking-wider">Comentarios</h2>
      </div>

      <div className="divide-y divide-border">
        {comentarios.length === 0 ? (
          <p className="px-4 py-4 text-sm text-text-secondary text-center">Sin comentarios registrados</p>
        ) : (
          comentarios.map(c => (
            <div key={c.id} className="px-4 py-3">
              <p className="text-sm text-text-primary whitespace-pre-wrap">{c.texto}</p>
              <p className="text-xs text-text-secondary mt-1">
                {c.usuarios ? `${c.usuarios.nombre} ${c.usuarios.apellido}` : 'Usuario'} · {formatFecha(c.fecha)}
              </p>
            </div>
          ))
        )}
      </div>

      {canAdd && (
        <div className="px-4 py-3 border-t border-border space-y-2">
          <textarea
            value={texto}
            onChange={e => setTexto(e.target.value)}
            rows={2}
            placeholder="Escribir un comentario..."
            className="w-full border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none resize-none"
          />
          <button
            onClick={handleAgregar}
            disabled={saving || !texto.trim()}
            className="w-full py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-50"
            style={{ backgroundColor: accent }}
          >
            {saving ? 'Guardando...' : 'Agregar comentario'}
          </button>
        </div>
      )}
    </div>
  )
}
