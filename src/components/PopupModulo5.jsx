import React, { useState } from 'react'

/**
 * Popup que aparece al seleccionar Módulo 5 en Nueva Solicitud (Profesional SM).
 * Permite elegir el tipo de consulta (Grupo GIA / Adicciones) y observaciones.
 * El resultado se guarda en solicitudes.psiquiatra_articulante.
 */
export default function PopupModulo5({ initial, onContinuar, onClose }) {
  const [grupoGia, setGrupoGia] = useState(initial?.grupoGia || false)
  const [adicciones, setAdicciones] = useState(initial?.adicciones || false)
  const [observaciones, setObservaciones] = useState(initial?.observaciones || '')

  const handleContinuar = () => {
    const tipos = []
    if (grupoGia) tipos.push('Grupo GIA')
    if (adicciones) tipos.push('Adicciones')
    const texto = tipos.join(', ') + (observaciones.trim() ? ` — Obs: ${observaciones.trim()}` : '')
    onContinuar({ grupoGia, adicciones, observaciones, texto })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-xs w-full shadow-xl overflow-hidden border border-border">
        <div className="px-5 pt-5 pb-2">
          <h2 className="text-base font-medium text-profesional-sm-primary">Módulo 5</h2>
          <p className="text-xs text-text-secondary mt-1">
            Seleccione el tipo de consulta a la que debe asistir el paciente
          </p>
        </div>

        <div className="px-5 py-2 space-y-2.5">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={grupoGia}
              onChange={e => setGrupoGia(e.target.checked)}
              className="w-4 h-4 rounded border-border accent-[#534AB7]"
            />
            <span className="text-sm text-text-primary">Grupo GIA</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={adicciones}
              onChange={e => setAdicciones(e.target.checked)}
              className="w-4 h-4 rounded border-border accent-[#534AB7]"
            />
            <span className="text-sm text-text-primary">Adicciones</span>
          </label>
        </div>

        <div className="px-5 py-2">
          <label className="block text-xs text-text-secondary mb-1">Observaciones</label>
          <textarea
            value={observaciones}
            onChange={e => setObservaciones(e.target.value)}
            rows={3}
            placeholder="observaciones"
            className="w-full border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-profesional-sm-primary resize-none"
          />
        </div>

        <div className="px-5 pb-5 pt-2 flex gap-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-border text-sm text-text-secondary"
            >
              Cancelar
            </button>
          )}
          <button
            type="button"
            onClick={handleContinuar}
            className="flex-1 py-2.5 rounded-lg bg-profesional-sm-primary text-white text-sm font-medium"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  )
}
