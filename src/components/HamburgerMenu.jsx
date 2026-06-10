import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const menuItems = {
  profesional_sm: [
    { label: 'Listado de Pacientes', path: '/sm/panel' },
    { label: 'Nueva Solicitud', path: '/sm/nueva-solicitud' },
    { label: 'Historial de Pacientes', path: '/sm/historial' },
  ],
  administrativo: [
    { label: 'Nuevas Solicitudes', path: '/admin/panel' },
    { label: 'Pacientes en Tratamiento', path: '/admin/panel' },
    { label: 'Historial de Pacientes', path: '/admin/historial' },
    { label: 'Ampliación de Sesiones', path: '/admin/panel' },
  ],
  medico_aps: [
    { label: 'Mis Derivaciones', path: '/aps/panel' },
    { label: 'Nueva Interconsulta', path: '/aps/nueva-solicitud' },
    { label: 'Historial de Pacientes', path: '/aps/historial' },
  ],
}

const rolBg = {
  profesional_sm: '#534AB7',
  administrativo: '#0F6E56',
  medico_aps: '#7C3AAB',
}

export default function HamburgerMenu({ rol }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const items = menuItems[rol] || []
  const bg = rolBg[rol] || '#534AB7'

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
      >
        <svg className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setOpen(false)} />
          <div className="w-64 flex flex-col shadow-2xl" style={{ backgroundColor: bg }}>
            <div className="px-4 py-5 border-b border-white/20 flex justify-between items-start">
              <div>
                <p className="text-white font-medium text-sm">{user?.nombre} {user?.apellido}</p>
                {user?.matricula && <p className="text-white/70 text-xs">Mat. Prov {user.matricula}</p>}
              </div>
              <button onClick={() => setOpen(false)}>
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 py-2">
              {items.map(item => (
                <button
                  key={item.label}
                  onClick={() => { navigate(item.path); setOpen(false) }}
                  className="w-full text-left px-4 py-3 text-white text-sm hover:bg-white/10 flex items-center justify-between"
                >
                  {item.label}
                  <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); setOpen(false) }}
              className="px-4 py-4 text-white text-sm text-left hover:bg-white/10 border-t border-white/20"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </>
  )
}
