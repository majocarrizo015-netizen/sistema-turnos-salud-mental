import React from 'react'

const config = {
  urgente: { label: 'Urgente', bg: 'bg-urgente-bg', text: 'text-urgente', border: 'border-urgente' },
  prioritario: { label: 'Prioritario', bg: 'bg-prioritario-bg', text: 'text-prioritario', border: 'border-prioritario' },
  programado: { label: 'Programado', bg: 'bg-programado-bg', text: 'text-programado', border: 'border-programado' },
}

export default function BadgePrioridad({ prioridad }) {
  const c = config[prioridad] || { label: prioridad, bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${c.bg} ${c.text} ${c.border}`}>
      {c.label}
    </span>
  )
}
