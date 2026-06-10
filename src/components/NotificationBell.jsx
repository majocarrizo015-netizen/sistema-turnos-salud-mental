import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotificaciones } from '../hooks/useNotificaciones'

export default function NotificationBell({ rol }) {
  const { unreadCount } = useNotificaciones()
  const navigate = useNavigate()

  const handleClick = () => {
    if (rol === 'profesional_sm') navigate('/sm/notificaciones')
    else if (rol === 'administrativo') navigate('/admin/notificaciones')
    else if (rol === 'medico_aps') navigate('/aps/notificaciones')
  }

  return (
    <button
      onClick={handleClick}
      className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors relative"
    >
      <svg className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 w-4 h-4 bg-urgente text-white text-xs rounded-full flex items-center justify-center font-medium leading-none">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  )
}
