import { IsFormFilledResponse } from '@renderer/features/dentist/types/dentistTypes'

const API_FORM_FILLED =
  'https://smiltheet-api.rafabeltrans17.workers.dev/api/dentist/is-form-filled'

/**
 * Service to check if the form is filled for the authenticated user.
 * @returns A promise that resolves to an object indicating if the form is filled.
 * @throws An error if the fetch fails or if the authentication token is missing.
 */
export async function isFormFilledService(): Promise<IsFormFilledResponse> {
  try {
    const authToken = localStorage.getItem('authToken')

    if (!authToken) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(API_FORM_FILLED, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Failed to check form filled: ${response.status}`)
    }

    const data = await response.json()
    return data as IsFormFilledResponse
  } catch (error) {
    console.error('Is form filled service error:', error)
    throw error
  }
}
