// src/renderer/src/features/parent/services/dentistService.ts
const API_BASE_URL = 'https://smiltheet-api.rafabeltrans17.workers.dev/api'

export interface DentistResponse {
  userId: number
  user: {
    userId: number
    name: string
    lastName: string
    email: string
  }
  professionalLicense: string
  university?: string
  speciality?: string
  about?: string
  serviceStartTime: string
  serviceEndTime: string
  phoneNumber: string
  latitude: number
  longitude: number
  distance?: number
}

export interface DentistListItem {
  userId: number
  name: string
}

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

    const response = await fetch(`${API_BASE_URL}/dentist`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    })

    if (!response.ok) {
      // Si la ruta no existe, usar datos mock
      if (response.status === 404) {
        console.warn('API de dentists no implementada, usando datos mock')
        return getMockDentists()
      }

      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Failed to fetch dentists: ${response.status}`)
    }

    const data = await response.json()
    
    // Manejar diferentes formatos de respuesta
    if (Array.isArray(data)) {
      return data as DentistResponse[]
    } else if (data.items && Array.isArray(data.items)) {
      return data.items as DentistResponse[]
    } else {
      console.warn('Formato inesperado de dentists, usando mock data')
      return getMockDentists()
    }
  } catch (error) {
    console.error('Get dentists service error:', error)
    
    // Si es error de red, usar datos mock
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.warn('Error de conexión en getDentists, usando datos mock')
      return getMockDentists()
    }
    
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

    const response = await fetch(`${API_BASE_URL}/dentist/${dentistId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    })

    if (!response.ok) {
      // Si la ruta no existe, usar datos mock
      if (response.status === 404) {
        console.warn(`API de dentist/${dentistId} no implementada, usando datos mock`)
        const mockDentists = getMockDentists()
        const dentist = mockDentists.find(d => d.userId === dentistId)
        if (dentist) {
          return dentist
        }
        throw new Error('Dentist not found')
      }

      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Failed to fetch dentist: ${response.status}`)
    }

    const data = await response.json()
    return data as DentistResponse
  } catch (error) {
    console.error('Get dentist by ID service error:', error)
    
    // Si es error de red, usar datos mock
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.warn('Error de conexión en getDentistById, usando datos mock')
      const mockDentists = getMockDentists()
      const dentist = mockDentists.find(d => d.userId === dentistId)
      if (dentist) {
        return dentist
      }
    }
    
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

    const response = await fetch(`${API_BASE_URL}/dentist/nearby?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    })

    if (!response.ok) {
      // Si la ruta no existe, usar datos mock con distancias calculadas
      if (response.status === 404) {
        console.warn('API de nearby dentists no implementada, usando datos mock')
        return getMockDentists().map(d => ({
          ...d,
          distance: Math.random() * 10 + 1 // Distancia aleatoria entre 1-11km
        }))
      }

      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Failed to fetch nearby dentists: ${response.status}`)
    }

    const data = await response.json()
    return data as DentistResponse[]
  } catch (error) {
    console.error('Get nearby dentists service error:', error)
    
    // Si es error de red, usar datos mock
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.warn('Error de conexión en getNearbyDentists, usando datos mock')
      return getMockDentists().map(d => ({
        ...d,
        distance: Math.random() * 10 + 1
      }))
    }
    
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
      name: `Dr. ${dentist.user.name} ${dentist.user.lastName}`
    }))
  } catch (error) {
    console.error('Get dentists for select service error:', error)
    
    // En caso de error, retornar lista básica mock
    return [
      { userId: 1, name: 'Dr. María González' },
      { userId: 2, name: 'Dr. Carlos Rodríguez' },
      { userId: 3, name: 'Dr. Ana Martínez' }
    ]
  }
}

// Función helper para datos mock
function getMockDentists(): DentistResponse[] {
  return [
    {
      userId: 1,
      user: {
        userId: 1,
        name: 'María',
        lastName: 'González',
        email: 'maria.gonzalez@email.com'
      },
      professionalLicense: '1234567',
      university: 'Universidad Nacional',
      speciality: 'Odontopediatría',
      about: 'Especialista en odontología pediátrica con más de 10 años de experiencia.',
      serviceStartTime: '08:00',
      serviceEndTime: '18:00',
      phoneNumber: '5512345678',
      latitude: 19.4326,
      longitude: -99.1332
    },
    {
      userId: 2,
      user: {
        userId: 2,
        name: 'Carlos',
        lastName: 'Rodríguez',
        email: 'carlos.rodriguez@email.com'
      },
      professionalLicense: '2345678',
      university: 'Universidad Autónoma',
      speciality: 'Ortodoncia Pediátrica',
      about: 'Experto en ortodoncia para niños y adolescentes.',
      serviceStartTime: '09:00',
      serviceEndTime: '17:00',
      phoneNumber: '5523456789',
      latitude: 19.42,
      longitude: -99.15
    },
    {
      userId: 3,
      user: {
        userId: 3,
        name: 'Ana',
        lastName: 'Martínez',
        email: 'ana.martinez@email.com'
      },
      professionalLicense: '3456789',
      university: 'Universidad Metropolitana',
      speciality: 'Odontología General',
      about: 'Odontóloga general con enfoque en salud dental infantil.',
      serviceStartTime: '10:00',
      serviceEndTime: '19:00',
      phoneNumber: '5534567890',
      latitude: 19.41,
      longitude: -99.14
    }
  ]
}