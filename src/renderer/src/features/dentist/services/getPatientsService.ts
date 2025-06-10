import { PaginatedResponse, GetPatientsResponse } from '../types/dentistTypes'

const API_GET_CHILDS = 'https://smiltheet-api.rafabeltrans17.workers.dev/api/child'

/**
 * Fetches a list of patients (children) from the API.
 * @returns A promise that resolves to an array of GetPatientsResponse objects.
 * @throws An error if the fetch operation fails or if the response is not ok.
 */
export const getPatientsService = async (): Promise<GetPatientsResponse[]> => {
  const authToken = localStorage.getItem('authToken')

  try {
    const response = await fetch(API_GET_CHILDS, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: PaginatedResponse<GetPatientsResponse> = await response.json()

    // Retornar solo el array de items
    return data.items || []
  } catch (error) {
    console.error('Error fetching patients:', error)
    throw error
  }
}
