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

export interface DeactivateAppointmentData {
  deactiveAppointmentId: number
  reason: string
  type: 'FINISHED' | 'CANCELLED' | 'RESCHEDULED'
}

export interface DeactivateAppointmentResult {
  message: string
}

export interface PaginatedAppointmentResponse {
  page: number
  limit: number
  totalPages: number
  items: AppointmentResponse[]
}
