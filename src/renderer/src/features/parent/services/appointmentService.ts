const API_BASE_URL = 'https://smiltheet-api.rafabeltrans17.workers.dev/api'

export interface AppointmentData {
  dentistId: number
  childId: number
  reason: string
  appointmentDatetime: string
}

export interface AppointmentResponse {
  appointmentId: number
  dentistId: number | null
  fatherId: number | null
  childId: number | null
  reason: string
  appointmentDatetime: string
  creationDate: string
  lastModificationDate: string | null
  isActive: boolean
  // Campos adicionales que pueden venir del JOIN con Child
  childName?: string
  childLastname?: string
}

export interface CreateAppointmentResult {
  message: string
}

export interface DeactivateAppointmentData {
  deactiveAppointmentId: number
  reason: string
  type: 'FINISHED' | 'CANCELLED' | 'RESCHEDULED'
}

/**
 * Service to create a new appointment
 * @param appointmentData - The appointment data
 * @returns A promise that resolves to the appointment creation result
 * @throws An error if the creation fails
 */
export async function createAppointmentService(
  appointmentData: AppointmentData
): Promise<CreateAppointmentResult> {
  try {
    const authToken = localStorage.getItem('authToken')

    if (!authToken) {
      throw new Error(
        'No se encontró el token de autenticación. Por favor, inicia sesión nuevamente.'
      )
    }

    // Validar datos antes de enviar
    if (!appointmentData.dentistId || appointmentData.dentistId <= 0) {
      throw new Error('ID de dentista inválido')
    }

    if (!appointmentData.childId || appointmentData.childId <= 0) {
      throw new Error('ID de hijo inválido')
    }

    if (!appointmentData.reason.trim()) {
      throw new Error('El motivo de la cita es requerido')
    }

    if (appointmentData.reason.trim().length < 10) {
      throw new Error('El motivo debe tener al menos 10 caracteres')
    }

    // Convertir formato de fecha del frontend al formato esperado por el backend
    // Frontend: "2024-12-25T14:30:00" -> Backend: "2024-12-25 14:30:00"
    let formattedDateTime = appointmentData.appointmentDatetime

    // Validar que la fecha sea válida antes de procesar
    const testDate = new Date(formattedDateTime)
    if (isNaN(testDate.getTime())) {
      throw new Error('Formato de fecha inválido. Por favor selecciona una fecha y hora válidas.')
    }

    // Convertir al formato esperado por el backend
    if (formattedDateTime.includes('T')) {
      formattedDateTime = formattedDateTime.replace('T', ' ')
    }

    // Asegurar que tenga segundos
    if (!/\d{2}:\d{2}:\d{2}$/.test(formattedDateTime)) {
      if (formattedDateTime.match(/\d{2}:\d{2}$/)) {
        formattedDateTime = formattedDateTime + ':00'
      } else {
        // Si no tiene el formato correcto, reconstruir desde el objeto Date
        const date = new Date(appointmentData.appointmentDatetime)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:00`
      }
    }

    console.log('Fecha original:', appointmentData.appointmentDatetime)
    console.log('Fecha formateada para backend:', formattedDateTime)

    // Validar que la fecha sea futura (más permisivo que antes)
    const appointmentDate = new Date(appointmentData.appointmentDatetime)
    const now = new Date()
    const minTime = new Date(now.getTime() + 10 * 60000) // 10 minutos en el futuro

    if (appointmentDate <= minTime) {
      throw new Error('La cita debe ser al menos 10 minutos en el futuro')
    }

    // Validar horario de trabajo más flexible (7:00 AM - 7:00 PM)
    const hour = appointmentDate.getHours()
    if (hour < 7 || hour >= 19) {
      throw new Error('Las citas solo se pueden agendar entre 7:00 AM y 7:00 PM')
    }

    // Preparar los datos exactamente como los espera el backend
    const requestBody = {
      dentistId: appointmentData.dentistId,
      childId: appointmentData.childId,
      reason: appointmentData.reason.trim(),
      appointmentDatetime: formattedDateTime // Formato corregido
    }

    console.log('Enviando datos de cita al backend:', requestBody)

    const response = await fetch(`${API_BASE_URL}/appointment`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      let errorMessage = `Error al crear la cita: ${response.status}`

      try {
        const errorData = await response.text()
        console.error('Error del servidor:', errorData)

        // Intentar parsear como JSON
        try {
          const parsedError = JSON.parse(errorData)
          errorMessage = parsedError.message || errorMessage
        } catch {
          // Si no es JSON válido, usar el texto tal como está
          errorMessage = errorData || errorMessage
        }
      } catch (e) {
        console.error('Error al leer respuesta de error:', e)
      }

      // Mensajes específicos según el código de error
      switch (response.status) {
        case 400:
          throw new Error(
            'Datos de la cita inválidos. Verifica que todos los campos estén completos.'
          )
        case 401:
          throw new Error('No tienes autorización. Por favor, inicia sesión nuevamente.')
        case 409:
          if (errorMessage.includes('Datetime occupied') || errorMessage.includes('occupied')) {
            throw new Error(
              'Ya existe una cita en ese horario. Por favor, selecciona otro horario.'
            )
          } else if (errorMessage.includes('Invalid datetime') || errorMessage.includes('format')) {
            throw new Error('El formato de fecha y hora no es válido.')
          } else if (errorMessage.includes('future date') || errorMessage.includes('future')) {
            throw new Error('Las citas solo se pueden agendar para fechas futuras.')
          } else {
            throw new Error('Conflicto al agendar la cita: ' + errorMessage)
          }
        case 404:
          throw new Error('No se encontró el dentista o el niño especificado.')
        default:
          throw new Error(errorMessage)
      }
    }

    const data = await response.json()
    console.log('Cita creada exitosamente:', data)
    return data as CreateAppointmentResult
  } catch (error) {
    console.error('Error en createAppointmentService:', error)

    // Si es un error que ya procesamos, re-lanzarlo
    if (error instanceof Error) {
      throw error
    }

    // Para cualquier otro error no manejado
    throw new Error('Error inesperado al agendar la cita. Por favor, inténtalo de nuevo.')
  }
}

/**
 * Service to get appointments for the current user
 * @param page - Page number for pagination (default: 1)
 * @param limit - Number of items per page (default: 50)
 * @returns A promise that resolves to the list of appointments
 * @throws An error if the fetch fails
 */
export async function getAppointmentsService(
  page: number = 1,
  limit: number = 50
): Promise<AppointmentResponse[]> {
  try {
    const authToken = localStorage.getItem('authToken')

    if (!authToken) {
      throw new Error('No se encontró el token de autenticación')
    }

    console.log('Obteniendo citas del usuario...')

    // Agregar parámetros de paginación
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })

    const response = await fetch(`${API_BASE_URL}/appointment?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      }
    })

    if (!response.ok) {
      if (response.status === 404) {
        // No hay citas, retornar array vacío
        console.log('No se encontraron citas para el usuario')
        return []
      }

      let errorMessage = `Error al obtener citas: ${response.status}`
      try {
        const errorData = await response.text()
        console.error('Error al obtener citas:', errorData)
        errorMessage = errorData || errorMessage
      } catch (e) {
        console.error('Error al parsear respuesta:', e)
      }

      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log('Citas recibidas del backend:', data)

    // El backend devuelve datos paginados con la estructura: { page, limit, totalPages, items }
    if (data && typeof data === 'object') {
      if (data.items && Array.isArray(data.items)) {
        return data.items as AppointmentResponse[]
      } else if (Array.isArray(data)) {
        return data as AppointmentResponse[]
      }
    }

    console.warn('Formato inesperado de respuesta:', data)
    return []
  } catch (error) {
    console.error('Error en getAppointmentsService:', error)

    // Si es un error de autenticación, re-lanzarlo
    if (error instanceof Error && error.message.includes('token')) {
      throw error
    }

    // Para errores de red, retornar array vacío para no romper la UI
    console.warn('Error de red al obtener citas, retornando array vacío')
    return []
  }
}

