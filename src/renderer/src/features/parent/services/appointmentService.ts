import {
  AppointmentData,
  AppointmentResponse,
  CreateAppointmentResult,
  DeactivateAppointmentData
} from '../types/appointmentTypes'

const API_BASE_URL = 'https://smiltheet-api.rafabeltrans17.workers.dev/api'

// ===== VALIDATION HELPERS =====

class DateTimeValidator {
  validate(appointmentDatetime: string): Date {
    const testDate = this.parseDateTime(appointmentDatetime)
    this.validateFutureDateTime(testDate)
    this.validateBusinessHours(testDate)
    return testDate
  }

  private parseDateTime(appointmentDatetime: string): Date {
    const testDate = new Date(appointmentDatetime)
    
    if (isNaN(testDate.getTime())) {
      throw new Error('Formato de fecha inválido. Por favor selecciona una fecha y hora válidas.')
    }
    
    return testDate
  }

  private validateFutureDateTime(testDate: Date): void {
    const minTime = this.getMinimumAllowedTime()
    
    if (testDate <= minTime) {
      throw new Error('La cita debe ser al menos 30 minutos en el futuro')
    }
  }

  private getMinimumAllowedTime(): Date {
    const now = new Date()
    return new Date(now.getTime() + 30 * 60000)
  }

  private validateBusinessHours(testDate: Date): void {
    const hour = testDate.getHours()
    
    if (!this.isBusinessHour(hour)) {
      throw new Error('Las citas solo se pueden agendar entre 7:00 AM y 7:00 PM')
    }
  }

  private isBusinessHour(hour: number): boolean {
    return hour >= 7 && hour < 19
  }
}

class BasicDataValidator {
  validate(appointmentData: AppointmentData): void {
    this.validateDentistId(appointmentData.dentistId)
    this.validateChildId(appointmentData.childId)
    this.validateReason(appointmentData.reason)
  }

  private validateDentistId(dentistId: number): void {
    if (!this.isValidId(dentistId)) {
      throw new Error('ID de dentista inválido')
    }
  }

  private validateChildId(childId: number): void {
    if (!this.isValidId(childId)) {
      throw new Error('ID de hijo inválido')
    }
  }

  private isValidId(id: number): boolean {
    return Boolean(id) && id > 0
  }

  private validateReason(reason: string): void {
    const reasonTrimmed = reason.trim()
    
    this.validateReasonExists(reasonTrimmed)
    this.validateReasonLength(reasonTrimmed)
  }

  private validateReasonExists(reason: string): void {
    if (!reason) {
      throw new Error('El motivo de la cita es requerido')
    }
  }

  private validateReasonLength(reason: string): void {
    if (reason.length < 10) {
      throw new Error('El motivo debe tener al menos 10 caracteres')
    }

    if (reason.length > 255) {
      throw new Error('El motivo no puede tener más de 255 caracteres')
    }
  }
}

class AppointmentValidator {
  private dateTimeValidator = new DateTimeValidator()
  private basicDataValidator = new BasicDataValidator()

  validateAll(appointmentData: AppointmentData): void {
    this.basicDataValidator.validate(appointmentData)
    this.dateTimeValidator.validate(appointmentData.appointmentDatetime)
  }
}

// ===== DATE FORMATTER =====

class DateTimeFormatter {
  format(appointmentDatetime: string): string {
    let formattedDateTime = this.replaceTimeDelimiter(appointmentDatetime)
    formattedDateTime = this.ensureSecondsFormat(formattedDateTime)
    
    return formattedDateTime
  }

  private replaceTimeDelimiter(datetime: string): string {
    return datetime.includes('T') ? datetime.replace('T', ' ') : datetime
  }

  private ensureSecondsFormat(datetime: string): string {
    if (this.hasSecondsFormat(datetime)) {
      return datetime
    }

    if (this.hasMinutesFormat(datetime)) {
      return datetime + ':00'
    }

    return this.formatFromDateObject(datetime)
  }

  private hasSecondsFormat(datetime: string): boolean {
    return /\d{2}:\d{2}:\d{2}$/.test(datetime)
  }

  private hasMinutesFormat(datetime: string): boolean {
    return datetime.match(/\d{2}:\d{2}$/) !== null
  }

  private formatFromDateObject(appointmentDatetime: string): string {
    const date = new Date(appointmentDatetime)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    
    return `${year}-${month}-${day} ${hours}:${minutes}:00`
  }
}

// ===== ERROR HANDLER =====

class ConflictErrorResolver {
  resolve(errorMessage: string): Error {
    const errorType = this.identifyErrorType(errorMessage)
    return this.createErrorByType(errorType, errorMessage)
  }

