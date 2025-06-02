import { useState, useEffect, useCallback } from 'react'
import { AuthManager } from '../utils/authManager'
import { loginService } from '../services/loginService'
import type { AuthState, LoginCredentials, LoginResult } from '../types/authTypes'

type UseAuthReturn = AuthState & {
  login: (credentials: LoginCredentials) => Promise<LoginResult>
  logout: () => void
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>
  updateAuthState: () => void
}

/**
 * Custom hook to manage authentication state and actions.
 * Provides methods for login, logout, authenticated fetch, and state updates.
 * Automatically checks authentication status on mount and periodically.
 * @returns {UseAuthReturn} - The current auth state and methods to manage authentication.
 */
export const useAuth = (): UseAuthReturn => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    token: null,
    expiration: null,
    userType: null,
    isLoading: true
  })

  const updateAuthState = useCallback(() => {
    const newState = AuthManager.getAuthState()
    setAuthState({ ...newState, isLoading: false })
  }, [])

  useEffect(() => {
    updateAuthState()
  }, [updateAuthState])

  // Automatically check authentication status every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!AuthManager.isAuthenticated() && authState.isAuthenticated) {
        updateAuthState()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [authState.isAuthenticated, updateAuthState])

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<LoginResult> => {
      setAuthState((prev) => ({ ...prev, isLoading: true }))
      try {
        const loginResult = await loginService(credentials)
        AuthManager.saveAuthData(loginResult)
        updateAuthState()
        return loginResult
      } catch (error) {
        setAuthState((prev) => ({ ...prev, isLoading: false }))
        throw error
      }
    },
    [updateAuthState]
  )

  const logout = useCallback(() => {
    AuthManager.clearAuthData()
    updateAuthState()
  }, [updateAuthState])

  const authenticatedFetch = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      const token = AuthManager.getToken()
      if (!token) throw new Error('No hay token de autenticación')

      const headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`
      }

      const response = await fetch(url, { ...options, headers })

      if (response.status === 401) {
        logout()
        throw new Error('Token expirado')
      }

      return response
    },
    [logout]
  )

  return { ...authState, login, logout, authenticatedFetch, updateAuthState }
}
