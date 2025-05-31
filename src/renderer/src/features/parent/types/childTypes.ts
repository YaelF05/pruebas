// src/renderer/src/features/parent/types/childTypes.ts

// Tipos que coinciden exactamente con el backend
export interface ChildData {
  name: string
  lastName: string
  gender: 'M' | 'F'
  birthDate: string
  dentistId: number
  morningBrushingTime: string
  afternoonBrushingTime: string
  nightBrushingTime: string
  // Nota: fatherId NO se incluye aquí porque se obtiene del JWT en el backend
}

export interface ChildResponse {
  childId: number
  fatherId: number
  dentistId?: number // Opcional según el schema del backend
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
  nextAppointment?: string | null // Campo adicional que puede venir del frontend
}

export interface CreateChildResult {
  message: string
  childId?: number
}

// Tipo para el request que se envía al backend (sin fatherId)
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

// Tipo para validaciones del formulario
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