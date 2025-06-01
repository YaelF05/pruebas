import { useState, useEffect, useCallback } from 'react'
import { AuthManager } from '../utils/authManager'
import { loginService } from '../services/loginService'
import type { AuthState, LoginCredentials } from '../types/authTypes'

type UseAuthReturn = AuthState & {
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>
  updateAuthState: () => void
}

export const useAuth = (): UseAuthReturn => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    token: null,
    expiration: null,
    userType: null,
    isLoading: true
  })

  // Actualizar estado de autenticación
  const updateAuthState = useCallback(() => {
    const newState = AuthManager.getAuthState()
    setAuthState({
      ...newState,
      isLoading: false
    })
  }, [])

  // Inicializar estado al montar el componente
  useEffect(() => {
    updateAuthState()
  }, [updateAuthState])

  // Verificar expiración periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      if (!AuthManager.isAuthenticated() && authState.isAuthenticated) {
        updateAuthState()
      }
    }, 30000) // Cada 30 segundos

    return () => clearInterval(interval)
  }, [authState.isAuthenticated, updateAuthState])

  // Función de login usando tu servicio
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<void> => {
      setAuthState((prev) => ({ ...prev, isLoading: true }))

      try {
        // Usar tu servicio de login
        const loginResult = await loginService(credentials)

        // Guardar datos usando AuthManager
        AuthManager.saveAuthData(loginResult)

        // Actualizar estado
        updateAuthState()
      } catch (error) {
        setAuthState((prev) => ({ ...prev, isLoading: false }))
        throw error
      }
    },
    [updateAuthState]
  )

  // Función de logout
  const logout = useCallback(() => {
    AuthManager.clearAuthData()
    updateAuthState()
  }, [updateAuthState])

  // Función para hacer peticiones autenticadas
  const authenticatedFetch = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      const token = AuthManager.getToken()

      if (!token) {
        throw new Error('No hay token de autenticación')
      }

      const headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`
      }

      const response = await fetch(url, {
        ...options,
        headers
      })

      if (response.status === 401) {
        logout()
        throw new Error('Token expirado')
      }

      return response
    },
    [logout]
  )

  return {
    ...authState,
    login,
    logout,
    authenticatedFetch,
    updateAuthState
  }
}
