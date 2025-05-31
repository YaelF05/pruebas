import { DentistResponse, DentistListItem } from '../types/dentistTypes'

const API_BASE_URL = 'https://smiltheet-api.rafabeltrans17.workers.dev/api/dentist'

/**
 * Service to get all available dentists
 * @returns A promise that resolves to the list of dentists
 * @throws An error if the fetch fails
 */
export async function getDentistsService(): Promise<DentistResponse[]> {
  try {
    const authToken = localStorage.getItem('authToken')

    if (!authToken) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(API_BASE_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Failed to fetch dentists: ${response.status}`)
    }

    const data = await response.json()

    if (Array.isArray(data)) {
      return data as DentistResponse[]
    } else if (data.items && Array.isArray(data.items)) {
      return data.items as DentistResponse[]
    } else {
      console.warn('Formato inesperado de dentists:', data)
      return []
    }
  } catch (error) {
    console.error('Get dentists service error:', error)
    throw error
  }
}

/**
 * Service to get a specific dentist by ID
 * @param dentistId - The ID of the dentist
 * @returns A promise that resolves to the dentist data
 * @throws An error if the fetch fails
 */
export async function getDentistByIdService(dentistId: number): Promise<DentistResponse> {
  try {
    const authToken = localStorage.getItem('authToken')

    if (!authToken) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/${dentistId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      }
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Dentist not found')
      }

      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Failed to fetch dentist: ${response.status}`)
    }

    const data = await response.json()
    return data as DentistResponse
  } catch (error) {
    console.error('Get dentist by ID service error:', error)
    throw error
  }
}

/**
 * Service to get dentists nearby based on coordinates
 * @param latitude - User's latitude
 * @param longitude - User's longitude
 * @param radius - Search radius in kilometers (optional, default 10)
 * @returns A promise that resolves to the list of nearby dentists
 * @throws An error if the fetch fails
 */
export async function getNearbyDentistsService(
  latitude: number,
  longitude: number,
  radius: number = 10
): Promise<DentistResponse[]> {
  try {
    const authToken = localStorage.getItem('authToken')

    if (!authToken) {
      throw new Error('No authentication token found')
    }

    const queryParams = new URLSearchParams({
      lat: latitude.toString(),
      lng: longitude.toString(),
      radius: radius.toString()
    })

    const response = await fetch(`${API_BASE_URL}/nearby?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Failed to fetch nearby dentists: ${response.status}`)
    }

    const data = await response.json()
    return data as DentistResponse[]
  } catch (error) {
    console.error('Get nearby dentists service error:', error)
    throw error
  }
}

/**
 * Service to get a simplified list of dentists for forms
 * @returns A promise that resolves to the simplified list of dentists
 * @throws An error if the fetch fails
 */
export async function getDentistsForSelectService(): Promise<DentistListItem[]> {
  try {
    const dentists = await getDentistsService()

    return dentists.map((dentist) => ({
      userId: dentist.userId,
      name: `Dr. ${dentist.name} ${dentist.lastName}`
    }))
  } catch (error) {
    console.error('Get dentists for select service error:', error)

    console.warn('No se pudieron cargar los dentistas')
    return []
  }
}
export type { DentistResponse }
