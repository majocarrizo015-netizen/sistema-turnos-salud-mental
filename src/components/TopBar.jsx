import React from 'react'
import { useNavigate } from 'react-router-dom'
import NotificationBell from './NotificationBell'
import HamburgerMenu from './HamburgerMenu'
import Logo from './Logo'

export default function TopBar({ title, subtitle, showBack = false, backTo, rol }) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (backTo) {
      navigate(backTo)
    } else {
      navigate(-1)
    }
  }

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
            <Logo className="w-8 h-9 flex-shrink-0" />
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
