import { ChildData, ChildResponse, CreateChildResult, UpdateChildData } from '../types/childTypes'
import { validateName, validateLastName } from '@renderer/utils/validators'

const API_BASE_URL = 'https://smiltheet-api.rafabeltrans17.workers.dev/api/child'

interface ApiResponse {
  items?: ChildResponse[]
}

type HttpMethod = 'GET' | 'PUT' | 'POST' | 'DELETE'

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

const ERROR_MESSAGES: Record<number, Record<string, string>> = {
  400: {
    default: 'Datos del niño inválidos. Verifica que todos los campos estén completos.'
  },
  401: {
    default: 'No tienes autorización. Por favor, inicia sesión nuevamente.'
  },
  404: {
    create: 'No se encontró el dentista especificado.',
    default: 'Niño no encontrado'
  },
  409: {
    default: 'Conflicto: Ya existe un niño con esos datos o el dentista no es válido.'
  }
}

const handleApiError = (response: Response, operation: string): never => {
  const statusMessages = ERROR_MESSAGES[response.status]
  const message =
    statusMessages?.[operation] ||
    statusMessages?.default ||
    `Error al ${operation} el niño: ${response.status}`
  throw new Error(message)
}

const validateRequiredFields = (childData: ChildData): void => {
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
}

const validateNameFields = (childData: ChildData): void => {
  const nameError = validateName(childData.name)
  if (nameError) throw new Error(nameError)

  const lastNameError = validateLastName(childData.lastName)
  if (lastNameError) throw new Error(lastNameError)
}

const validateGenderField = (gender: string): void => {
  const normalizedGender = gender.toUpperCase()
  if (normalizedGender !== 'M' && normalizedGender !== 'F') {
    throw new Error('El género debe ser M o F')
  }
}

const validateChildData = (childData: ChildData): void => {
  validateRequiredFields(childData)
  validateNameFields(childData)
  validateGenderField(childData.gender)
}

const isArrayResponse = (data: unknown): data is ChildResponse[] => {
  return Array.isArray(data)
}

const isObjectWithItems = (data: unknown): data is ApiResponse => {
  return typeof data === 'object' && data !== null && 'items' in data
}

const normalizeChildItem = (child: ChildResponse): ChildResponse => ({
  ...child,
  nextAppointment: child.nextAppointment || null
})

const normalizeChildrenResponse = (data: unknown): ChildResponse[] => {
  if (!data) return []

  if (isArrayResponse(data)) {
    return data.map(normalizeChildItem)
  }

  if (isObjectWithItems(data)) {
    const response = data as ApiResponse
    return response.items?.map(normalizeChildItem) || []
  }

  return []
}

const makeApiRequest = async (
  url: string,
  method: HttpMethod = 'GET',
  body?: object
): Promise<Response> => {
  const token = getAuthToken()
  const options: RequestInit = {
    method,
    headers: createApiHeaders(token)
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  return fetch(url, options)
}

const validateAndTrimName = (name: string): string => {
  const nameError = validateName(name)
  if (nameError) throw new Error(nameError)
  return name.trim()
}

const validateAndTrimLastName = (lastName: string): string => {
  const lastNameError = validateLastName(lastName)
  if (lastNameError) throw new Error(lastNameError)
  return lastName.trim()
}

const processUpdateFields = (childData: Partial<UpdateChildData>): Partial<UpdateChildData> => {
  const processedData = { ...childData }

  if (processedData.name !== undefined) {
    processedData.name = validateAndTrimName(processedData.name)
  }

  if (processedData.lastName !== undefined) {
    processedData.lastName = validateAndTrimLastName(processedData.lastName)
  }

  return processedData
}

export async function createChildService(childData: ChildData): Promise<CreateChildResult> {
  try {
    validateChildData(childData)

    const requestBody = {
      ...childData,
      name: childData.name.trim(),
      lastName: childData.lastName.trim(),
      gender: childData.gender.toUpperCase() as 'M' | 'F'
    }

    const response = await makeApiRequest(API_BASE_URL, 'PUT', requestBody)

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
    const response = await makeApiRequest(API_BASE_URL)

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
    const response = await makeApiRequest(`${API_BASE_URL}/${childId}`)

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
  childData: UpdateChildData
): Promise<{ message: string; updatedFields: string[] }> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { childId: _, ...dataToSend } = childData
    const processedData = processUpdateFields(dataToSend)

    const requestBody = {
      childId,
      ...processedData
    }

    const response = await makeApiRequest(`${API_BASE_URL}/edit`, 'PUT', requestBody)

    if (!response.ok) {
      handleApiError(response, 'actualizar')
    }

    const data = await response.json()

    const updatedFields =
      data.updatedFields || Object.keys(processedData).filter((key) => key !== 'childId')

    return {
      message: data.message || 'Niño actualizado exitosamente',
      updatedFields
    }
  } catch (error) {
    console.error('Error en updateChildService:', error)
    throw error
  }
}

export type { ChildResponse, ChildData, UpdateChildData }
