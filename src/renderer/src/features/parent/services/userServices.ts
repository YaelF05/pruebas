// src/renderer/src/features/parent/services/userService.ts
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
      throw new Error('No authentication token found')
    }

    console.log('Obteniendo perfil del usuario...')

    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    })

    if (!response.ok) {
      // Si la API no existe aún, usar datos simulados basados en JWT
      if (response.status === 404) {
        console.warn('API de perfil de usuario no implementada, usando datos simulados')
        return getMockUserProfile()
      }

      let errorMessage = `Error al obtener perfil: ${response.status}`

      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
        console.error('Error al obtener perfil de usuario:', errorData)
      } catch (e) {
        console.error('Error al parsear respuesta:', e)
      }

      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log('Perfil de usuario recibido:', data)

    return data as UserProfileResponse
  } catch (error) {
    console.error('Error en getUserProfileService:', error)
    
    // Si es error de red, usar datos mock
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.warn('Error de conexión en getUserProfile, usando datos simulados')
      return getMockUserProfile()
    }
    
    throw error
  }
}

/**
 * Function to get mock user profile data
 * This is used as fallback when the API is not available
 */
function getMockUserProfile(): UserProfileResponse {
  // Intentar extraer datos del token JWT si es posible
  const authToken = localStorage.getItem('authToken')
  let userId = 1
  let email = 'usuario@email.com'
  
  if (authToken) {
    try {
      // Decodificar JWT para obtener información básica (sin verificar)
      const payload = JSON.parse(atob(authToken.split('.')[1]))
      userId = payload.userId || 1
      email = payload.email || 'usuario@email.com'
    } catch (error) {
      console.warn('No se pudo decodificar el token JWT:', error)
    }
  }

  return {
    userId: userId,
    name: 'Usuario',
    lastName: 'Padre',
    birthDate: '1990-01-01',
    email: email,
    type: 'FATHER',
    creationDate: new Date().toISOString(),
    lastModificationDate: undefined,
    isActive: true
  }
}

/**
 * Service to update the current user's profile information
 * @param updateData - The data to update
 * @returns A promise that resolves to the update result
 * @throws An error if the update fails
 */
export async function updateUserProfileService(updateData: Partial<Omit<UserProfileResponse, 'userId' | 'type' | 'creationDate' | 'isActive'>>): Promise<{ message: string }> {
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
      // Si la API no existe, simular respuesta exitosa
      if (response.status === 404) {
        console.warn('API de actualización de perfil no implementada, simulando respuesta')
        return { message: 'Perfil actualizado (simulado)' }
      }

      let errorMessage = `Error al actualizar perfil: ${response.status}`

      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
        console.error('Error al actualizar perfil:', errorData)
      } catch (e) {
        console.error('Error al parsear respuesta:', e)
      }

      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log('Perfil actualizado exitosamente:', data)
    return data
  } catch (error) {
    console.error('Error en updateUserProfileService:', error)
    
    // Si es error de red, simular respuesta exitosa
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.warn('Error de conexión en updateUserProfile, simulando respuesta')
      return { message: 'Perfil actualizado (offline)' }
    }
    
    throw error
  }
}