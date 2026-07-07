import React from 'react'

/**
 * Logo del Hospital SAMIC El Calafate — corazón formado por un cuerpo rojo
 * y cintas azules entrelazadas. Recreación vectorial del isotipo institucional.
 *
 * Si contás con el archivo original (PNG/SVG), colocalo en src/assets/logo.png
 * e importalo reemplazando este SVG por <img src={logo} className={className} />.
 */
export default function Logo({ className = 'w-20 h-20' }) {
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

      {/* Cuerpo rojo del corazón */}
      <path
        d="M118 44c14-6 40-4 52 14 14 20 8 44-6 66-16 26-44 52-74 84-8-30-24-52-40-70-14-16-22-34-14-52 8-18 30-24 46-16 12 6 20 18 24 30 3-24 8-46 12-56z"
        fill="url(#logoRed)"
      />

      {/* Cinta azul exterior */}
      <path
        d="M150 20c22 26 30 60 14 96-16 36-48 68-84 100 34-40 58-78 66-114 6-28 2-58-8-84 4 0 8 1 12 2z"
        fill="url(#logoBlue)"
      />
      {/* Cinta azul interior / hueco del corazón */}
      <path
        d="M96 96c-10-16-30-22-46-12-12 8-14 24-6 38 10 18 26 34 44 52-6-24-4-46 8-64 2-6 0-10 0-14z"
        fill="#FFFFFF"
      />
      <path
        d="M92 100c-8-12-24-16-36-8-10 8-10 22-2 34 8 14 20 26 34 40-4-20-2-40 8-54 0-4-2-8-4-12z"
        fill="url(#logoBlue)"
      />

      {/* Nodos turquesa */}
      <circle cx="128" cy="82" r="7" fill="#28B7E0" stroke="#0E6FA3" strokeWidth="2" />
      <circle cx="100" cy="120" r="7" fill="#28B7E0" stroke="#0E6FA3" strokeWidth="2" />
      <circle cx="70" cy="222" r="7" fill="#28B7E0" stroke="#0E6FA3" strokeWidth="2" />
    </svg>
  )
}
