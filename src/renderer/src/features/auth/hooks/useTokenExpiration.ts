import { useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'

export const useTokenExpiration = (): {
  getTimeLeft: () => number
  checkExpiration: () => void
} => {
  const { expiration, logout, isAuthenticated } = useAuth()

  const checkExpiration = useCallback(() => {
    if (!expiration || !isAuthenticated) return

    const currentTime = Math.floor(Date.now() / 1000)
    const timeLeft = expiration - currentTime

    // Si queda menos de 5 minutos, mostrar advertencia
    if (timeLeft > 0 && timeLeft < 300) {
      console.warn(`El token expirará en ${Math.floor(timeLeft / 60)} minutos`)
      // Aquí podrías mostrar una notificación al usuario
    }

    // Si ya expiró, hacer logout
    if (timeLeft <= 0) {
      logout()
    }
  }, [expiration, logout, isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) return

    // Verificar inmediatamente
    checkExpiration()

    // Verificar cada minuto
    const interval = setInterval(checkExpiration, 60000)

    return () => clearInterval(interval)
  }, [checkExpiration, isAuthenticated])

  const getTimeLeft = useCallback(() => {
    if (!expiration) return 0
    return Math.max(0, expiration - Math.floor(Date.now() / 1000))
  }, [expiration])

  return {
    getTimeLeft,
    checkExpiration
  }
}