  private identifyErrorType(message: string): string {
    if (this.isDatetimeOccupied(message)) return 'datetime'
    if (this.isInvalidFormat(message)) return 'format'
    if (this.isFutureDateError(message)) return 'future'
    return 'default'
  }

  private createErrorByType(type: string, originalMessage: string): Error {
    const errorMessages = {
      datetime: 'Ya existe una cita en ese horario. Por favor, selecciona otro horario.',
      format: 'El formato de fecha y hora no es válido.',
      future: 'Las citas solo se pueden agendar para fechas futuras.',
      default: `Conflicto al agendar la cita: ${originalMessage}`
    }

    return new Error(errorMessages[type] || errorMessages.default)
  }

  private isDatetimeOccupied(message: string): boolean {
    return message.includes('Datetime occupied') || message.includes('occupied')
  }

  private isInvalidFormat(message: string): boolean {
    return message.includes('Invalid datetime') || message.includes('format')
  }

  private isFutureDateError(message: string): boolean {
    return message.includes('future date') || message.includes('future')
  }
}

class ApiErrorHandler {
  private conflictResolver = new ConflictErrorResolver()

  handle(response: Response, errorMessage: string): Error {
    const handler = this.getErrorHandler(response.status)
    return handler(errorMessage)
  }

  private getErrorHandler(status: number): (message: string) => Error {
    const handlers = {
      400: () => new Error('Datos de la cita inválidos. Verifica que todos los campos estén completos.'),
      401: () => new Error('No tienes autorización. Por favor, inicia sesión nuevamente.'),
      404: () => new Error('No se encontró el dentista o el niño especificado.'),
      409: (msg: string) => this.conflictResolver.resolve(msg)
    }

    return handlers[status] || ((msg: string) => new Error(msg))
  }
}

// ===== HTTP CLIENT =====

class ErrorMessageExtractor {
  async extract(response: Response): Promise<string> {
    const defaultMessage = `Error al crear la cita: ${response.status}`
    
    try {
      const errorData = await response.text()
      console.error('Error del servidor:', errorData)
      return this.parseErrorData(errorData) || defaultMessage
    } catch (e) {
      console.error('Error al leer respuesta de error:', e)
      return defaultMessage
    }
  }

  private parseErrorData(errorData: string): string | null {
    try {
      const parsedError = JSON.parse(errorData)
      return parsedError.message
    } catch {
      return errorData
    }
  }
}

class AuthTokenValidator {
  validate(): string {
    const authToken = localStorage.getItem('authToken')

    if (!authToken) {
      throw new Error(
        'No se encontró el token de autenticación. Por favor, inicia sesión nuevamente.'
      )
    }
    
    return authToken
  }
}

class AppointmentHttpClient {
  private errorHandler = new ApiErrorHandler()
  private messageExtractor = new ErrorMessageExtractor()
  private tokenValidator = new AuthTokenValidator()

  validateAuthToken(): string {
    return this.tokenValidator.validate()
  }

  async getErrorMessage(response: Response): Promise<string> {
    return this.messageExtractor.extract(response)
  }

  async handleErrorResponse(response: Response): Promise<never> {
    const errorMessage = await this.getErrorMessage(response)
    throw this.errorHandler.handle(response, errorMessage)
  }
}

// ===== DATA PROCESSOR =====

class AppointmentDataProcessor {
  processAppointmentsResponse(data: any): AppointmentResponse[] {
    if (!this.isValidResponseData(data)) {
      console.warn('Formato inesperado de respuesta:', data)
      return []
    }

    if (this.hasItemsArray(data)) {
      return data.items as AppointmentResponse[]
    }

    if (Array.isArray(data)) {
      return data as AppointmentResponse[]
    }

    return []
  }

  private isValidResponseData(data: any): boolean {
    return data && typeof data === 'object'
  }

  private hasItemsArray(data: any): boolean {
    return data.items && Array.isArray(data.items)
  }
}

// ===== MAIN SERVICE FUNCTIONS =====

class AppointmentCreator {
  private httpClient = new AppointmentHttpClient()
  private validator = new AppointmentValidator()
  private formatter = new DateTimeFormatter()

  async create(appointmentData: AppointmentData): Promise<CreateAppointmentResult> {
    this.validateInput(appointmentData)
    const requestBody = this.prepareRequestBody(appointmentData)
    return this.sendRequest(requestBody)
  }

  private validateInput(appointmentData: AppointmentData): void {
    this.validator.validateAll(appointmentData)
  }

