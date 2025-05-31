export interface ChildData {
  name: string
  lastName: string
  gender: 'M' | 'F'
  birthDate: string
  dentistId: number
  morningBrushingTime: string
  afternoonBrushingTime: string
  nightBrushingTime: string
}

export interface ChildResponse {
  childId: number
  fatherId: number
  dentistId?: number
  name: string
  lastName: string
  gender: 'M' | 'F'
  birthDate: string
  morningBrushingTime: string
  afternoonBrushingTime: string
  nightBrushingTime: string
  creationDate: string
  lastModificationDate?: string
  isActive: boolean
  nextAppointment?: string | null
}

export interface CreateChildResult {
  message: string
  childId?: number
}
