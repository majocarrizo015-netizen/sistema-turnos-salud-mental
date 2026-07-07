import React, { useState } from 'react'

/**
 * Logo del Hospital SAMIC El Calafate.
 *
 * Usa el archivo institucional ubicado en `public/logo.png`.
 * Si ese archivo no existe todavía, muestra una recreación vectorial como
 * respaldo (para no dejar una imagen rota).
 *
 * Para usar el logo oficial: guardá el PNG en la carpeta `public/` del
 * proyecto con el nombre exacto `logo.png`.
 */
export default function Logo({ className = 'w-20 h-20' }) {
  const [error, setError] = useState(false)

  if (!error) {
    return (
      <img
        src="/logo.png"
        alt="Hospital SAMIC El Calafate"
        className={`${className} object-contain`}
        onError={() => setError(true)}
      />
    )
  }

  // Respaldo vectorial si aún no se cargó public/logo.png
  return (
    <svg className={className} viewBox="0 0 200 260" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Hospital SAMIC El Calafate">
      <defs>
        <linearGradient id="logoRed" x1="60" y1="40" x2="170" y2="230" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E7332B" />
          <stop offset="1" stopColor="#8E1F1B" />
        </linearGradient>
        <linearGradient id="logoBlue" x1="20" y1="60" x2="180" y2="240" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3FB4E8" />
          <stop offset="1" stopColor="#1E7FC2" />
        </linearGradient>
      </defs>
      <path d="M118 44c14-6 40-4 52 14 14 20 8 44-6 66-16 26-44 52-74 84-8-30-24-52-40-70-14-16-22-34-14-52 8-18 30-24 46-16 12 6 20 18 24 30 3-24 8-46 12-56z" fill="url(#logoRed)" />
      <path d="M150 20c22 26 30 60 14 96-16 36-48 68-84 100 34-40 58-78 66-114 6-28 2-58-8-84 4 0 8 1 12 2z" fill="url(#logoBlue)" />
      <path d="M96 96c-10-16-30-22-46-12-12 8-14 24-6 38 10 18 26 34 44 52-6-24-4-46 8-64 2-6 0-10 0-14z" fill="#FFFFFF" />
      <path d="M92 100c-8-12-24-16-36-8-10 8-10 22-2 34 8 14 20 26 34 40-4-20-2-40 8-54 0-4-2-8-4-12z" fill="url(#logoBlue)" />
      <circle cx="128" cy="82" r="7" fill="#28B7E0" stroke="#0E6FA3" strokeWidth="2" />
      <circle cx="100" cy="120" r="7" fill="#28B7E0" stroke="#0E6FA3" strokeWidth="2" />
      <circle cx="70" cy="222" r="7" fill="#28B7E0" stroke="#0E6FA3" strokeWidth="2" />
    </svg>
  )
}
