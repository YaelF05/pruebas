import { ChildData, ChildResponse, CreateChildResult } from '../types/childTypes'
import { validateName, validateLastName } from '@renderer/utils/validators'

const API_BASE_URL = 'https://smiltheet-api.rafabeltrans17.workers.dev/api/child'

class ChildValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ChildValidationError'
  }
}

class AuthenticationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthenticationError'
  }
}

class ApiRequestError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message)
    this.name = 'ApiRequestError'
  }
}

class FieldValidator {
  static validateRequired(value: unknown, fieldName: string): void {
    if (!value) {
      throw new ChildValidationError(`El campo ${fieldName} es requerido`)
    }
  }

  static validateName(name: string): void {
    const validation = validateName(name)
    if (validation) {
      throw new ChildValidationError(validation)
    }
  }

  static validateLastName(lastName: string): void {
    const validation = validateLastName(lastName)
    if (validation) {
      throw new ChildValidationError(validation)
    }
  }

  static validateGender(gender: string): 'M' | 'F' {
    const normalized = gender.toUpperCase()
    if (normalized !== 'M' && normalized !== 'F') {
      throw new ChildValidationError('El género debe ser M o F')
    }
    return normalized as 'M' | 'F'
  }
}

class AuthManager {
  static getToken(): string {
    const token = localStorage.getItem('authToken')
    if (!token) {
      throw new AuthenticationError(
        'No se encontró el token de autenticación. Por favor, inicia sesión nuevamente.'
      )
    }
    return token
  }

  static createAuthHeaders(token: string): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  }
}

class HttpClient {
  static async makeRequest(url: string, options: RequestInit): Promise<Response> {
    try {
      return await fetch(url, options)
    } catch (error) {
      throw new ApiRequestError(`Error de conexión: ${error}`)
    }
  }

  static async handleJsonResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorMessage = await this.extractErrorMessage(response)
      throw new ApiRequestError(errorMessage, response.status)
    }
    return response.json()
  }

  private static async extractErrorMessage(response: Response): Promise<string> {
    try {
      const errorData = await response.text()
      try {
        const parsed = JSON.parse(errorData)
        return parsed.message || errorData
      } catch {
        return errorData || `Error ${response.status}`
      }
    } catch {
      return `Error al procesar la respuesta: ${response.status}`
    }
  }
}

class ErrorMapper {
  static mapCreateChildError(error: ApiRequestError): never {
    const status = error.status
    const message = error.message

    switch (status) {
      case 400:
        throw new Error('Datos del niño inválidos. Verifica que todos los campos estén completos.')
      case 401:
        throw new Error('No tienes autorización. Por favor, inicia sesión nuevamente.')
      case 404:
        throw new Error('No se encontró el dentista especificado.')
      case 409:
        throw new Error(this.mapConflictError(message))
      default:
        throw new Error(message)
    }
  }

  private static mapConflictError(message: string): string {
    if (message.includes('UNIQUE') || message.includes('unique')) {
      return 'Ya existe un niño con esos datos.'
    }
    if (message.includes('FOREIGN KEY') || message.includes('foreign')) {
      return 'El dentista seleccionado no es válido.'
    }
    return 'Conflicto al crear el niño: ' + message
  }

  static mapGetChildError(status: number): never {
    switch (status) {
      case 404:
        throw new Error('Niño no encontrado')
      case 401:
        throw new Error('El niño no te pertenece o no tienes autorización')
      default:
        throw new Error(`Error al obtener el niño: ${status}`)
    }
  }
}

class DataTransformer {
  static createChildRequest(
    childData: ChildData,
    validatedGender: 'M' | 'F'
  ): {
    name: string
    lastName: string
    gender: 'M' | 'F'
    birthDate: string
    dentistId: number
    morningBrushingTime: string
    afternoonBrushingTime: string
    nightBrushingTime: string
  } {
    return {
      name: childData.name.trim(),
      lastName: childData.lastName.trim(),
      gender: validatedGender,
      birthDate: childData.birthDate,
      dentistId: childData.dentistId,
      morningBrushingTime: childData.morningBrushingTime,
      afternoonBrushingTime: childData.afternoonBrushingTime,
      nightBrushingTime: childData.nightBrushingTime
    }
  }

  static cleanUpdateData(childData: Partial<ChildData>): Partial<ChildData> {
    const cleaned = { ...childData }
    if (cleaned.name !== undefined) {
      cleaned.name = cleaned.name.trim()
    }
    if (cleaned.lastName !== undefined) {
      cleaned.lastName = cleaned.lastName.trim()
    }
    return cleaned
  }

  static normalizeChildrenResponse(data: unknown): ChildResponse[] {
    const childrenArray = this.extractChildrenArray(data)
    return childrenArray.map(this.normalizeChildResponse)
  }

  private static extractChildrenArray(data: unknown): ChildResponse[] {
    if (Array.isArray(data)) return data
    if (data && typeof data === 'object' && 'items' in data && Array.isArray(data.items)) {
      return data.items
    }
    console.warn('Formato inesperado de respuesta:', data)
    return []
  }

