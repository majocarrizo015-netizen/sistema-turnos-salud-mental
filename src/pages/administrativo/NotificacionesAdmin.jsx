import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotificaciones } from '../../hooks/useNotificaciones'
import TopBar from '../../components/TopBar'

const tabs = ['Todas', 'No Leídas', 'Leídas']

const tipoLabels = {
  nueva_solicitud: 'Nueva solicitud',
  ampliacion: 'Ampliación de sesiones',
  modulo_completo: 'Módulo completo',
  protocolo_faltas: 'Protocolo de faltas',
}

export default function NotificacionesAdmin() {
  const navigate = useNavigate()
  const { notificaciones, markAllAsRead } = useNotificaciones()
  const [activeTab, setActiveTab] = useState('Todas')

  useEffect(() => {
    markAllAsRead()
  }, [])

  const filtered = notificaciones.filter(n => {
    if (activeTab === 'No Leídas') return !n.leida
    if (activeTab === 'Leídas') return n.leida
    return true
  })

  const today = new Date().toDateString()
  const hoy = filtered.filter(n => new Date(n.fecha).toDateString() === today)
  const anteriores = filtered.filter(n => new Date(n.fecha).toDateString() !== today)

  const handleClick = (n) => {
    if (n.solicitud_id) navigate(`/admin/asistencia/${n.solicitud_id}`)
  }

  return (
    <div className="min-h-screen bg-page-bg">
      <TopBar title="Notificaciones" showBack backTo="/admin/panel" rol="administrativo" />

      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex gap-1 mb-4 bg-white rounded-xl p-1 border border-border">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === t ? 'bg-administrativo-primary text-white' : 'text-text-secondary'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-10 text-text-secondary text-sm">No hay notificaciones</div>
        ) : (
          <>
            {hoy.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">Hoy</p>
                <div className="space-y-2">
                  {hoy.map(n => <NotifCard key={n.id} n={n} onClick={handleClick} />)}
                </div>
              </div>
            )}
            {anteriores.length > 0 && (
              <div>
                <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">Anteriores</p>
                <div className="space-y-2">
                  {anteriores.map(n => <NotifCard key={n.id} n={n} onClick={handleClick} />)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function NotifCard({ n, onClick }) {
  const date = new Date(n.fecha)
  const tipo = tipoLabels[n.tipo] || n.tipo
  return (
    <button
      onClick={() => onClick(n)}
      className={`w-full text-left p-4 rounded-xl border transition-colors ${n.leida ? 'bg-white border-border' : 'bg-administrativo-light border-administrativo-primary/30'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-administrativo-primary mb-0.5">{tipo}</p>
          <p className="text-sm text-text-primary">{n.mensaje}</p>
        </div>
        {!n.leida && <div className="w-2 h-2 rounded-full bg-administrativo-primary flex-shrink-0 mt-1.5" />}
      </div>
      <p className="text-xs text-text-secondary mt-1.5">
        {date.toLocaleDateString('es-AR')} {date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
      </p>
    </button>
  )
}
