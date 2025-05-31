const API_BASE_URL = 'https://smiltheet-api.rafabeltrans17.workers.dev/api/child'

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

export async function createChildService(childData: ChildData): Promise<CreateChildResult> {
  try {
    const authToken = localStorage.getItem('authToken')

    if (!authToken) {
      throw new Error(
        'No se encontró el token de autenticación. Por favor, inicia sesión nuevamente.'
      )
    }

    const requiredFields = [
      'name',
      'lastName',
      'dentistId',
      'gender',
      'birthDate',
      'morningBrushingTime',
      'afternoonBrushingTime',
      'nightBrushingTime'
    ]

    for (const field of requiredFields) {
      if (!childData[field as keyof ChildData]) {
        throw new Error(`El campo ${field} es requerido`)
      }
    }

    const gender = childData.gender.toUpperCase()
    if (gender !== 'M' && gender !== 'F') {
      throw new Error('El género debe ser M o F')
    }

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

    const response = await fetch(API_BASE_URL, {
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
          throw new Error(
            'Datos del niño inválidos. Verifica que todos los campos estén completos.'
          )
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
    return data as CreateChildResult
  } catch (error) {
    console.error('Error en createChildService:', error)
    throw error
  }
}

export async function getChildrenService(): Promise<ChildResponse[]> {
  try {
    const authToken = localStorage.getItem('authToken')
    if (!authToken) {
      console.warn('No se encontró token de autenticación')
      return []
    }

    const response = await fetch(API_BASE_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      }
    })

    if (response.ok) {
      const data = await response.json()

      let childrenArray: any[] = []

      if (data.items && Array.isArray(data.items)) {
        childrenArray = data.items
      } else if (Array.isArray(data)) {
        childrenArray = data
      } else {
        console.warn('Formato inesperado de respuesta:', data)
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

export async function getChildByIdService(childId: number): Promise<ChildResponse> {
  try {
    const authToken = localStorage.getItem('authToken')
    if (!authToken) {
      throw new Error('No se encontró el token de autenticación')
    }

    const response = await fetch(`${API_BASE_URL}/${childId}`, {
      method: 'GET',
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

export async function updateChildService(
  childId: number,
  childData: Partial<ChildData>
): Promise<{ message: string }> {
  try {
    const authToken = localStorage.getItem('authToken')
    if (!authToken) {
      throw new Error('No se encontró el token de autenticación')
    }

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
