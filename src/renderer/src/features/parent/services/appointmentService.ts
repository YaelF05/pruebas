import {
  AppointmentData,
  AppointmentResponse,
  CreateAppointmentResult,
  DeactivateAppointmentData
} from '../types/appointmentTypes'

const API_BASE_URL = 'https://smiltheet-api.rafabeltrans17.workers.dev/api'

class AppointmentValidator {
  validateAppointmentData(data: AppointmentData): void {
    this.validateIds(data.dentistId, data.childId)
    this.validateReason(data.reason)
    this.validateDateTime(data.appointmentDatetime)
  }

  validateDeactivationData(data: DeactivateAppointmentData): void {
    const validTypes = ['FINISHED', 'CANCELLED', 'RESCHEDULED']
    if (!validTypes.includes(data.type)) {
      throw new Error('Tipo de desactivación inválido')
    }
    this.validateReason(data.reason)
  }

  private validateIds(dentistId: number, childId: number): void {
    if (!dentistId || dentistId <= 0) throw new Error('ID de dentista inválido')
    if (!childId || childId <= 0) throw new Error('ID de hijo inválido')
  }

  private validateReason(reason: string): void {
    const trimmed = reason.trim()
    if (!trimmed) throw new Error('El motivo es requerido')
    if (trimmed.length < 5) throw new Error('El motivo debe tener al menos 5 caracteres')
    if (trimmed.length > 255) throw new Error('El motivo no puede tener más de 255 caracteres')
  }

  private validateDateTime(dateTime: string): void {
    const date = new Date(dateTime)
    if (isNaN(date.getTime())) {
      throw new Error('Formato de fecha inválido')
    }

    const minTime = new Date(Date.now() + 30 * 60000)
    if (date <= minTime) {
      throw new Error('La cita debe ser al menos 30 minutos en el futuro')
    }

    const hour = date.getHours()
    if (hour < 7 || hour >= 19) {
      throw new Error('Las citas solo se pueden agendar entre 7:00 AM y 7:00 PM')
    }
  }
}

class ApiErrorHandler {
  handle(response: Response, message: string): Error {
    const errorMap: Record<number, (msg: string) => Error> = {
      400: () => new Error('Datos inválidos. Verifica que todos los campos estén completos.'),
      401: () => new Error('No tienes autorización. Por favor, inicia sesión nuevamente.'),
      404: () => new Error('No se encontró el recurso especificado.'),
      409: (msg) => this.handleConflict(msg)
    }

    const handler = errorMap[response.status] || ((msg: string) => new Error(msg))
    return handler(message)
  }

  private handleConflict(message: string): Error {
    if (message.includes('occupied')) {
      return new Error('Ya existe una cita en ese horario. Por favor, selecciona otro horario.')
    }
    if (message.includes('24 hours')) {
      return new Error(
        'Solo se pueden cancelar o reagendar citas con al menos 24 horas de anticipación'
      )
    }
    if (message.includes('already deactivated')) {
      return new Error('La cita ya ha sido cancelada o modificada anteriormente')
    }
    return new Error('Conflicto al procesar la solicitud: ' + message)
  }
}

class HttpClient {
  private errorHandler = new ApiErrorHandler()

  async request<T>(
    endpoint: string,
    method: 'GET' | 'PUT' | 'DELETE' = 'GET',
    body?: unknown
  ): Promise<T> {
    const token = this.getAuthToken()

    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    }

    if (body) {
      config.body = JSON.stringify(body)
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

    if (!response.ok) {
      const errorMessage = await this.extractErrorMessage(response)
      throw this.errorHandler.handle(response, errorMessage)
    }

    return response.json()
  }

  private getAuthToken(): string {
    const token = localStorage.getItem('authToken')
    if (!token) {
      throw new Error(
        'No se encontró el token de autenticación. Por favor, inicia sesión nuevamente.'
      )
    }
    return token
  }

