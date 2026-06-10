import { useState, useCallback } from 'react'
import { supabase } from '../supabase'

export function useProtocoloFaltas() {
  const [protocoloData, setProtocoloData] = useState(null)
  const [showPopupFaltas, setShowPopupFaltas] = useState(false)

  const checkProtocoloFaltas = useCallback(async (solicitudId) => {
    const { data: sesiones, error } = await supabase
      .from('sesiones')
      .select('*')
      .eq('solicitud_id', solicitudId)
      .order('numero', { ascending: true })

    if (error || !sesiones) return false

    // Check for 2 consecutive 'no' attendance
    let consecutiveNo = 0
    let lastTwoNo = []
    for (let i = 0; i < sesiones.length; i++) {
      if (sesiones[i].asistencia === 'no') {
        consecutiveNo++
        lastTwoNo.push(sesiones[i])
        if (consecutiveNo >= 2) {
          // Get solicitud + patient data
          const { data: solicitud } = await supabase
            .from('solicitudes')
            .select('*, pacientes(*)')
            .eq('id', solicitudId)
            .single()

          if (solicitud) {
            setProtocoloData({
              solicitud,
              sesionesAusentes: lastTwoNo.slice(-2),
            })
            setShowPopupFaltas(true)
            return true
          }
        }
      } else {
        consecutiveNo = 0
        lastTwoNo = []
      }
    }
    return false
  }, [])

  const activarProtocolo = async (solicitudId, onComplete) => {
    // Set estado = baja_protocolo
    await supabase
      .from('solicitudes')
      .update({ estado: 'baja_protocolo' })
      .eq('id', solicitudId)

    // Cancel remaining pending sessions
    await supabase
      .from('sesiones')
      .update({ asistencia: 'no' })
      .eq('solicitud_id', solicitudId)
      .eq('asistencia', 'pendiente')

    setShowPopupFaltas(false)
    if (onComplete) onComplete()
  }

  const justificarFalta = async (sesionId, justificacion) => {
    await supabase
      .from('sesiones')
      .update({ justificacion, asistencia: 'aviso' })
      .eq('id', sesionId)
    setShowPopupFaltas(false)
    setProtocoloData(null)
  }

  return {
    protocoloData,
    showPopupFaltas,
    setShowPopupFaltas,
    checkProtocoloFaltas,
    activarProtocolo,
    justificarFalta,
  }
}