  private static normalizeChildResponse(child: ChildResponse): ChildResponse {
    return {
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
    }
  }
}

class CreateChildValidator {
  static validateAllFields(childData: ChildData): 'M' | 'F' {
    this.validateRequiredFields(childData)
    this.validateNames(childData)
    return this.validateGender(childData)
  }

  private static validateRequiredFields(childData: ChildData): void {
    const requiredFields: (keyof ChildData)[] = [
      'name',
      'lastName',
      'dentistId',
      'gender',
      'birthDate',
      'morningBrushingTime',
      'afternoonBrushingTime',
      'nightBrushingTime'
    ]
    requiredFields.forEach((field): void => {
      FieldValidator.validateRequired(childData[field], field)
    })
  }

  private static validateNames(childData: ChildData): void {
    FieldValidator.validateName(childData.name)
    FieldValidator.validateLastName(childData.lastName)
  }

  private static validateGender(childData: ChildData): 'M' | 'F' {
    return FieldValidator.validateGender(childData.gender)
  }
}

class UpdateChildValidator {
  static validatePartialData(childData: Partial<ChildData>): void {
    if (childData.name !== undefined) {
      FieldValidator.validateName(childData.name)
    }
    if (childData.lastName !== undefined) {
      FieldValidator.validateLastName(childData.lastName)
    }
  }
}

export async function createChildService(childData: ChildData): Promise<CreateChildResult> {
  try {
    const validatedGender = CreateChildValidator.validateAllFields(childData)

    const token = AuthManager.getToken()
    const requestBody = DataTransformer.createChildRequest(childData, validatedGender)

    const response = await sendCreateChildRequest(requestBody, token)
    return await HttpClient.handleJsonResponse<CreateChildResult>(response)
  } catch (error) {
    return handleCreateChildError(error)
  }
}

export async function updateChildService(
  childId: number,
  childData: Partial<ChildData>
): Promise<{ message: string }> {
  try {
    UpdateChildValidator.validatePartialData(childData)

    const token = AuthManager.getToken()
    const cleanData = DataTransformer.cleanUpdateData(childData)
    const response = await sendUpdateChildRequest(childId, cleanData, token)

    const result = await HttpClient.handleJsonResponse<{ message: string }>(response)
    return result
  } catch (error) {
    console.error('Error en updateChildService:', error)
    throw error
  }
}

export async function getChildrenService(): Promise<ChildResponse[]> {
  try {
    const token = AuthManager.getToken()
    const response = await sendGetChildrenRequest(token)

    return await handleGetChildrenResponse(response)
  } catch (error) {
    console.error('Error en getChildrenService:', error)
    return []
  }
}

export async function getChildByIdService(childId: number): Promise<ChildResponse> {
  try {
    const token = AuthManager.getToken()
    const response = await sendGetChildByIdRequest(childId, token)

    return await handleGetChildByIdResponse(response)
  } catch (error) {
    console.error('Error en getChildByIdService:', error)
    throw error
  }
}

async function sendCreateChildRequest(requestBody: unknown, token: string): Promise<Response> {
  return HttpClient.makeRequest(API_BASE_URL, {
    method: 'PUT',
    headers: AuthManager.createAuthHeaders(token),
    body: JSON.stringify(requestBody)
  })
}

async function sendUpdateChildRequest(
  childId: number,
  data: unknown,
  token: string
): Promise<Response> {
  return HttpClient.makeRequest(`${API_BASE_URL}/${childId}`, {
    method: 'PUT',
    headers: AuthManager.createAuthHeaders(token),
    body: JSON.stringify(data)
  })
}

async function sendGetChildrenRequest(token: string): Promise<Response> {
  return HttpClient.makeRequest(API_BASE_URL, {
    method: 'GET',
    headers: AuthManager.createAuthHeaders(token)
  })
}

async function sendGetChildByIdRequest(childId: number, token: string): Promise<Response> {
  return HttpClient.makeRequest(`${API_BASE_URL}/${childId}`, {
    method: 'GET',
    headers: AuthManager.createAuthHeaders(token)
  })
}

function handleCreateChildError(error: unknown): never {
  console.error('Error en createChildService:', error)

  if (error instanceof ApiRequestError) {
    ErrorMapper.mapCreateChildError(error)
  }

  throw error
}

async function handleGetChildrenResponse(response: Response): Promise<ChildResponse[]> {
  if (response.ok) {
    const data = await response.json()
    return DataTransformer.normalizeChildrenResponse(data)
  }

  if (response.status === 404) {
    return []
  }

  console.error(`Error HTTP: ${response.status}`)
  return []
}

async function handleGetChildByIdResponse(response: Response): Promise<ChildResponse> {
  if (response.ok) {
    return response.json()
  }

  ErrorMapper.mapGetChildError(response.status)
}

export type { ChildResponse, ChildData }
