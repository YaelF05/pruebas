// src/renderer/src/features/parent/services/userServices.ts
const API_BASE_URL = 'https://smiltheet-api.rafabeltrans17.workers.dev/api'

export interface UserProfileResponse {
  userId: number
  name: string
  lastName: string
  birthDate: string
  email: string
  type: 'FATHER' | 'DENTIST'
  creationDate: string
  lastModificationDate?: string
  isActive: boolean
}

/**
 * Service to get the current user's profile information
 * @returns A promise that resolves to the user profile data
 * @throws An error if the fetch fails
 */
export async function getUserProfileService(): Promise<UserProfileResponse> {
  try {
    const authToken = localStorage.getItem('authToken')

    if (!authToken) {
      console.error('No authentication token found')
      throw new Error('No authentication token found')
    }

    console.log('Intentando obtener perfil del usuario...')

    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    })

    if (!response.ok) {
      console.error(`Error en getUserProfileService: ${response.status}`)
      throw new Error(`Failed to fetch user profile: ${response.status}`)
    }

    const data = await response.json()
    console.log('Perfil de usuario recibido:', data)
    return data as UserProfileResponse
  } catch (error) {
    console.error('Error en getUserProfileService:', error)
    throw error
  }
}

/**
 * Service to update the current user's profile information
 * @param updateData - The data to update
 * @returns A promise that resolves to the update result
 * @throws An error if the update fails
 */
export async function updateUserProfileService(
  updateData: Partial<Omit<UserProfileResponse, 'userId' | 'type' | 'creationDate' | 'isActive'>>
): Promise<{ message: string }> {
  try {
    const authToken = localStorage.getItem('authToken')

    if (!authToken) {
      throw new Error('No authentication token found')
    }

    console.log('Actualizando perfil del usuario:', updateData)

    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(updateData)
    })

    if (!response.ok) {
      throw new Error(`Failed to update user profile: ${response.status}`)
    }

    const data = await response.json()
    console.log('Perfil actualizado exitosamente:', data)
    return data
  } catch (error) {
    console.error('Error en updateUserProfileService:', error)
    throw error
  }
}
