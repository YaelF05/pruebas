import { ChildData, ChildResponse, CreateChildResult } from '../types/childTypes'
import { validateName, validateLastName } from '@renderer/utils/validators'

const API_BASE_URL = 'https://smiltheet-api.rafabeltrans17.workers.dev/api/child'

const getAuthToken = (): string => {
  const token = localStorage.getItem('authToken')
  if (!token) {
    throw new Error(
      'No se encontró el token de autenticación. Por favor, inicia sesión nuevamente.'
    )
  }
  return token
}

const createApiHeaders = (token: string): Record<string, string> => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`
})

const handleApiError = (response: Response, operation: string): never => {
  const statusMessages: Record<number, string> = {
    400: `Datos del niño inválidos. Verifica que todos los campos estén completos.`,
    401: 'No tienes autorización. Por favor, inicia sesión nuevamente.',
    404: operation === 'create' ? 'No se encontró el dentista especificado.' : 'Niño no encontrado',
    409: 'Conflicto: Ya existe un niño con esos datos o el dentista no es válido.'
  }

  const message =
    statusMessages[response.status] || `Error al ${operation} el niño: ${response.status}`
  throw new Error(message)
}

const validateChildData = (childData: ChildData): void => {
  const requiredFields = [
    'name',
    'lastName',
    'dentistId',
    'gender',
    'birthDate',
    'morningBrushingTime',
    'afternoonBrushingTime',
    'nightBrushingTime'
  ] as const

  for (const field of requiredFields) {
    if (!childData[field]) {
      throw new Error(`El campo ${field} es requerido`)
    }
  }

  const nameError = validateName(childData.name)
  if (nameError) throw new Error(nameError)

  const lastNameError = validateLastName(childData.lastName)
  if (lastNameError) throw new Error(lastNameError)

  const gender = childData.gender.toUpperCase()
  if (gender !== 'M' && gender !== 'F') {
    throw new Error('El género debe ser M o F')
  }
}

interface ApiResponse {
  items?: ChildResponse[]
}

const normalizeChildrenResponse = (data: unknown): ChildResponse[] => {
  if (!data) return []

  if (Array.isArray(data)) {
    return data.map(
      (child: ChildResponse): ChildResponse => ({
        ...child,
        nextAppointment: child.nextAppointment || null
      })
    )
  }

  if (typeof data === 'object' && data !== null && 'items' in data) {
    const response = data as ApiResponse
    return (
      response.items?.map(
        (child: ChildResponse): ChildResponse => ({
          ...child,
          nextAppointment: child.nextAppointment || null
        })
      ) || []
    )
  }

  return []
}

export async function createChildService(childData: ChildData): Promise<CreateChildResult> {
  try {
    validateChildData(childData)
    const token = getAuthToken()

    const requestBody = {
      ...childData,
      name: childData.name.trim(),
      lastName: childData.lastName.trim(),
      gender: childData.gender.toUpperCase() as 'M' | 'F'
    }

    const response = await fetch(API_BASE_URL, {
      method: 'PUT',
      headers: createApiHeaders(token),
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      handleApiError(response, 'crear')
    }

    return (await response.json()) as CreateChildResult
  } catch (error) {
    console.error('Error en createChildService:', error)
    throw error
  }
}

export async function getChildrenService(): Promise<ChildResponse[]> {
  try {
    const token = getAuthToken()

    const response = await fetch(API_BASE_URL, {
      method: 'GET',
      headers: createApiHeaders(token)
    })

    if (response.status === 404) return []
    if (!response.ok) {
      console.error(`Error HTTP: ${response.status}`)
      return []
    }

    const data = await response.json()
    return normalizeChildrenResponse(data)
  } catch (error) {
    console.error('Error en getChildrenService:', error)
    return []
  }
}

export async function getChildByIdService(childId: number): Promise<ChildResponse> {
  try {
    const token = getAuthToken()

    const response = await fetch(`${API_BASE_URL}/${childId}`, {
      method: 'GET',
      headers: createApiHeaders(token)
    })

    if (!response.ok) {
      handleApiError(response, 'obtener')
    }

    return (await response.json()) as ChildResponse
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
    const token = getAuthToken()

    if (childData.name !== undefined) {
      const nameError = validateName(childData.name)
      if (nameError) throw new Error(nameError)
      childData.name = childData.name.trim()
    }

    if (childData.lastName !== undefined) {
      const lastNameError = validateLastName(childData.lastName)
      if (lastNameError) throw new Error(lastNameError)
      childData.lastName = childData.lastName.trim()
    }

    const response = await fetch(`${API_BASE_URL}/${childId}`, {
      method: 'PUT',
      headers: createApiHeaders(token),
      body: JSON.stringify(childData)
    })

    if (!response.ok) {
      handleApiError(response, 'actualizar')
    }

    const data = await response.json()
    console.log('Niño actualizado exitosamente:', data)
    return data
  } catch (error) {
    console.error('Error en updateChildService:', error)
    throw error
  }
}

export type { ChildResponse, ChildData }
