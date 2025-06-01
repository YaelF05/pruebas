export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResult {
  token: string
  expiration: number
  userType: string
}

export interface SignupCredentials {
  type: string
  name: string
  lastName: string
  birthDate: string
  email: string
  password: string
  confirmPassword: string
}

export interface SignupResult {
  message: string
}

export interface AuthState {
  isAuthenticated: boolean
  token: string | null
  expiration: number | null
  userType: string | null
  isLoading: boolean
}
