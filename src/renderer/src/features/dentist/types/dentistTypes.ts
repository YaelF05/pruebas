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
