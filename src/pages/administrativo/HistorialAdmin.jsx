import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase'
import TopBar from '../../components/TopBar'
import BadgePrioridad from '../../components/BadgePrioridad'

export default function HistorialAdmin() {
  const navigate = useNavigate()
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase
        .from('solicitudes')
        .select('*, pacientes(*), usuarios(nombre, apellido, matricula)')
        .in('estado', ['finalizado', 'baja_protocolo'])
        .order('fecha_solicitud', { ascending: false })
      if (data) setSolicitudes(data)
      setLoading(false)
    }
    fetchData()
  }, [])

  const filtered = solicitudes.filter(s => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      s.pacientes?.nombre?.toLowerCase().includes(q) ||
      s.pacientes?.apellido?.toLowerCase().includes(q) ||
      s.pacientes?.dni?.includes(q) ||
      s.usuarios?.nombre?.toLowerCase().includes(q) ||
      s.usuarios?.apellido?.toLowerCase().includes(q)
    )
  })

  const estadoConfig = {
    finalizado: { label: 'Finalizado', color: '#1D9E75', bg: '#E1F5EE' },
    baja_protocolo: { label: 'Baja Protocolo', color: '#993C1D', bg: '#FAECE7' },
  }

  return (
    <div className="min-h-screen bg-page-bg">
      <TopBar title="Historial" showBack backTo="/admin/panel" rol="administrativo" />

      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="relative mb-4">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar paciente o profesional..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-border bg-white text-sm text-text-primary outline-none focus:border-administrativo-primary"
          />
        </div>

        {loading ? (
          <div className="text-center py-10 text-text-secondary text-sm">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-text-secondary text-sm">Sin registros en historial</div>
        ) : (
          <div className="space-y-2">
            {filtered.map(s => {
              const cfg = estadoConfig[s.estado] || { label: s.estado, color: '#888780', bg: '#F1EFE8' }
              return (
                <div
                  key={s.id}
                  onClick={() => navigate(`/admin/asistencia/${s.id}`)}
                  className="bg-white rounded-lg border border-border p-4 cursor-pointer hover:border-administrativo-primary transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-text-primary text-sm">{s.pacientes?.apellido}, {s.pacientes?.nombre}</p>
                      <p className="text-xs text-text-secondary">DNI: {s.pacientes?.dni} · Módulo {s.modulo}</p>
                      <p className="text-xs text-text-secondary">{s.usuarios?.nombre} {s.usuarios?.apellido}</p>
                      <p className="text-xs text-text-secondary mt-0.5">{new Date(s.fecha_solicitud).toLocaleDateString('es-AR')}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <BadgePrioridad prioridad={s.prioridad} />
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
