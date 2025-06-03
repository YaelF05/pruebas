import { DentistResponse, DentistListItem } from '../types/dentistTypes'
import { getDistanceFromLatLonInKm } from '@renderer/utils/location/distance'

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
      console.log('Dentists:', data.items)
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
 * Service to get dentists ordered by proximity to user location
 * @param userLatitude - User's latitude
 * @param userLongitude - User's longitude
 * @param maxDistance - Maximum distance in kilometers (optional, default: no limit)
 * @returns A promise that resolves to dentists ordered by distance
 */
export async function getNearbyDentistsService(
  userLatitude: number,
  userLongitude: number,
  maxDistance?: number
): Promise<DentistResponse[]> {
  try {
    const allDentists = await getDentistsService()

    const dentistsWithDistance = allDentists.map((dentist) => ({
      ...dentist,
      distance: getDistanceFromLatLonInKm(
        userLatitude,
        userLongitude,
        dentist.latitude,
        dentist.longitude
      )
    }))

    const filteredDentists = maxDistance
      ? dentistsWithDistance.filter((dentist) => dentist.distance <= maxDistance)
      : dentistsWithDistance

    return filteredDentists.sort((a, b) => a.distance - b.distance)
  } catch (error) {
    console.error('Get nearby dentists service error:', error)
    throw error
  }
}

/**
 * Service to get a simplified list of dentists for forms
 * @param userLatitude - User's latitude (optional, for ordering by proximity)
 * @param userLongitude - User's longitude (optional, for ordering by proximity)
 * @returns A promise that resolves to the simplified list of dentists
 * @throws An error if the fetch fails
 */
export async function getDentistsForSelectService(
  userLatitude?: number,
  userLongitude?: number
): Promise<DentistListItem[]> {
  try {
    let dentists: DentistResponse[]

    if (userLatitude !== undefined && userLongitude !== undefined) {
      dentists = await getNearbyDentistsService(userLatitude, userLongitude)
    } else {
      dentists = await getDentistsService()
    }

    return dentists.map((dentist) => ({
      userId: dentist.userId,
      name: `Dr. ${dentist.name} ${dentist.lastName}${
        dentist.distance !== undefined ? ` (${dentist.distance.toFixed(1)} km)` : ''
      }`
    }))
  } catch (error) {
    console.error('Get dentists for select service error:', error)
    console.warn('No se pudieron cargar los dentistas')
    return []
  }
}