  private prepareRequestBody(appointmentData: AppointmentData): any {
    const formattedDateTime = this.formatter.format(appointmentData.appointmentDatetime)

    return {
      dentistId: appointmentData.dentistId,
      childId: appointmentData.childId,
      reason: appointmentData.reason.trim(),
      appointmentDatetime: formattedDateTime
    }
  }

  private async sendRequest(requestBody: any): Promise<CreateAppointmentResult> {
    const authToken = this.httpClient.validateAuthToken()

    const response = await fetch(`${API_BASE_URL}/appointment`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify(requestBody)
    })

    return this.handleResponse(response)
  }

  private async handleResponse(response: Response): Promise<CreateAppointmentResult> {
    if (!response.ok) {
      await this.httpClient.handleErrorResponse(response)
    }

    const data = await response.json()
    return data as CreateAppointmentResult
  }
}

class AppointmentRetriever {
  private httpClient = new AppointmentHttpClient()
  private processor = new AppointmentDataProcessor()

  async getAppointments(page: number = 1, limit: number = 50): Promise<AppointmentResponse[]> {
    const response = await this.fetchAppointments(page, limit)
    return this.processResponse(response)
  }

  private async fetchAppointments(page: number, limit: number): Promise<Response> {
    const authToken = this.httpClient.validateAuthToken()
    const queryParams = this.buildQueryParams(page, limit)

    return fetch(`${API_BASE_URL}/appointment?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      }
    })
  }

  private buildQueryParams(page: number, limit: number): URLSearchParams {
    return new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })
  }

  private async processResponse(response: Response): Promise<AppointmentResponse[]> {
    if (response.status === 404) {
      return []
    }

    if (!response.ok) {
      await this.httpClient.handleErrorResponse(response)
    }

    const data = await response.json()
    return this.processor.processAppointmentsResponse(data)
  }

  async getById(appointmentId: number): Promise<AppointmentResponse> {
    const response = await this.fetchById(appointmentId)
    return this.processGetByIdResponse(response)
  }

  private async fetchById(appointmentId: number): Promise<Response> {
    const authToken = this.httpClient.validateAuthToken()

    return fetch(`${API_BASE_URL}/appointment/${appointmentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      }
    })
  }

  private async processGetByIdResponse(response: Response): Promise<AppointmentResponse> {
    if (!response.ok) {
      await this.httpClient.handleErrorResponse(response)
    }

    const data = await response.json()
    return data as AppointmentResponse
  }
}

export async function createAppointmentService(
  appointmentData: AppointmentData
): Promise<CreateAppointmentResult> {
  try {
    const creator = new AppointmentCreator()
    return await creator.create(appointmentData)
  } catch (error) {
    console.error('Error en createAppointmentService:', error)

    if (error instanceof Error) {
      throw error
    }

    throw new Error('Error inesperado al agendar la cita. Por favor, inténtalo de nuevo.')
  }
}

export async function getAppointmentsService(
  page: number = 1,
  limit: number = 50
): Promise<AppointmentResponse[]> {
  try {
    const retriever = new AppointmentRetriever()
    return await retriever.getAppointments(page, limit)
  } catch (error) {
    console.error('Error en getAppointmentsService:', error)

    if (error instanceof Error && error.message.includes('token')) {
      throw error
    }

    console.warn('Error de red al obtener citas, retornando array vacío')
    return []
  }
}

export async function getAppointmentByIdService(
  appointmentId: number
): Promise<AppointmentResponse> {
  try {
    const retriever = new AppointmentRetriever()
    return await retriever.getById(appointmentId)
  } catch (error) {
    console.error('Error en getAppointmentByIdService:', error)
    throw error
  }
}

// ===== DEACTIVATION VALIDATORS =====

class DeactivationTypeValidator {
  validate(type: string): void {
    const validTypes = ['FINISHED', 'CANCELLED', 'RESCHEDULED']
    
    if (!validTypes.includes(type)) {
      throw new Error('Tipo de desactivación inválido')
    }
  }
}

class DeactivationReasonValidator {
  validate(reason: string): void {
    const reasonTrimmed = reason.trim()
    
    this.validateExists(reasonTrimmed)
    this.validateLength(reasonTrimmed)
  }

  private validateExists(reason: string): void {
    if (!reason) {
      throw new Error('El motivo es requerido')
    }
  }

  private validateLength(reason: string): void {
    if (reason.length < 5) {
      throw new Error('El motivo debe tener al menos 5 caracteres')
    }

    if (reason.length > 255) {
      throw new Error('El motivo no puede tener más de 255 caracteres')
    }
  }
}

class DeactivationValidator {
  private typeValidator = new DeactivationTypeValidator()
  private reasonValidator = new DeactivationReasonValidator()

