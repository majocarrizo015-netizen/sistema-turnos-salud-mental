import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const rolOptions = [
  { value: 'profesional_sm', label: 'Profesional Salud Mental', color: '#534AB7' },
  { value: 'administrativo', label: 'Profesional Administrativo', color: '#0F6E56' },
  { value: 'medico_aps', label: 'Profesional APS', color: '#7C3AAB' },
]

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [dni, setDni] = useState('')
  const [rol, setRol] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!dni || !rol) { setError(true); return }
    setLoading(true)
    setError(false)
    const result = await login(dni, rol)
    setLoading(false)
    if (!result.success) { setError(true); return }
    const r = result.user.rol
    if (r === 'profesional_sm') navigate('/sm/panel')
    else if (r === 'administrativo') navigate('/admin/panel')
    else if (r === 'medico_aps') navigate('/aps/panel')
  }

  return (
    <div className="min-h-screen bg-page-bg flex items-center justify-center p-4">
      <div className="bg-surface rounded-3xl shadow-lg p-8 w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-urgente-bg flex items-center justify-center mb-3">
            <svg className="w-12 h-12 text-urgente" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
            </svg>
          </div>
          <h1 className="text-xl font-medium text-text-primary tracking-wide">SALUD MENTAL</h1>
          <p className="text-xs text-text-secondary mt-1 text-center">HOSPITAL SAMIC EL CALAFATE</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Ingrese DNI</label>
            <input
              type="text"
              value={dni}
              onChange={e => { setDni(e.target.value); setError(false) }}
              placeholder="DNI"
              className={`w-full border rounded-lg px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 ${
                error ? 'border-urgente focus:ring-urgente/30' : 'border-border focus:ring-profesional-sm-primary/30'
              }`}
            />
            {error && <p className="text-urgente text-xs mt-1">DNI Incorrecto</p>}
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Seleccione Rol</label>
            <select
              value={rol}
              onChange={e => setRol(e.target.value)}
              className="w-full border border-border rounded-lg px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-profesional-sm-primary/30 bg-white"
            >
              <option value="">Seleccione rol</option>
              {rolOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg text-white font-medium text-sm mt-2 transition-opacity disabled:opacity-60"
            style={{ backgroundColor: rolOptions.find(o => o.value === rol)?.color || '#534AB7' }}
          >
            {loading ? 'Verificando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