/**
 * Service to get a specific appointment by ID
 * @param appointmentId - The ID of the appointment
 * @returns A promise that resolves to the appointment data
 * @throws An error if the fetch fails
 */
export async function getAppointmentByIdService(
  appointmentId: number
): Promise<AppointmentResponse> {
  try {
    const authToken = localStorage.getItem('authToken')

    if (!authToken) {
      throw new Error('No se encontró el token de autenticación')
    }

    const response = await fetch(`${API_BASE_URL}/appointment/${appointmentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      }
    })

    if (!response.ok) {
      let errorMessage = `Error al obtener la cita: ${response.status}`

      try {
        const errorData = await response.text()
        errorMessage = errorData || errorMessage
      } catch (e) {
        console.error('Error al parsear respuesta:', e)
      }

      if (response.status === 404) {
        throw new Error('Cita no encontrada')
      }

      if (response.status === 401) {
        throw new Error('La cita no te pertenece o no tienes autorización')
      }

      throw new Error(errorMessage)
    }

    const data = await response.json()
    return data as AppointmentResponse
  } catch (error) {
    console.error('Error en getAppointmentByIdService:', error)
    throw error
  }
}

/**
 * Service to deactivate an appointment (cancel, reschedule, or mark as finished)
 * @param deactivateData - The deactivation data
 * @returns A promise that resolves to the deactivation result
 * @throws An error if the deactivation fails
 */
export async function deactivateAppointmentService(
  deactivateData: DeactivateAppointmentData
): Promise<{ message: string }> {
  try {
    const authToken = localStorage.getItem('authToken')

    if (!authToken) {
      throw new Error('No se encontró el token de autenticación')
    }

    // Validar que el tipo sea válido
    const validTypes = ['FINISHED', 'CANCELLED', 'RESCHEDULED']
    if (!validTypes.includes(deactivateData.type)) {
      throw new Error('Tipo de desactivación inválido')
    }

    if (!deactivateData.reason.trim()) {
      throw new Error('El motivo es requerido')
    }

    // Preparar datos exactamente como los espera el backend
    const requestBody = {
      deactiveAppointmentId: deactivateData.deactiveAppointmentId,
      reason: deactivateData.reason.trim(),
      type: deactivateData.type
    }

    console.log('Desactivando cita:', requestBody)

    const response = await fetch(`${API_BASE_URL}/appointment/deactivate`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      let errorMessage = `Error al ${deactivateData.type.toLowerCase()} la cita: ${response.status}`

      try {
        const errorData = await response.text()
        errorMessage = errorData || errorMessage
      } catch (e) {
        console.error('Error al parsear respuesta:', e)
      }

      // Mensajes específicos según el código de error
      switch (response.status) {
        case 400:
          throw new Error('Datos inválidos para desactivar la cita')
        case 401:
          throw new Error('No tienes autorización para realizar esta acción')
        case 404:
          throw new Error('Cita no encontrada')
        case 409:
          if (errorMessage.includes('24 hours')) {
            throw new Error(
              'Solo se pueden cancelar o reagendar citas con al menos 24 horas de anticipación'
            )
          } else if (errorMessage.includes('already deactivated')) {
            throw new Error('La cita ya ha sido cancelada o modificada anteriormente')
          } else if (errorMessage.includes('Only future appointments')) {
            throw new Error('Solo se pueden cancelar o reagendar citas futuras')
          } else {
            throw new Error('Conflicto al modificar la cita: ' + errorMessage)
          }
        default:
          throw new Error(errorMessage)
      }
    }

    const data = await response.json()
    console.log('Cita desactivada exitosamente:', data)
    return data
  } catch (error) {
    console.error('Error en deactivateAppointmentService:', error)
    throw error
  }
}

/**
 * Helper function to cancel an appointment
 */
export async function cancelAppointmentService(
  appointmentId: number,
  reason: string
): Promise<{ message: string }> {
  return deactivateAppointmentService({
    deactiveAppointmentId: appointmentId,
    reason: reason,
    type: 'CANCELLED'
  })
}

/**
 * Helper function to reschedule an appointment
 */
export async function rescheduleAppointmentService(
  appointmentId: number,
  reason: string
): Promise<{ message: string }> {
  return deactivateAppointmentService({
    deactiveAppointmentId: appointmentId,
    reason: reason,
    type: 'RESCHEDULED'
  })
}

/**
 * Helper function to mark an appointment as finished
 */
export async function finishAppointmentService(
  appointmentId: number,
  reason: string
): Promise<{ message: string }> {
  return deactivateAppointmentService({
    deactiveAppointmentId: appointmentId,
    reason: reason,
    type: 'FINISHED'
  })
}
