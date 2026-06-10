import React from 'react'

const labels = {
  semanal: 'Semanal',
  quincenal: 'Quincenal',
  mensual: 'Mensual',
  a_definir: 'A definir',
}

export default function BadgeFrecuencia({ frecuencia }) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-text-secondary border border-border">
      {labels[frecuencia] || frecuencia}
    </span>
  )
}
