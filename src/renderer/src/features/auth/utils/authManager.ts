export interface AuthState {
  token: string | null
  expiration: number | null
  userType: string | null
  isAuthenticated: boolean
}

/**
 * Utility to manage authentication state in localStorage.
 * Provides methods to save, clear, and retrieve authentication data.
 * Includes methods to check if the user is authenticated and to get the remaining time of the token.
 * @returns {AuthState} The current authentication state.
 * @returns {string | null} The authentication token if available.
 * @returns {boolean} Whether the user is authenticated.
 */
export const AuthManager = {
  saveAuthData(data: { token: string; expiration: number; userType: string }) {
    localStorage.setItem('authToken', data.token)
    localStorage.setItem('authExpiration', data.expiration.toString())
    localStorage.setItem('userType', data.userType)
  },

  clearAuthData() {
    localStorage.removeItem('authToken')
    localStorage.removeItem('authExpiration')
    localStorage.removeItem('userType')
  },

  getAuthState(): AuthState {
    const token = localStorage.getItem('authToken')
    const expirationStr = localStorage.getItem('authExpiration')
    const userType = localStorage.getItem('userType')

    const nowInSeconds = Math.floor(Date.now() / 1000)
    const expiration = expirationStr ? Number(expirationStr) : 0

    const diffSeconds = expiration - nowInSeconds
    const isAuthenticated = !!token && diffSeconds > 0

    return {
      token,
      expiration,
      userType,
      isAuthenticated
    }
  },

  getToken(): string | null {
    const auth = this.getAuthState()
    return auth.isAuthenticated ? auth.token : null
  },

  isAuthenticated(): boolean {
    return this.getAuthState().isAuthenticated
  }
}
