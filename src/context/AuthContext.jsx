import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('salud_mental_user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem('salud_mental_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (dni, rol) => {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('dni', dni)
      .eq('rol', rol)
      .single()

    if (error || !data) {
      return { success: false, error: 'DNI Incorrecto' }
    }

    const userData = {
      id: data.id,
      dni: data.dni,
      nombre: data.nombre,
      apellido: data.apellido,
      matricula: data.matricula,
      rol: data.rol,
      especialidad: data.especialidad,
    }

    localStorage.setItem('salud_mental_user', JSON.stringify(userData))
    setUser(userData)
    return { success: true, user: userData }
  }

  const logout = () => {
    localStorage.removeItem('salud_mental_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
