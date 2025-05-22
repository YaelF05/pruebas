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

    const requestBody = {
      dentistId: appointmentData.dentistId,
      childId: appointmentData.childId,
      reason: appointmentData.reason,
      appointmentDatetime: appointmentData.appointmentDatetime
    }

    console.log('Enviando datos de cita:', requestBody) // Debug

    const response = await fetch(`${API_BASE_URL}/appointment`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      let errorMessage = `Failed to create appointment: ${response.status}`

      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch (e) {
        alert(e)
      }

      throw new Error(errorMessage)
    }

    const data = await response.json()
    return data as CreateAppointmentResult
  } catch (error) {
    console.error('Create appointment service error:', error)
    throw error
  }
}

export async function getAppointmentsService(): Promise<AppointmentResponse[]> {
  try {
    const authToken = localStorage.getItem('authToken')

    if (!authToken) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/appointment`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      }
    })

    if (!response.ok) {
      let errorMessage = `Failed to fetch appointments: ${response.status}`

      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch (e) {
        alert(e)
      }

      throw new Error(errorMessage)
    }

    const data = await response.json()

    if (data.items && Array.isArray(data.items)) {
      return data.items as AppointmentResponse[]
    }

    return data as AppointmentResponse[]
  } catch (error) {
    console.error('Get appointments service error:', error)
    throw error
  }
}
