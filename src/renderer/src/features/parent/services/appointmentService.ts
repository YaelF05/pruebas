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
}

export interface CreateAppointmentResult {
  message: string
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

    // Validar que la fecha sea futura
    const appointmentDate = new Date(appointmentData.appointmentDatetime)
    const now = new Date()
    const minTime = new Date(now.getTime() + 30 * 60000) // 30 minutos en el futuro

    if (appointmentDate <= minTime) {
      throw new Error('La cita debe ser al menos 30 minutos en el futuro')
    }

    // Validar horario de trabajo (8:00 AM - 6:00 PM)
    const hour = appointmentDate.getHours()
    if (hour < 8 || hour >= 18) {
      throw new Error('Las citas solo se pueden agendar entre 8:00 AM y 6:00 PM')
    }

    // Validar que no sea domingo
    const dayOfWeek = appointmentDate.getDay()
    if (dayOfWeek === 0) {
      throw new Error('No se pueden agendar citas los domingos')
    }

    // Preparar los datos para el backend exactamente como los espera
    const requestBody = {
      dentistId: appointmentData.dentistId,
      childId: appointmentData.childId,
      reason: appointmentData.reason.trim(),
      appointmentDatetime: appointmentData.appointmentDatetime
    }

    console.log('Enviando datos de cita al backend:', requestBody)

    const response = await fetch(`${API_BASE_URL}/appointment`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      let errorMessage = `Error al crear la cita: ${response.status}`

      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
        console.error('Error del servidor:', errorData)
      } catch (e) {
        console.error('Error al parsear respuesta de error:', e)
        const responseText = await response.text()
        console.error('Respuesta del servidor:', responseText)
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
          if (errorMessage.includes('Datetime occupied')) {
            throw new Error(
              'Ya existe una cita en ese horario. Por favor, selecciona otro horario.'
            )
          } else if (errorMessage.includes('Invalid datetime')) {
            throw new Error('El formato de fecha y hora no es válido.')
          } else {
            throw new Error('Conflicto al agendar la cita. ' + errorMessage)
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
 * @returns A promise that resolves to the list of appointments
 * @throws An error if the fetch fails
 */
export async function getAppointmentsService(): Promise<AppointmentResponse[]> {
  try {
    const authToken = localStorage.getItem('authToken')

    if (!authToken) {
      throw new Error('No se encontró el token de autenticación')
    }

    console.log('Obteniendo citas del usuario...')

    const response = await fetch(`${API_BASE_URL}/appointment`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    })

    if (!response.ok) {
      let errorMessage = `Error al obtener citas: ${response.status}`

      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
        console.error('Error al obtener citas:', errorData)
      } catch (e) {
        console.error('Error al parsear respuesta:', e)
      }

      if (response.status === 404) {
        // No hay citas, retornar array vacío
        return []
      }

      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log('Citas recibidas:', data)

    // La API devuelve datos paginados
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
    throw error
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
        'Authorization': `Bearer ${authToken}`
      }
    })

    if (!response.ok) {
      let errorMessage = `Error al obtener la cita: ${response.status}`

      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch (e) {
        console.error('Error al parsear respuesta:', e)
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
