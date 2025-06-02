import { useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'

/**
 * Custom hook to manage token expiration and logout.
 * It checks the token expiration time and performs actions based on it.
 * If the token is about to expire (less than 5 minutes left), it shows a warning.
 * If the token has expired, it logs out the user.
 * @returns {Object} - An object containing methods to get time left and check expiration.
 */
export const useTokenExpiration = (): {
  getTimeLeft: () => number
  checkExpiration: () => void
} => {
  const { expiration, logout, isAuthenticated } = useAuth()

  const checkExpiration = useCallback(() => {
    if (!expiration || !isAuthenticated) return

    const currentTime = Math.floor(Date.now() / 1000)
    const timeLeft = expiration - currentTime

    if (timeLeft > 0 && timeLeft < 1800) {
      console.warn(`El token expirará en ${Math.floor(timeLeft / 60)} minutos`)
    }

    if (timeLeft <= 0) {
      logout()
    }
  }, [expiration, logout, isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) return

    checkExpiration()

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
