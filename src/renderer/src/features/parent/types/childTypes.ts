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

export interface CreateChildRequest {
  name: string
  lastName: string
  gender: 'M' | 'F'
  birthDate: string
  dentistId: number
  morningBrushingTime: string
  afternoonBrushingTime: string
  nightBrushingTime: string
}

export interface ChildFormErrors {
  name?: string
  lastName?: string
  gender?: string
  birthDate?: string
  dentistId?: string
  morningBrushingTime?: string
  afternoonBrushingTime?: string
  nightBrushingTime?: string
}

export interface UpdateChildData {
  name?: string
  lastName?: string
  gender?: 'M' | 'F'
  birthDate?: string
  dentistId?: number
  morningBrushingTime?: string
  afternoonBrushingTime?: string
  nightBrushingTime?: string
}

export enum Gender {
  MALE = 'M',
  FEMALE = 'F'
}

export const FormatValidators = {
  birthDate: (date: string): boolean => {
    return /^\d{4}-\d{2}-\d{2}$/.test(date)
  },

  time: (time: string): boolean => {
    return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)
  },

  gender: (gender: string): gender is 'M' | 'F' => {
    return gender === 'M' || gender === 'F'
  },

  name: (name: string): boolean => {
    return /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/.test(name.trim())
  }
}
