import { CreateDentistCredentials, CreateDentistResponse } from '../types/dentistTypes'

const API_CREATE_DENTIST = 'https://smiltheet-api.rafabeltrans17.workers.dev/api/dentist'

/**
 * Creates a new dentist.
 * @param credentials - The dentist credentials containing name, email, and password.
 * @returns A promise that resolves to the dentist creation response.
 * @throws An error if the creation fails.
 */
export async function createDentistService(
  credentials: CreateDentistCredentials
): Promise<CreateDentistResponse> {
  try {
    const response = await fetch(API_CREATE_DENTIST, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(credentials)
    })

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.status}`)
    }

    const data = await response.json()
    return data as CreateDentistResponse
  } catch (error) {
    console.error('Login service error:', error)
    throw error
  }
}
