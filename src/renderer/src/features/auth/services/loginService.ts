import { LoginCredentials, LoginResult } from '../types/authTypes'

const API_LOGIN = 'https://smiltheet-api.rafabeltrans17.workers.dev/auth/login'

/**
 * Service to handle user login.
 * @param credentials
 * @returns
 */
export async function loginService(credentials: LoginCredentials): Promise<LoginResult> {
  try {
    const response = await fetch(API_LOGIN, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
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
