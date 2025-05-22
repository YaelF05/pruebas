import { SignupCredentials, SignupResult } from '../types/authTypes'

const API_SIGNUP = 'https://smiltheet-api.rafabeltrans17.workers.dev/auth/sign'

/**
 * Service to handle user signup
 *
 * @param credentials - The signup credentials
 * @returns A promise that resolves to the signup result
 * @throws An error if the signup fails
 */
export async function signupService(credentials: SignupCredentials): Promise<SignupResult> {
  try {
    console.log('🔄 Datos que se van a enviar:', credentials)

    const response = await fetch(API_SIGNUP, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    })

    console.log('📥 Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Error del servidor:', errorText)
      throw new Error(`Authentication failed: ${response.status}`)
    }
    const data = await response.json()
    return data as SignupResult
  } catch (error) {
    console.error('Signup service error:', error)
    throw error
  }
}