  validate(deactivateData: DeactivateAppointmentData): void {
    this.typeValidator.validate(deactivateData.type)
    this.reasonValidator.validate(deactivateData.reason)
  }
}

// ===== DEACTIVATION ERROR HANDLING =====

class DeactivationConflictHandler {
  handle(errorMessage: string): Error {
    if (this.is24HourError(errorMessage)) {
      return new Error(
        'Solo se pueden cancelar o reagendar citas con al menos 24 horas de anticipación'
      )
    }

    if (this.isAlreadyDeactivated(errorMessage)) {
      return new Error('La cita ya ha sido cancelada o modificada anteriormente')
    }

    if (this.isFutureOnlyError(errorMessage)) {
      return new Error('Solo se pueden cancelar o reagendar citas futuras')
    }

    return new Error('Conflicto al modificar la cita: ' + errorMessage)
  }

  private is24HourError(message: string): boolean {
    return message.includes('24 hours')
  }

  private isAlreadyDeactivated(message: string): boolean {
    return message.includes('already deactivated')
  }

  private isFutureOnlyError(message: string): boolean {
    return message.includes('Only future appointments')
  }
}

class DeactivationErrorHandler extends ApiErrorHandler {
  private conflictHandler = new DeactivationConflictHandler()

  handle(response: Response, errorMessage: string): Error {
    const handler = this.getDeactivationErrorHandler(response.status)
    return handler(errorMessage)
  }

  private getDeactivationErrorHandler(status: number): (message: string) => Error {
    const handlers = {
      400: () => new Error('Datos inválidos para desactivar la cita'),
      401: () => new Error('No tienes autorización para realizar esta acción'),
      404: () => new Error('Cita no encontrada'),
      409: (msg: string) => this.conflictHandler.handle(msg)
    }

    return handlers[status] || ((msg: string) => new Error(msg))
  }
}

// ===== DEACTIVATION SERVICE =====

class AppointmentDeactivator {
  private httpClient = new AppointmentHttpClient()
  private validator = new DeactivationValidator()
  private errorHandler = new DeactivationErrorHandler()

  async deactivate(deactivateData: DeactivateAppointmentData): Promise<{ message: string }> {
    this.validateInput(deactivateData)
    const requestBody = this.prepareRequestBody(deactivateData)
    return this.sendDeactivationRequest(requestBody)
  }

  private validateInput(deactivateData: DeactivateAppointmentData): void {
    this.validator.validate(deactivateData)
  }

  private prepareRequestBody(deactivateData: DeactivateAppointmentData): any {
    return {
      deactiveAppointmentId: deactivateData.deactiveAppointmentId,
      reason: deactivateData.reason.trim(),
      type: deactivateData.type
    }
  }

  private async sendDeactivationRequest(requestBody: any): Promise<{ message: string }> {
    const authToken = this.httpClient.validateAuthToken()

    const response = await fetch(`${API_BASE_URL}/appointment/deactivate`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify(requestBody)
    })

    return this.handleDeactivationResponse(response)
  }

  private async handleDeactivationResponse(response: Response): Promise<{ message: string }> {
    if (!response.ok) {
      const errorMessage = await this.httpClient.getErrorMessage(response)
      throw this.errorHandler.handle(response, errorMessage)
    }

    const data = await response.json()
    return data
  }
}

export async function deactivateAppointmentService(
  deactivateData: DeactivateAppointmentData
): Promise<{ message: string }> {
  try {
    const deactivator = new AppointmentDeactivator()
    return await deactivator.deactivate(deactivateData)
  } catch (error) {
    console.error('Error en deactivateAppointmentService:', error)
    throw error
  }
}

// ===== CONVENIENCE FUNCTIONS =====

/**
 * Tipos de desactivación de citas disponibles
 */
type AppointmentDeactivationType = 'CANCELLED' | 'RESCHEDULED' | 'FINISHED'

/**
 * Factory function para crear servicios de desactivación de citas
 * Elimina la duplicación de código siguiendo el principio DRY
 */
function createAppointmentDeactivationService(type: AppointmentDeactivationType) {
  return async (appointmentId: number, reason: string): Promise<{ message: string }> => {
    return deactivateAppointmentService({
      deactiveAppointmentId: appointmentId,
      reason: reason,
      type: type
    })
  }
}

/**
 * Servicio para cancelar una cita
 */
export const cancelAppointmentService = createAppointmentDeactivationService('CANCELLED')

/**
 * Servicio para reagendar una cita
 */
export const rescheduleAppointmentService = createAppointmentDeactivationService('RESCHEDULED')

/**
 * Servicio para finalizar una cita
 */
export const finishAppointmentService = createAppointmentDeactivationService('FINISHED')

export type { AppointmentData, AppointmentResponse }