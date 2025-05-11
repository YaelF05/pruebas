import { LoginCredentials, LoginResult } from '../types/authTypes'

const API_LOGIN = 'https://smiltheet-api.rafabeltrans17.workers.dev/auth/login'

/**
 * Login service to authenticate a user.
 * @param credentials - The login credentials containing email and password.
 * @returns A promise that resolves to the login result containing the token and expiration time.
 * @throws An error if the authentication fails.
 */
export async function loginService(credentials: LoginCredentials): Promise<LoginResult> {
  try {
    const response = await fetch(API_LOGIN, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    })

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.status}`)
    }

    const data = await response.json()
    return data as LoginResult
  } catch (error) {
    console.error('Login service error:', error)
    throw error
  }
}

/**
 * Save the authentication token and user type in local storage.
 * @param token - The authentication token.
 * @param userType - The type of user ('DENTIST' or 'FATHER').
 */
export function saveAuth(token: string, userType: string): void {
  localStorage.setItem('authToken', token)
  localStorage.setItem('userType', userType)
}
