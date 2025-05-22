const API_BASE_URL = 'https://smiltheet-api.rafabeltrans17.workers.dev/api'

export interface ChildData {
  name: string
  lastName: string
  gender: 'M' | 'F'
  birthDate: string
  morningBrushingTime: string
  afternoonBrushingTime: string
  nightBrushingTime: string
  userId: number // Este es el dentist ID
}

export interface ChildResponse {
  childId: number
  fatherId: number
  name: string
  lastName: string
  gender: 'M' | 'F'
  birthDate: string
  morningBrushingTime: string
  afternoonBrushingTime: string
  nightBrushingTime: string
  creationDate: string
  lastModificationDate?: string
  isActive: boolean
  nextAppointment?: string | null
}

export interface CreateChildResult {
  message: string
  childId: number
}

/**
 * Service to create a new child
 * @param childData - The child data
 * @returns A promise that resolves to the child creation result
 * @throws An error if the creation fails
 */
export async function createChildService(childData: ChildData): Promise<CreateChildResult> {
  try {
    const authToken = localStorage.getItem('authToken')

    if (!authToken) {
      throw new Error('No authentication token found')
    }

    // Mapear userId a dentistId para el body del request
    const requestBody = {
      name: childData.name,
      lastName: childData.lastName,
      gender: childData.gender,
      birthDate: childData.birthDate,
      morningBrushingTime: childData.morningBrushingTime,
      afternoonBrushingTime: childData.afternoonBrushingTime,
      nightBrushingTime: childData.nightBrushingTime,
      dentistId: childData.userId // Cambio de nombre para que coincida con la DB
    }

    const response = await fetch(`${API_BASE_URL}/child`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Failed to create child: ${response.status}`)
    }

    const data = await response.json()
    return data as CreateChildResult
  } catch (error) {
    console.error('Create child service error:', error)
    throw error
  }
}

/**
 * Service to get children for the current user
 * @returns A promise that resolves to the list of children
 * @throws An error if the fetch fails
 */
export async function getChildrenService(): Promise<ChildResponse[]> {
  try {
    const authToken = localStorage.getItem('authToken')

    if (!authToken) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/child`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Failed to fetch children: ${response.status}`)
    }

    const data = await response.json()

    // Mapear la respuesta para incluir nextAppointment si está disponible
    return (data as ChildResponse[]).map((child) => ({
      ...child,
      nextAppointment: child.nextAppointment || null
    }))
  } catch (error) {
    console.error('Get children service error:', error)
    throw error
  }
}

/**
 * Service to update a child
 * @param childId - The ID of the child to update
 * @param childData - The updated child data
 * @returns A promise that resolves to the update result
 * @throws An error if the update fails
 */
export async function updateChildService(
  childId: number,
  childData: Partial<ChildData>
): Promise<{ message: string }> {
  try {
    const authToken = localStorage.getItem('authToken')

    if (!authToken) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/child/${childId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify(childData)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Failed to update child: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Update child service error:', error)
    throw error
  }
}
