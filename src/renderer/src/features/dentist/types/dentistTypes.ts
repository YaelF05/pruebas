export interface CreateDentistCredentials {
  professionalLicense: string
  university?: string
  speciality?: string
  about?: string
  serviceStartTime: string
  serviceEndTime: string
  phoneNumber: string
  latitude: number
  longitude: number
}

export interface CreateDentistResponse {
  message: string
}

export interface RescheduleAppointmentData {
  deactiveAppointmentId: number
  rescheduledDate: string
  reason: string
  type: string
}

export interface RescheduleAppointmentResponse {
  message: string
}

export interface DesactivateAppointmentData {
  deactiveAppointmentId: number
  reason: string
  type: string
}

export interface DesactivateAppointmentResponse {
  message: string
}

export interface AppointmentResponse {
  appointmentId: number
  dentistId: number | null
  fatherId: number | null
  childId: number | null
  reason: string
  appointmentDatetime: string
  isActive: boolean
  child?: string | null
  dentist?: string | null
}

export interface ChildByIdResponse {
  childId: number
  fatherId: number
  name: string
  lastName: string
  gender: string
  birthDate: string
  morningBrushingTime: string
  afternoonBrushingTime: string
  nightBrushingTime: string
  creationDate: string
  lastModificationDate?: string | null | undefined
  isActive: boolean
}

export interface DentistResponse {
  userId: number
  name: string
  lastName: string
  email: string
  professionalLicense: string
  university?: string
  speciality?: string
  about?: string
  serviceStartTime: string
  serviceEndTime: string
  phoneNumber: string
  latitude: number
  longitude: number
}

export interface IsFormFilledResponse {
  isFormFilled: boolean
}

export interface PaginatedResponse<T> {
  page: number
  limit: number
  totalPages: number
  items: T[]
}

export interface GetPatientsResponse {
  childId: number
  fatherId: number
  dentistId: number
  name: string
  lastName: string
  gender: string
  birthDate: string
  morningBrushingTime: string
  afternoonBrushingTime: string
  nightBrushingTime: string
  creationDate: string
  lastModificationDate: string | null | undefined
  isActive: boolean
  dentist: string
  father: string
}
