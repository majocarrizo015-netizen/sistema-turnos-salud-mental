import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'

export function useNotificaciones() {
  const { user } = useAuth()
  const [notificaciones, setNotificaciones] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotificaciones = useCallback(async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('notificaciones')
      .select('*, solicitudes(id, pacientes(nombre, apellido))')
      .eq('destinatario_id', user.id)
      .order('fecha', { ascending: false })

    if (!error && data) {
      setNotificaciones(data)
      setUnreadCount(data.filter(n => !n.leida).length)
    }
  }, [user])

  useEffect(() => {
    fetchNotificaciones()
  }, [fetchNotificaciones])

  const markAllAsRead = async () => {
    if (!user) return
    await supabase
      .from('notificaciones')
      .update({ leida: true })
      .eq('destinatario_id', user.id)
      .eq('leida', false)
    setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })))
    setUnreadCount(0)
  }

  const crearNotificacion = async ({ destinatario_id, tipo, mensaje, solicitud_id }) => {
    await supabase.from('notificaciones').insert({
      destinatario_id,
      tipo,
      mensaje,
      solicitud_id: solicitud_id || null,
      leida: false,
      fecha: new Date().toISOString(),
    })
  }

  return { notificaciones, unreadCount, fetchNotificaciones, markAllAsRead, crearNotificacion }
}
