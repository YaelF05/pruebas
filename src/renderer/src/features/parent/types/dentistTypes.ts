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
  distance?: number
}

export interface DentistListItem {
  userId: number
  name: string
}
