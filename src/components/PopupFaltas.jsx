import React, { useState } from 'react'

export default function PopupFaltas({ data, onJustificar, onActivarProtocolo, onClose }) {
  const [justificacion, setJustificacion] = useState('')
  const [modo, setModo] = useState(null)

  if (!data) return null
  const { solicitud, sesionesAusentes } = data
  const paciente = solicitud.pacientes

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-xl overflow-hidden">
        <div className="bg-protocolo-bg px-5 py-4 flex items-center gap-3 border-b border-border">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-protocolo" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-text-primary text-sm">Protocolo de Faltas</p>
            <p className="text-xs text-text-secondary">El Paciente {paciente?.apellido}, {paciente?.nombre} no ha asistido a las sesiones los días:</p>
          </div>
        </div>

        <div className="px-5 py-3">
          {sesionesAusentes.map(s => (
            <p key={s.id} className="text-sm text-text-secondary">• Sesión {s.numero} — {s.fecha ? new Date(s.fecha).toLocaleDateString('es-AR') : 'sin fecha'}</p>
          ))}
        </div>

        {modo === 'justificar' ? (
          <div className="px-5 pb-5">
            <textarea
              value={justificacion}
              onChange={e => setJustificacion(e.target.value)}
              placeholder="Ingrese la justificación..."
              className="w-full border border-border rounded-xl p-3 text-sm text-text-primary resize-none h-24 focus:outline-none focus:border-protocolo"
            />
            <div className="flex gap-2 mt-3">
              <button onClick={() => setModo(null)} className="flex-1 py-2.5 rounded-xl border border-border text-sm text-text-secondary">Cancelar</button>
              <button
                onClick={() => onJustificar(sesionesAusentes[sesionesAusentes.length - 1].id, justificacion)}
                disabled={!justificacion.trim()}
                className="flex-1 py-2.5 rounded-xl bg-protocolo text-white text-sm font-medium disabled:opacity-50"
              >
                Guardar
              </button>
            </div>
          </div>
        ) : (
          <div className="px-5 pb-5 flex flex-col gap-2">
            <button
              onClick={() => setModo('justificar')}
              className="w-full py-2.5 rounded-xl border border-border text-sm text-text-primary font-medium hover:bg-gray-50"
            >
              Justificar Falta
            </button>
            <button
              onClick={() => onActivarProtocolo(solicitud.id)}
              className="w-full py-2.5 rounded-xl text-white text-sm font-medium"
              style={{ backgroundColor: '#993C1D' }}
            >
              Activar Protocolo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
