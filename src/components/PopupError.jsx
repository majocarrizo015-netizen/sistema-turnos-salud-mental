import React from 'react'

export default function PopupError({ message, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-urgente-bg flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-urgente" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-2">Error</h3>
          <p className="text-text-secondary text-sm mb-5">{message}</p>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-urgente text-white font-medium text-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
