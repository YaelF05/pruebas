import { ChildData, ChildResponse, CreateChildResult } from '../types/childTypes'
import { validateName, validateLastName } from '@renderer/utils/validators'

const API_BASE_URL = 'https://smiltheet-api.rafabeltrans17.workers.dev/api/child'

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

    const nameValidation = validateName(childData.name)
    if (nameValidation) {
      throw new Error(nameValidation)
    }

    const lastNameValidation = validateLastName(childData.lastName)
    if (lastNameValidation) {
      throw new Error(lastNameValidation)
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

      let childrenArray: ChildResponse[] = []

      if (data.items && Array.isArray(data.items)) {
        childrenArray = data.items
      } else if (Array.isArray(data)) {
        childrenArray = data
      } else {
        console.warn('Formato inesperado de respuesta:', data)
        return []
      }

      const mappedChildren = childrenArray.map(
        (child: ChildResponse): ChildResponse => ({
          childId: child.childId,
          fatherId: child.fatherId,
          dentistId: child.dentistId,
          name: child.name,
          lastName: child.lastName,
          gender: child.gender,
          birthDate: child.birthDate,
          morningBrushingTime: child.morningBrushingTime,
          afternoonBrushingTime: child.afternoonBrushingTime,
          nightBrushingTime: child.nightBrushingTime,
          creationDate: child.creationDate,
          lastModificationDate: child.lastModificationDate,
          isActive: child.isActive,
          nextAppointment: child.nextAppointment || null
        })
      )

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

    if (childData.name !== undefined) {
      const nameValidation = validateName(childData.name)
      if (nameValidation) {
        throw new Error(nameValidation)
      }
      childData.name = childData.name.trim()
    }

    if (childData.lastName !== undefined) {
      const lastNameValidation = validateLastName(childData.lastName)
      if (lastNameValidation) {
        throw new Error(lastNameValidation)
      }
      childData.lastName = childData.lastName.trim()
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
export type { ChildResponse }
export type { ChildData }
