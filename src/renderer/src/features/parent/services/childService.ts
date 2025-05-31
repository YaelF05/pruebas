// src/renderer/src/features/parent/services/childService.ts
const API_BASE_URL = 'https://smiltheet-api.rafabeltrans17.workers.dev/api/child'

// Tipos que coinciden exactamente con el backend
export interface ChildData {
  name: string
  lastName: string
  gender: 'M' | 'F'
  birthDate: string
  dentistId: number
  morningBrushingTime: string
  afternoonBrushingTime: string
  nightBrushingTime: string
}

export interface ChildResponse {
  childId: number
  fatherId: number
  dentistId?: number
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
 * Service to create a new child - Alineado exactamente con el backend
 * Backend controller: src/modules/child/child.controller.ts
 * Backend service: src/modules/child/child.service.ts
 * Backend DAO: src/modules/child/child.dao.ts
 * Backend schema: src/config/db/schema.ts (childTable)
 */
export async function createChildService(childData: ChildData): Promise<CreateChildResult> {
  try {
    const authToken = localStorage.getItem('authToken')

    if (!authToken) {
      throw new Error(
        'No se encontró el token de autenticación. Por favor, inicia sesión nuevamente.'
      )
    }

    // Validaciones que coinciden con el backend controller (isValidData method)
    // Basado en: src/modules/child/child.controller.ts líneas 29-35
    const requiredFields = [
      'name', 'lastName', 'dentistId', 'gender', 'birthDate', 
      'morningBrushingTime', 'afternoonBrushingTime', 'nightBrushingTime'
    ]

    for (const field of requiredFields) {
      if (!childData[field as keyof ChildData]) {
        throw new Error(`El campo ${field} es requerido`)
      }
    }

    // Validación específica de género (según controller líneas 40-42)
    const gender = childData.gender.toUpperCase()
    if (gender !== 'M' && gender !== 'F') {
      throw new Error('El género debe ser M o F')
    }

    // Preparar el body exactamente como lo espera el backend
    // Según el schema: childTable en src/config/db/schema.ts
    // El backend service añade fatherId del JWT (línea 25): fatherId: this.jwtPayload.userId
    const requestBody = {
      name: childData.name.trim(),
      lastName: childData.lastName.trim(),
      gender: gender as 'M' | 'F',
      birthDate: childData.birthDate,
      dentistId: childData.dentistId,
      morningBrushingTime: childData.morningBrushingTime,
      afternoonBrushingTime: childData.afternoonBrushingTime,
      nightBrushingTime: childData.nightBrushingTime
    }

    console.log('Enviando datos del niño (alineado con backend):', requestBody)

    const response = await fetch(API_BASE_URL, {
      method: 'PUT', // Según la ruta: childRouter.put('/', ...)
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      let errorMessage = `Error al crear el niño: ${response.status}`
      
      try {
        const errorData = await response.text()
        console.error('Error del servidor:', errorData)
        
        try {
          const parsedError = JSON.parse(errorData)
          errorMessage = parsedError.message || errorData
        } catch {
          errorMessage = errorData || errorMessage
        }
      } catch (e) {
        console.error('Error al leer respuesta de error:', e)
      }
      
      // Manejo de errores específicos según el backend
      switch (response.status) {
        case 400:
          throw new Error('Datos del niño inválidos. Verifica que todos los campos estén completos.')
        case 401:
          throw new Error('No tienes autorización. Por favor, inicia sesión nuevamente.')
        case 409:
          if (errorMessage.includes('UNIQUE') || errorMessage.includes('unique')) {
            throw new Error('Ya existe un niño con esos datos.')
          } else if (errorMessage.includes('FOREIGN KEY') || errorMessage.includes('foreign')) {
            throw new Error('El dentista seleccionado no es válido.')
          } else {
            throw new Error('Conflicto al crear el niño: ' + errorMessage)
          }
        case 404:
          throw new Error('No se encontró el dentista especificado.')
        default:
          throw new Error(errorMessage)
      }
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
 * Endpoint: GET /api/child
 * Backend: src/modules/child/child.controller.ts - fetchChilds method
 */
export async function getChildrenService(): Promise<ChildResponse[]> {
  try {
    console.log('Obteniendo lista de hijos...')

    const authToken = localStorage.getItem('authToken')
    if (!authToken) {
      console.warn('No se encontró token de autenticación')
      return []
    }

    const response = await fetch(API_BASE_URL, {
      method: 'GET', // Según la ruta: childRouter.get('/', ...)
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      }
    })

    if (response.ok) {
      const data = await response.json()
      console.log('Respuesta del backend:', data)

      // El backend devuelve datos paginados: { page, limit, totalPages, items }
      // Según: src/utils/pagination.ts
      let childrenArray: any[] = []

      if (data.items && Array.isArray(data.items)) {
        childrenArray = data.items
      } else if (Array.isArray(data)) {
        childrenArray = data
      } else {
        console.warn('Formato inesperado de respuesta:', data)
        return []
      }

      // Mapear los datos del backend al formato del frontend
      // Manejar tanto snake_case como camelCase por si acaso
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
      // El backend devuelve 404 cuando no hay hijos (controller línea 54)
      console.log('No hay hijos registrados')
      return []
    } else {
      console.error(`Error HTTP: ${response.status}`)
      return []
    }
  } catch (error) {
    console.error('Error en getChildrenService:', error)
    return []
  }
}

/**
 * Service to get a specific child by ID
 * Endpoint: GET /api/child/:id
 * Backend: src/modules/child/child.controller.ts - fetchChildById method
 */
export async function getChildByIdService(childId: number): Promise<ChildResponse> {
  try {
    const authToken = localStorage.getItem('authToken')
    if (!authToken) {
      throw new Error('No se encontró el token de autenticación')
    }

    const response = await fetch(`${API_BASE_URL}/${childId}`, {
      method: 'GET', // Según la ruta: childRouter.get('/:id', ...)
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      }
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Niño no encontrado')
      }
      if (response.status === 401) {
        throw new Error('El niño no te pertenece o no tienes autorización')
      }
      throw new Error(`Error al obtener el niño: ${response.status}`)
    }

    const data = await response.json()
    return data as ChildResponse
  } catch (error) {
    console.error('Error en getChildByIdService:', error)
    throw error
  }
}

/**
 * Service to update a child (si existe endpoint en el backend)
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

    const response = await fetch(`${API_BASE_URL}/${childId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify(childData)
    })

    if (!response.ok) {
      throw new Error(`Error al actualizar el niño: ${response.status}`)
    }

    const data = await response.json()
    console.log('Niño actualizado exitosamente:', data)
    return data
  } catch (error) {
    console.error('Error en updateChildService:', error)
    throw error
  }
}