  private async extractErrorMessage(response: Response): Promise<string> {
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

class DateTimeFormatter {
  format(dateTime: string): string {
    let formatted = dateTime.includes('T') ? dateTime.replace('T', ' ') : dateTime
    if (!/\d{2}:\d{2}:\d{2}$/.test(formatted)) {
      formatted = formatted.match(/\d{2}:\d{2}$/)
        ? formatted + ':00'
        : this.formatFromDate(dateTime)
    }
    return formatted
  }

  private formatFromDate(dateTime: string): string {
    const date = new Date(dateTime)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:00`
  }
}

interface PaginatedResponse {
  items: AppointmentResponse[]
  page?: number
  limit?: number
  totalPages?: number
}

type AppointmentApiResponse = AppointmentResponse[] | PaginatedResponse

class ResponseProcessor {
  processAppointments(data: unknown): AppointmentResponse[] {
    if (!data || typeof data !== 'object') return []

    const response = data as AppointmentApiResponse

    // Check if it's a paginated response
    if ('items' in response && Array.isArray(response.items)) {
      return response.items
    }

    // Check if it's a direct array
    if (Array.isArray(response)) {
      return response
    }

    return []
  }
}

class AppointmentService {
  private httpClient = new HttpClient()
  private validator = new AppointmentValidator()
  private formatter = new DateTimeFormatter()
  private processor = new ResponseProcessor()

  async create(appointmentData: AppointmentData): Promise<CreateAppointmentResult> {
    this.validator.validateAppointmentData(appointmentData)

    const requestBody = {
      dentistId: appointmentData.dentistId,
      childId: appointmentData.childId,
      reason: appointmentData.reason.trim(),
      appointmentDatetime: this.formatter.format(appointmentData.appointmentDatetime)
    }

    return this.httpClient.request<CreateAppointmentResult>('/appointment', 'PUT', requestBody)
  }

  async getAppointments(page: number = 1, limit: number = 50): Promise<AppointmentResponse[]> {
    try {
      const queryParams = new URLSearchParams({ page: page.toString(), limit: limit.toString() })
      const data = await this.httpClient.request<unknown>(`/appointment?${queryParams}`)
      return this.processor.processAppointments(data)
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return []
      }
      throw error
    }
  }

  async getById(appointmentId: number): Promise<AppointmentResponse> {
    return this.httpClient.request<AppointmentResponse>(`/appointment/${appointmentId}`)
  }

  async deactivate(deactivateData: DeactivateAppointmentData): Promise<{ message: string }> {
    this.validator.validateDeactivationData(deactivateData)

    const requestBody = {
      deactiveAppointmentId: deactivateData.deactiveAppointmentId,
      reason: deactivateData.reason.trim(),
      type: deactivateData.type
    }

    return this.httpClient.request<{ message: string }>(
      '/appointment/deactivate',
      'PUT',
      requestBody
    )
  }
}

const appointmentService = new AppointmentService()

export async function createAppointmentService(
  appointmentData: AppointmentData
): Promise<CreateAppointmentResult> {
  try {
    return await appointmentService.create(appointmentData)
  } catch (error) {
    console.error('Error en createAppointmentService:', error)
    if (error instanceof Error) throw error
    throw new Error('Error inesperado al agendar la cita. Por favor, inténtalo de nuevo.')
  }
}

export async function getAppointmentsService(
  page: number = 1,
  limit: number = 50
): Promise<AppointmentResponse[]> {
  try {
    return await appointmentService.getAppointments(page, limit)
  } catch (error) {
    console.error('Error en getAppointmentsService:', error)
    if (error instanceof Error && error.message.includes('token')) throw error
    console.warn('Error de red al obtener citas, retornando array vacío')
    return []
  }
}

export async function getAppointmentByIdService(
  appointmentId: number
): Promise<AppointmentResponse> {
  try {
    return await appointmentService.getById(appointmentId)
  } catch (error) {
    console.error('Error en getAppointmentByIdService:', error)
    throw error
  }
}

export async function deactivateAppointmentService(
  deactivateData: DeactivateAppointmentData
): Promise<{ message: string }> {
  try {
    return await appointmentService.deactivate(deactivateData)
  } catch (error) {
    console.error('Error en deactivateAppointmentService:', error)
    throw error
  }
}

const createDeactivationService =
  (type: 'CANCELLED' | 'RESCHEDULED' | 'FINISHED') =>
  async (appointmentId: number, reason: string): Promise<{ message: string }> =>
    deactivateAppointmentService({ deactiveAppointmentId: appointmentId, reason, type })

export const cancelAppointmentService = createDeactivationService('CANCELLED')
export const rescheduleAppointmentService = createDeactivationService('RESCHEDULED')
export const finishAppointmentService = createDeactivationService('FINISHED')

export type { AppointmentData, AppointmentResponse }
