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

export async function createAppointmentService(
  appointmentData: AppointmentData
): Promise<CreateAppointmentResult> {
  try {
    const authToken = localStorage.getItem('authToken')

    if (!authToken) {
      throw new Error('No authentication token found')
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

    // Validar que la fecha sea futura
    const appointmentDate = new Date(appointmentData.appointmentDatetime)
    const now = new Date()

    if (appointmentDate <= now) {
      throw new Error('La fecha de la cita debe ser en el futuro')
    }

    const requestBody = {
      dentistId: appointmentData.dentistId,
      childId: appointmentData.childId,
      reason: appointmentData.reason.trim(),
      appointmentDatetime: appointmentData.appointmentDatetime
    }

    console.log('Enviando datos de cita:', requestBody)

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
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
        console.error('Error del servidor:', errorData)
      } catch (e) {
        console.error('Error al parsear respuesta de error:', e)
      }

      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log('Cita creada exitosamente:', data)
    return data as CreateAppointmentResult
  } catch (error) {
    console.error('Error en createAppointmentService:', error)
    throw error
  }
}

export async function getAppointmentsService(): Promise<AppointmentResponse[]> {
  try {
    const authToken = localStorage.getItem('authToken')

    if (!authToken) {
      throw new Error('No authentication token found')
    }

    console.log('Obteniendo citas del usuario...')

    const response = await fetch(`${API_BASE_URL}/appointment`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
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

      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log('Citas recibidas:', data)

    // La API puede devolver datos paginados o directamente el array
    if (data.items && Array.isArray(data.items)) {
      return data.items as AppointmentResponse[]
    }

    if (Array.isArray(data)) {
      return data as AppointmentResponse[]
    }

    console.warn('Formato inesperado de respuesta:', data)
    return []
  } catch (error) {
    console.error('Error en getAppointmentsService:', error)
    throw error
  }
}
