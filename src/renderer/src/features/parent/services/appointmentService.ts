// src/renderer/src/features/parent/services/appointmentService.ts

const API_BASE_URL = 'https://smiltheet-api.rafabeltrans17.workers.dev/api'

export interface AppointmentData {
  childId: number
  dentistId: number
  reason: string
  appointmentDatetime: string
}

export interface AppointmentResponse {
  appointmentId: number
  dentistId: number
  childId: number
  reason: string
  appointmentDatetime: string
  creationDate: string
  lastModificationDate?: string
  isActive: boolean
  // Relaciones populadas
  child?: {
    name: string
    lastName: string
  }
  dentist?: {
    user: {
      name: string
      lastName: string
    }
  }
}

export interface CreateAppointmentResult {
  message: string
  appointmentId: number
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
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/appointment`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify(appointmentData)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Failed to create appointment: ${response.status}`)
    }

    const data = await response.json()
    return data as CreateAppointmentResult
  } catch (error) {
    console.error('Create appointment service error:', error)
    throw error
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
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Failed to fetch appointments: ${response.status}`)
    }

    const data = await response.json()
    return data as AppointmentResponse[]
  } catch (error) {
    console.error('Get appointments service error:', error)
    throw error
  }
}

/**
 * Service to reschedule an appointment
 * @param appointmentId - The ID of the appointment to reschedule
 * @param newDatetime - The new appointment datetime
 * @param reason - The reason for rescheduling
 * @returns A promise that resolves to the reschedule result
 * @throws An error if the reschedule fails
 */
export async function rescheduleAppointmentService(
  appointmentId: number,
  newDatetime: string,
  reason: string
): Promise<{ message: string }> {
  try {
    const authToken = localStorage.getItem('authToken')

    if (!authToken) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/appointment/${appointmentId}/reschedule`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        appointmentDatetime: newDatetime,
        reason: reason
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Failed to reschedule appointment: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Reschedule appointment service error:', error)
    throw error
  }
}

/**
 * Service to cancel an appointment
 * @param appointmentId - The ID of the appointment to cancel
 * @param reason - The reason for cancellation
 * @returns A promise that resolves to the cancellation result
 * @throws An error if the cancellation fails
 */
export async function cancelAppointmentService(
  appointmentId: number,
  reason: string
): Promise<{ message: string }> {
  try {
    const authToken = localStorage.getItem('authToken')

    if (!authToken) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/appointment/${appointmentId}/cancel`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        reason: reason
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Failed to cancel appointment: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Cancel appointment service error:', error)
    throw error
  }
}
