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
      console.warn('No authentication token found, extrayendo del token JWT')
      return extractUserFromToken()
    }

    console.log('Intentando obtener perfil del usuario desde API...')

    // Intentar obtener desde la API
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Perfil de usuario recibido desde API:', data)
        return data as UserProfileResponse
      } else {
        console.warn(
          `API profile endpoint no disponible (${response.status}), extrayendo del token`
        )
        return extractUserFromToken()
      }
    } catch (networkError) {
      console.warn('Error de red al obtener perfil, extrayendo del token:', networkError)
      return extractUserFromToken()
    }
  } catch (error) {
    console.error('Error general en getUserProfileService:', error)
    // Como último recurso, extraer del token
    return extractUserFromToken()
  }
}

/**
 * Extraer información del usuario desde el token JWT
 */
function extractUserFromToken(): UserProfileResponse {
  try {
    const authToken = localStorage.getItem('authToken')
    if (!authToken) {
      console.warn('No token found, usando perfil por defecto')
      return getDefaultProfile()
    }

    // Decodificar el payload del JWT
    const parts = authToken.split('.')
    if (parts.length !== 3) {
      console.warn('Token JWT inválido, usando perfil por defecto')
      return getDefaultProfile()
    }

    const payload = JSON.parse(atob(parts[1]))
    console.log('Extrayendo información desde JWT payload:', payload)

    // Crear un perfil básico basado en el token
    return {
      userId: payload.userId || payload.user_id || 1,
      name: payload.name || 'Usuario',
      lastName: payload.lastName || payload.last_name || 'Padre',
      birthDate: payload.birthDate || payload.birth_date || '1990-01-01',
      email: payload.email || 'usuario@email.com',
      type: (payload.type || 'FATHER') as 'FATHER' | 'DENTIST',
      creationDate: payload.creationDate || new Date().toISOString(),
      isActive: payload.isActive !== undefined ? payload.isActive : true
    }
  } catch (error) {
    console.warn('Error extrayendo del token JWT:', error)
    return getDefaultProfile()
  }
}

/**
 * Obtener perfil por defecto cuando no hay otra opción
 */
function getDefaultProfile(): UserProfileResponse {
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