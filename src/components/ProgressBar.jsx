import React from 'react'

export default function ProgressBar({ completed, total, color = '#534AB7' }) {
  const pct = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0
  return (
    <div className="w-full">
      <div className="flex text-xs text-text-secondary mb-1">
        <span>{completed} / {total} sesiones</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}
