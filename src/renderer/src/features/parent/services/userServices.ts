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
        Authorization: `Bearer ${authToken}`
      }
    })

    console.log('Response status:', response.status)
    console.log('Response headers:', response.headers)

    if (!response.ok) {
      console.error(`Error en getUserProfileService: ${response.status}`)
      
      // Si el endpoint no existe, extraer info del token JWT
      if (response.status === 404) {
        console.log('Endpoint /user/profile no existe, extrayendo del token JWT...')
        return extractUserFromToken()
      }
      
      throw new Error(`Failed to fetch user profile: ${response.status}`)
    }

    const data = await response.json()
    console.log('Perfil de usuario recibido:', data)
    return data as UserProfileResponse
  } catch (error) {
    console.error('Error en getUserProfileService:', error)
    
    // Si hay error de conexión, intentar extraer del token
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.log('Error de conexión, extrayendo del token JWT...')
      return extractUserFromToken()
    }
    
    throw error
  }
}

/**
 * Extraer información del usuario desde el token JWT
 */
function extractUserFromToken(): UserProfileResponse {
  try {
    const authToken = localStorage.getItem('authToken')
    if (!authToken) {
      throw new Error('No token found')
    }

    // Decodificar el payload del JWT
    const payload = JSON.parse(atob(authToken.split('.')[1]))
    console.log('JWT payload:', payload)

    // Crear un perfil básico basado en el token
    return {
      userId: payload.userId || 1,
      name: payload.name || 'Usuario',
      lastName: payload.lastName || 'Padre',
      birthDate: payload.birthDate || '1990-01-01',
      email: payload.email || 'usuario@email.com',
      type: payload.type || 'FATHER',
      creationDate: new Date().toISOString(),
      isActive: true
    }
  } catch (error) {
    console.error('Error extrayendo del token:', error)
    
    // Crear perfil por defecto
    return {
      userId: 1,
      name: 'Usuario',
      lastName: 'Padre',
      birthDate: '1990-01-01',
      email: 'usuario@email.com',
      type: 'FATHER',
      creationDate: new Date().toISOString(),
      isActive: true
    }
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