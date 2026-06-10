import React from 'react'

export default function PopupSuccess({ message, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-programado-bg flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-programado" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-2">¡Éxito!</h3>
          <p className="text-text-secondary text-sm mb-5">{message}</p>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg bg-programado text-white font-medium text-sm"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  )
}
