const API_BASE_URL = 'https://smiltheet-api.rafabeltrans17.workers.dev/api/child'

export interface ChildData {
  name: string
  lastName: string
  gender: 'M' | 'F'
  birthDate: string
  dentistId: number // Agregar dentistId
  morningBrushingTime: string
  afternoonBrushingTime: string
  nightBrushingTime: string
}

export interface ChildResponse {
  childId: number
  fatherId: number
  dentistId?: number // Agregar dentistId opcional
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
    // Obtener el token de autenticación
    const authToken = localStorage.getItem('authToken')

    if (!authToken) {
      throw new Error(
        'No se encontró el token de autenticación. Por favor, inicia sesión nuevamente.'
      )
    }

    // Validar datos antes de enviar
    if (!childData.name.trim()) {
      throw new Error('El nombre del niño es requerido')
    }

    if (!childData.lastName.trim()) {
      throw new Error('El apellido del niño es requerido')
    }

    if (!childData.gender || (childData.gender !== 'M' && childData.gender !== 'F')) {
      throw new Error('El género debe ser M o F')
    }

    if (!childData.birthDate) {
      throw new Error('La fecha de nacimiento es requerida')
    }

    if (!childData.dentistId || childData.dentistId === 0) {
      throw new Error('Debe seleccionar un dentista')
    }

    if (
      !childData.morningBrushingTime ||
      !childData.afternoonBrushingTime ||
      !childData.nightBrushingTime
    ) {
      throw new Error('Todos los horarios de cepillado son requeridos')
    }

    // Preparar el body de la request exactamente como lo espera el backend
    const requestBody = {
      name: childData.name.trim(),
      lastName: childData.lastName.trim(),
      gender: childData.gender.toUpperCase(),
      birthDate: childData.birthDate,
      dentistId: childData.dentistId,
      morningBrushingTime: childData.morningBrushingTime,
      afternoonBrushingTime: childData.afternoonBrushingTime,
      nightBrushingTime: childData.nightBrushingTime
    }

    console.log('Enviando datos del niño:', requestBody)

    const response = await fetch(API_BASE_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
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
        const responseText = await response.text()
        console.error('Respuesta del servidor:', responseText)
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
    console.log('Intentando obtener lista de hijos...')

    const authToken = localStorage.getItem('authToken')

    if (!authToken) {
      console.warn('No se encontró token de autenticación, retornando array vacío')
      return []
    }

    try {
      const response = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Hijos recibidos del backend:', data)

        let childrenArray: any[] = []

        if (data.items && Array.isArray(data.items)) {
          childrenArray = data.items
        } else if (Array.isArray(data)) {
          childrenArray = data
        } else {
          console.warn('Formato inesperado de respuesta de children:', data)
          return []
        }

        const mappedChildren = childrenArray.map((child: any) => ({
          childId: child.childId || child.child_id,
          fatherId: child.fatherId || child.father_id,
          dentistId: child.dentistId || child.dentist_id,
          name: child.name,
          lastName: child.lastName || child.last_name,
          gender: child.gender,
          birthDate: child.birthDate || child.birth_date,
          morningBrushingTime: child.morningBrushingTime || child.morning_brushing_time,
          afternoonBrushingTime: child.afternoonBrushingTime || child.afternoon_brushing_time,
          nightBrushingTime: child.nightBrushingTime || child.night_brushing_time,
          creationDate: child.creationDate || child.creation_date,
          lastModificationDate: child.lastModificationDate || child.last_modification_date,
          isActive: child.isActive !== undefined ? child.isActive : child.is_active,
          nextAppointment: child.nextAppointment || child.next_appointment || null
        }))

        return mappedChildren as ChildResponse[]
      } else if (response.status === 404) {
        // Si es 404, significa que el endpoint no existe o no hay hijos
        console.log(
          'Endpoint de children no existe o no hay hijos registrados, retornando array vacío'
        )
        return []
      } else {
        throw new Error(`HTTP Error: ${response.status}`)
      }
    } catch (networkError) {
      console.error('Error de red al obtener hijos:', networkError)
      // Si hay error de red, retornar array vacío para no bloquear la app
      return []
    }
  } catch (error) {
    console.error('Error general en getChildrenService:', error)
    // En caso de cualquier error, retornar array vacío para no bloquear la aplicación
    return []
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
      throw new Error('No se encontró el token de autenticación')
    }

    console.log(`Actualizando niño ID ${childId}:`, childData)

    // Convertir a camelCase para el backend (como está definido en el esquema)
    const requestBody: any = {}

    if (childData.name !== undefined) {
      requestBody.name = childData.name
    }
    if (childData.lastName !== undefined) {
      requestBody.lastName = childData.lastName
    }
    if (childData.gender !== undefined) {
      requestBody.gender = childData.gender
    }
    if (childData.birthDate !== undefined) {
      requestBody.birthDate = childData.birthDate
    }
    if (childData.dentistId !== undefined) {
      requestBody.dentistId = childData.dentistId
    }
    if (childData.morningBrushingTime !== undefined) {
      requestBody.morningBrushingTime = childData.morningBrushingTime
    }
    if (childData.afternoonBrushingTime !== undefined) {
      requestBody.afternoonBrushingTime = childData.afternoonBrushingTime
    }
    if (childData.nightBrushingTime !== undefined) {
      requestBody.nightBrushingTime = childData.nightBrushingTime
    }

    const response = await fetch(`${API_BASE_URL}/${childId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      let errorMessage = `Error al actualizar el niño: ${response.status}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
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