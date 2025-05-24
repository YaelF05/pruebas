const API_BASE_URL = 'https://smiltheet-api.rafabeltrans17.workers.dev/api'

export interface ChildData {
  name: string
  lastName: string
  gender: 'M' | 'F'
  birthDate: string
  morningBrushingTime: string
  afternoonBrushingTime: string
  nightBrushingTime: string
  dentistId: number
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
  childId?: number
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

    // Validar datos antes de enviar
    if (!childData.name.trim()) {
      throw new Error('El nombre del niño es requerido')
    }

    if (!childData.lastName.trim()) {
      throw new Error('El apellido del niño es requerido')
    }

    if (!['M', 'F'].includes(childData.gender)) {
      throw new Error('El género debe ser M o F')
    }

    if (!childData.birthDate) {
      throw new Error('La fecha de nacimiento es requerida')
    }

    if (!childData.dentistId || childData.dentistId <= 0) {
      throw new Error('Debe seleccionar un dentista válido')
    }

    // Preparar el body de la request
    const requestBody = {
      name: childData.name.trim(),
      lastName: childData.lastName.trim(),
      gender: childData.gender,
      birthDate: childData.birthDate,
      morningBrushingTime: childData.morningBrushingTime,
      afternoonBrushingTime: childData.afternoonBrushingTime,
      nightBrushingTime: childData.nightBrushingTime
    }

    console.log('Enviando datos del niño:', requestBody)

    const response = await fetch(`${API_BASE_URL}/child`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      let errorMessage = `Error al crear el niño: ${response.status}`

      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
        console.error('Error del servidor:', errorData)
      } catch (e) {
        console.error('Error al parsear respuesta de error:', e)
      }

      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log('Niño creado exitosamente:', data)
    return data as CreateChildResult
  } catch (error) {
    console.error('Error en createChildService:', error)
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

    console.log('Obteniendo lista de hijos...')

    const response = await fetch(`${API_BASE_URL}/child`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      }
    })

    if (!response.ok) {
      let errorMessage = `Error al obtener hijos: ${response.status}`

      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
        console.error('Error al obtener hijos:', errorData)
      } catch (e) {
        console.error('Error al parsear respuesta:', e)
      }

      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log('Hijos recibidos:', data)

    // La API puede devolver datos paginados o directamente el array
    if (data.items && Array.isArray(data.items)) {
      return data.items.map((child: any) => ({
        ...child,
        nextAppointment: child.nextAppointment || null
      }))
    }

    if (Array.isArray(data)) {
      return data.map((child: any) => ({
        ...child,
        nextAppointment: child.nextAppointment || null
      }))
    }

    console.warn('Formato inesperado de respuesta:', data)
    return []
  } catch (error) {
    console.error('Error en getChildrenService:', error)
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

    console.log(`Actualizando niño ID ${childId}:`, childData)

    const response = await fetch(`${API_BASE_URL}/child/${childId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify(childData)
    })

    if (!response.ok) {
      let errorMessage = `Error al actualizar el niño: ${response.status}`

      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
        console.error('Error al actualizar niño:', errorData)
      } catch (e) {
        console.error('Error al parsear respuesta:', e)
      }

      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log('Niño actualizado exitosamente:', data)
    return data
  } catch (error) {
    console.error('Error en updateChildService:', error)
    throw error
  }
}
