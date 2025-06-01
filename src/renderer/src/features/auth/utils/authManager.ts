import type { LoginResult, AuthState } from '../types/authTypes'

export class AuthManager {
  private static readonly TOKEN_KEY = 'authToken'
  private static readonly EXPIRATION_KEY = 'authExpiration'
  private static readonly USER_TYPE_KEY = 'userType'

  static saveAuthData(loginResult: LoginResult): void {
    localStorage.setItem(this.TOKEN_KEY, loginResult.token)
    localStorage.setItem(this.EXPIRATION_KEY, loginResult.expiration.toString())
    localStorage.setItem(this.USER_TYPE_KEY, loginResult.userType)
  }

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY)
  }

  static getExpiration(): number | null {
    const expiration = localStorage.getItem(this.EXPIRATION_KEY)
    return expiration ? parseInt(expiration, 10) : null
  }

  static getUserType(): string | null {
    return localStorage.getItem(this.USER_TYPE_KEY)
  }

  static isTokenExpired(): boolean {
    const expiration = this.getExpiration()
    if (!expiration) return true

    const currentTime = Math.floor(Date.now() / 1000)
    return currentTime >= expiration
  }

  static isAuthenticated(): boolean {
    const token = this.getToken()

    if (!token) return false
    if (this.isTokenExpired()) {
      this.clearAuthData()
      return false
    }

    return true
  }

  static clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY)
    localStorage.removeItem(this.EXPIRATION_KEY)
    localStorage.removeItem(this.USER_TYPE_KEY)
  }

  static getAuthState(): Omit<AuthState, 'isLoading'> {
    return {
      isAuthenticated: this.isAuthenticated(),
      token: this.getToken(),
      expiration: this.getExpiration(),
      userType: this.getUserType()
    }
  }
}
