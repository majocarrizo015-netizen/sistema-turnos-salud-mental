import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase'
import { useAuth } from '../../context/AuthContext'
import TopBar from '../../components/TopBar'
import BadgePrioridad from '../../components/BadgePrioridad'

export default function HistorialAPS() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [list, setList] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [user])

  const fetchData = async () => {
    const { data } = await supabase.from('solicitudes').select('*, pacientes(*)').eq('profesional_id', user.id).in('estado', ['finalizado', 'baja_protocolo']).order('fecha_solicitud', { ascending: false })
    setList(data || [])
    setLoading(false)
  }

  const filtered = list.filter(s => {
    if (!search) return true
    const q = search.toLowerCase()
    return s.pacientes?.nombre?.toLowerCase().includes(q) || s.pacientes?.apellido?.toLowerCase().includes(q) || s.pacientes?.dni?.includes(q)
  })

  return (
    <div className="min-h-screen bg-page-bg font-roboto pb-8">
      <TopBar title="Historial" showBack rol="medico_aps" />
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar" className="w-full bg-surface border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none" />
        </div>
        {loading ? <p className="text-center text-text-secondary text-sm py-8">Cargando...</p>
          : filtered.length === 0 ? <p className="text-center text-text-secondary text-sm py-8">No registra Pacientes</p>
          : filtered.map(s => (
            <button key={s.id} onClick={() => navigate(`/aps/ficha/${s.id}`)} className="w-full bg-surface border border-border rounded-2xl p-4 text-left hover:shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-text-secondary" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">{s.pacientes?.apellido}, {s.pacientes?.nombre}</p>
                  <p className="text-xs text-text-secondary">Módulo {s.modulo} · {s.estado === 'baja_protocolo' ? 'Baja protocolo' : 'Finalizado'}</p>
                </div>
                <BadgePrioridad prioridad={s.prioridad} />
              </div>
            </button>
          ))
        }
      </div>
    </div>
  )
}
