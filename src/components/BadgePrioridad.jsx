import React from 'react'

// Prioridades vigentes: alta (rojo) / moderada (amarillo) / programada (verde)
const config = {
  alta: { label: 'Alta', bg: '#FCEBEB', color: '#E24B4A' },
  moderada: { label: 'Moderada', bg: '#FAEEDA', color: '#EF9F27' },
  programada: { label: 'Programada', bg: '#E1F5EE', color: '#1D9E75' },
  // Compatibilidad con registros previos
  urgente: { label: 'Alta', bg: '#FCEBEB', color: '#E24B4A' },
  prioritario: { label: 'Alta', bg: '#FCEBEB', color: '#E24B4A' },
  programado: { label: 'Programada', bg: '#E1F5EE', color: '#1D9E75' },
}

export default function BadgePrioridad({ prioridad }) {
  if (!prioridad) return null
  const c = config[prioridad] || { label: prioridad, bg: '#F1EFE8', color: '#888780' }
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
      style={{ backgroundColor: c.bg, color: c.color, borderColor: c.color }}
    >
      {c.label}
    </span>
  )
}

// Opciones para dropdowns/selectores de prioridad en formularios
export const PRIORIDADES = [
  { value: 'alta', label: 'Alta' },
  { value: 'moderada', label: 'Moderada' },
  { value: 'programada', label: 'Programada' },
]
