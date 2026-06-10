import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

import Login from './pages/Login'

// SM
import PanelSM from './pages/profesional_sm/PanelSM'
import NuevaSolicitudSM from './pages/profesional_sm/NuevaSolicitudSM'
import FichaPacienteSM from './pages/profesional_sm/FichaPacienteSM'
import AmpliacionSesiones from './pages/profesional_sm/AmpliacionSesiones'
import NotificacionesSM from './pages/profesional_sm/NotificacionesSM'
import HistorialSM from './pages/profesional_sm/HistorialSM'

// Admin
import PanelAdmin from './pages/administrativo/PanelAdmin'
import Calendarizacion from './pages/administrativo/Calendarizacion'
import FichaAsistencia from './pages/administrativo/FichaAsistencia'
import AgregarSesionesAdmin from './pages/administrativo/AgregarSesionesAdmin'
import NotificacionesAdmin from './pages/administrativo/NotificacionesAdmin'
import HistorialAdmin from './pages/administrativo/HistorialAdmin'

// APS
import PanelAPS from './pages/medico_aps/PanelAPS'
import NuevaSolicitudAPS from './pages/medico_aps/NuevaSolicitudAPS'
import FichaPacienteAPS from './pages/medico_aps/FichaPacienteAPS'
import NotificacionesAPS from './pages/medico_aps/NotificacionesAPS'
import HistorialAPS from './pages/medico_aps/HistorialAPS'

function PrivateRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen bg-page-bg"><div className="text-text-secondary">Cargando...</div></div>
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.rol)) return <Navigate to="/login" replace />
  return children
}

function RoleRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen bg-page-bg"><div className="text-text-secondary">Cargando...</div></div>
  if (!user) return <Navigate to="/login" replace />
  if (user.rol === 'profesional_sm') return <Navigate to="/sm/panel" replace />
  if (user.rol === 'administrativo') return <Navigate to="/admin/panel" replace />
  if (user.rol === 'medico_aps') return <Navigate to="/aps/panel" replace />
  return <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RoleRedirect />} />

          {/* SM Routes */}
          <Route path="/sm/panel" element={<PrivateRoute allowedRoles={['profesional_sm']}><PanelSM /></PrivateRoute>} />
          <Route path="/sm/nueva-solicitud" element={<PrivateRoute allowedRoles={['profesional_sm']}><NuevaSolicitudSM /></PrivateRoute>} />
          <Route path="/sm/ficha/:solicitudId" element={<PrivateRoute allowedRoles={['profesional_sm']}><FichaPacienteSM /></PrivateRoute>} />
          <Route path="/sm/ampliacion/:solicitudId" element={<PrivateRoute allowedRoles={['profesional_sm']}><AmpliacionSesiones /></PrivateRoute>} />
          <Route path="/sm/notificaciones" element={<PrivateRoute allowedRoles={['profesional_sm']}><NotificacionesSM /></PrivateRoute>} />
          <Route path="/sm/historial" element={<PrivateRoute allowedRoles={['profesional_sm']}><HistorialSM /></PrivateRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/panel" element={<PrivateRoute allowedRoles={['administrativo']}><PanelAdmin /></PrivateRoute>} />
          <Route path="/admin/calendarizacion/:solicitudId" element={<PrivateRoute allowedRoles={['administrativo']}><Calendarizacion /></PrivateRoute>} />
          <Route path="/admin/asistencia/:solicitudId" element={<PrivateRoute allowedRoles={['administrativo']}><FichaAsistencia /></PrivateRoute>} />
          <Route path="/admin/agregar-sesiones/:solicitudId" element={<PrivateRoute allowedRoles={['administrativo']}><AgregarSesionesAdmin /></PrivateRoute>} />
          <Route path="/admin/notificaciones" element={<PrivateRoute allowedRoles={['administrativo']}><NotificacionesAdmin /></PrivateRoute>} />
          <Route path="/admin/historial" element={<PrivateRoute allowedRoles={['administrativo']}><HistorialAdmin /></PrivateRoute>} />

          {/* APS Routes */}
          <Route path="/aps/panel" element={<PrivateRoute allowedRoles={['medico_aps']}><PanelAPS /></PrivateRoute>} />
          <Route path="/aps/nueva-solicitud" element={<PrivateRoute allowedRoles={['medico_aps']}><NuevaSolicitudAPS /></PrivateRoute>} />
          <Route path="/aps/ficha/:solicitudId" element={<PrivateRoute allowedRoles={['medico_aps']}><FichaPacienteAPS /></PrivateRoute>} />
          <Route path="/aps/notificaciones" element={<PrivateRoute allowedRoles={['medico_aps']}><NotificacionesAPS /></PrivateRoute>} />
          <Route path="/aps/historial" element={<PrivateRoute allowedRoles={['medico_aps']}><HistorialAPS /></PrivateRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
