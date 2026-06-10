import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../../components/TopBar'
import { useNotificaciones } from '../../hooks/useNotificaciones'

const tabs = ['Todas', 'No Leídas', 'Leídas']

export default function NotificacionesAPS() {
  const navigate = useNavigate()
  const { notificaciones, fetchNotificaciones, markAllAsRead } = useNotificaciones()
  const [tab, setTab] = useState('Todas')

  useEffect(() => {
    fetchNotificaciones()
    markAllAsRead()
  }, [])

  const filtered = notificaciones.filter(n => {
    if (tab === 'No Leídas') return !n.leida
    if (tab === 'Leídas') return n.leida
    return true
  })

  const today = new Date().toDateString()
  const hoy = filtered.filter(n => new Date(n.fecha).toDateString() === today)
  const anteriores = filtered.filter(n => new Date(n.fecha).toDateString() !== today)

  return (
    <div className="min-h-screen bg-page-bg font-roboto">
      <TopBar title="Medico APS" subtitle="Notificaciones" showBack rol="medico_aps" />

      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex gap-1 bg-surface rounded-xl p-1 mb-4">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${tab === t ? 'bg-medico-aps-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}>
              {t}
            </button>
          ))}
        </div>

        {hoy.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-text-secondary uppercase tracking-wider mb-2">Hoy</p>
            <div className="space-y-1">{hoy.map(n => <NotifCard key={n.id} n={n} onClick={() => n.solicitud_id && navigate(`/aps/ficha/${n.solicitud_id}`)} />)}</div>
          </div>
        )}
        {anteriores.length > 0 && (
          <div>
            <p className="text-xs text-text-secondary uppercase tracking-wider mb-2">Anteriores</p>
            <div className="space-y-1">{anteriores.map(n => <NotifCard key={n.id} n={n} onClick={() => n.solicitud_id && navigate(`/aps/ficha/${n.solicitud_id}`)} />)}</div>
          </div>
        )}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-text-secondary text-sm">No hay notificaciones</p>
          </div>
        )}
      </div>
    </div>
  )
}

function NotifCard({ n, onClick }) {
  return (
    <button onClick={onClick} className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-left hover:shadow-sm flex items-start gap-3">
      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.leida ? 'bg-border' : 'bg-medico-aps-primary'}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-primary">{n.mensaje}</p>
        <p className="text-xs text-text-secondary mt-0.5">{new Date(n.fecha).toLocaleString('es-AR')}</p>
      </div>
      <svg className="w-4 h-4 text-text-secondary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  )
}
