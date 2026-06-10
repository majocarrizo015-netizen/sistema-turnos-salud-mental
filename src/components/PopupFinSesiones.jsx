import React from 'react'

export default function PopupFinSesiones({ modulo, onEnviarHistorial, onAgregarSesiones }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-xl p-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-programado-bg flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-programado" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-base font-medium text-text-primary mb-1">Fin de Sesiones</h3>
          <p className="text-sm text-text-secondary mb-5">
            El Paciente completó las sesiones programadas Módulo {modulo}
          </p>
          <div className="flex flex-col gap-2 w-full">
            <button
              onClick={onEnviarHistorial}
              className="w-full py-2.5 rounded-lg border border-border text-sm text-text-primary font-medium hover:bg-gray-50"
            >
              Enviar a Historial
            </button>
            <button
              onClick={onAgregarSesiones}
              className="w-full py-2.5 rounded-lg bg-administrativo-primary text-white text-sm font-medium"
            >
              Agregar Sesiones
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
