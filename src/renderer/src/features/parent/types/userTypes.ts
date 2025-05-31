export interface UserProfileResponse {
  userId: number
  name: string
  lastName: string
  birthDate: string
  email: string
  type: 'FATHER' | 'DENTIST'
  creationDate: string
  lastModificationDate?: string
  isActive: boolean
}
