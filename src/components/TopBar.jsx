import React from 'react'
import { useNavigate } from 'react-router-dom'
import NotificationBell from './NotificationBell'
import HamburgerMenu from './HamburgerMenu'

export default function TopBar({ title, subtitle, showBack = false, backTo, rol }) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (backTo) {
      navigate(backTo)
    } else {
      navigate(-1)
    }
  }

  const primaryColor = {
    profesional_sm: '#534AB7',
    administrativo: '#0F6E56',
    medico_aps: '#7C3AAB',
  }[rol] || '#534AB7'

  return (
    <div className="bg-surface border-b border-border sticky top-0 z-30">
      <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {showBack && (
            <button
              onClick={handleBack}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              <svg className="w-5 h-5 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {!showBack && (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: primaryColor }}
            >
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
              </svg>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-medium text-text-primary truncate leading-tight">{title}</h1>
            {subtitle && <p className="text-xs text-text-secondary truncate leading-tight">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <NotificationBell rol={rol} />
          <HamburgerMenu rol={rol} />
        </div>
      </div>
    </div>
  )
}
