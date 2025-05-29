/**
 * Validate an e-mail.
 *
 * @param email Dirección de correo electrónico a validar.
 * @returns An error message if the email is invalid, or 'null' if it is valid.
 */
export function validateEmail(email: string): string | null {
  if (!email.trim()) {
    return 'El campo de correo no puede estar vacío'
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return 'El correo no tiene un formato válido'
  }
  return null
}

/**
 * Validate a password.
 *
 * @param password - Password to validate.
 * @returns An error message if the password does not meet the requirements, or 'null' if it is valid.
 */
export function validatePassword(password: string): string | null {
  if (!password.trim()) {
    return 'El campo de contraseña no puede estar vacío'
  }
  if (password.length < 1) {
    return 'La contraseña debe tener al menos 6 caracteres'
  }
  if (password.length > 14) {
    return 'La contraseña debe tener menos de 14 caracteres'
  }
  return null
}

/**
 * Validate a rol.
 *
 * @param type Rol to validate.
 * @returns An error message if the rol is not valid, or 'null' if it is valid.
 */
export function validateType(type: string): string | null {
  if (!type.trim()) {
    return 'El campo de rol no puede estar vacío'
  }
  if (type != 'DENTIST' && type != 'FATHER') {
    return 'El rol solo puede ser DENTIST o FATHER'
  }
  return null
}

/**
 * Validate a name.
 *
 * @param name Name to validate.
 * @returns An error message if the name is not valid, or 'null' if it is valid.
 */
export function validateName(name: string): string | null {
  if (!name.trim()) {
    return 'El campo de nombre no puede estar vacío'
  }
  const nameRegex = /^[a-zA-ZÀ-ÿ\s]+$/
  if (!nameRegex.test(name)) {
    return 'El nombre solo puede contener letras y espacios'
  }
  if (name.length > 255) {
    return 'El nombre debe tener menos de 255 caracteres'
  }
  return null
}

/**
 * Validate a last name.
 *
 * @param lastName Last name to validate.
 * @returns An error message if the last name is not valid, or 'null' if it is valid.
 */
export function validateLastName(lastName: string): string | null {
  if (!lastName.trim()) {
    return 'El campo de apellido no puede estar vacío'
  }
  const lastNameRegex = /^[a-zA-ZÀ-ÿ\s]+$/
  if (!lastNameRegex.test(lastName)) {
    return 'El apellido solo puede contener letras y espacios'
  }
  if (lastName.length > 255) {
    return 'El apellido debe tener menos de 255 caracteres'
  }
  return null
}

/**
 * Validate a birth date.
 *
 * @param birthDate Birth date to validate.
 * @returns An error message if the birth date is not valid, or 'null' if it is valid.
 */

export function validateBirthDate(birthDate: string): string | null {
  if (!birthDate.trim()) {
    return 'El campo de fecha de nacimiento no puede estar vacío'
  }
  const birthDateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!birthDateRegex.test(birthDate)) {
    return 'La fecha de nacimiento no tiene un formato válido (YYYY-MM-DD)'
  }
  const date = new Date(birthDate)
  if (isNaN(date.getTime())) {
    return 'La fecha de nacimiento no es válida'
  }
  return null
}

/**
 * Validate a confirm password.
 *
 * @param password Password to validate.
 * @param confirmPassword Confirm password to validate.
 * @returns An error message if the password is not valid, or 'null' if it is valid.
 */
export function validateConfirmPassword(password: string, confirmPassword: string): string | null {
  if (!confirmPassword.trim()) {
    return 'El campo de confirmar contraseña no puede estar vacío'
  }
  if (password !== confirmPassword) {
    return 'Las contraseñas deben ser iguales'
  }
  return null
}

/**
 * Validate a professional License.
 *
 * @param professionalLicense Professional license to validate.
 * @returns An error message if the professional license is not valid, or 'null' if it is valid.
 */
export function validateProfessionalLicense(professionalLicense: string): string | null {
  if (!professionalLicense.trim()) {
    return 'El campo de licencia profesional no puede estar vacío'
  }
  const professionalLicenseRegex = /^[0-9]+$/
  if (!professionalLicenseRegex.test(professionalLicense)) {
    return 'La licencia profesional solo puede contener números'
  }
  if (professionalLicense.length > 8 || professionalLicense.length < 7) {
    return 'La cédula profesional esta compuesta entre 7 y 8 digitos'
  }
  return null
}

/**
 * Validate a university.
 *
 * @param university University to validate.
 * @returns An error message if the university is not valid.
 */
export function validateUniversity(university: string): string | null {
  if (university.length > 255) {
    return 'La universidad debe tener menos de 255 caracteres'
  }
  return null
}

/**
 * Validate a speciality.
 *
 * @param speciality Speciality to validate.
 * @returns An error message if the speciality is not valid.
 */
export function validateSpeciality(speciality: string): string | null {
  if (speciality.length > 255) {
    return 'La especialidad debe tener menos de 255 caracteres'
  }
  return null
}

/**
 * validate a about.
 *
 * @param about About me to validate.
 * @returns An error message if the about is not valid.
 */
export function validateAbout(about: string): string | null {
  if (about.length > 255) {
    return 'El sobre mí debe tener menos de 255 caracteres'
  }
  return null
}

/**
 * Validate a service start time.
 *
 * @param serviceStartTime Start time to validate.
 * @returns An error message if the start time is not valid, or 'null' if it is valid.
 */
export function validateServiceStartTime(serviceStartTime: string): string | null {
  if (!serviceStartTime.trim()) {
    return 'El campo de hora de inicio no puede estar vacío'
  }
  const startTimeRegex = /^\d{2}:\d{2}$/
  if (!startTimeRegex.test(serviceStartTime)) {
    return 'La hora de inicio no tiene un formato válido (HH:MM)'
  }
  return null
}

/**
 * Validate a service end time.
 *
 * @param serviceEndTime End time to validate.
 * @returns An error message if the end time is not valid, or 'null' if it is valid.
 */
export function validateServiceEndTime(serviceEndTime: string): string | null {
  if (!serviceEndTime.trim()) {
    return 'El campo de hora de fin no puede estar vacío'
  }
  const endTimeRegex = /^\d{2}:\d{2}$/
  if (!endTimeRegex.test(serviceEndTime)) {
    return 'La hora de fin no tiene un formato válido (HH:MM)'
  }
  return null
}

/**
 * Validate a address.
 *
 * @param address Address to validate.
 * @returns An error message if the address is not valid, or 'null' if it is valid.
 */
export function validateAddress(address: string): string | null {
  const trimmed = address.trim()

  if (!trimmed) {
    return 'El campo de dirección no puede estar vacío'
  }

  if (trimmed.length > 255) {
    return 'La dirección debe tener menos de 255 caracteres'
  }

  // Verifica que haya al menos 2 comas para suponer que hay calle, ciudad y país
  const parts = trimmed
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p)
  if (parts.length < 3) {
    return 'La dirección debe incluir al menos calle, ciudad y país (separados por comas)'
  }

  // Validación opcional: al menos una palabra por segmento
  if (parts.some((p) => p.length < 2)) {
    return 'Cada parte de la dirección debe contener al menos 2 caracteres'
  }

  return null
}

/**
 * Validate a phone number.
 *
 * @param phoneNumber Phone number to validate.
 * @returns An error message if the phone number is not valid, or 'null' if it is valid.
 */
export function validatePhoneNumber(phoneNumber: string): string | null {
  if (!phoneNumber.trim()) {
    return 'El campo de teléfono no puede estar vacío'
  }
  const phoneRegex = /^\d{10}$/
  if (!phoneRegex.test(phoneNumber)) {
    return 'El teléfono debe tener exactamente 10 dígitos'
  }
  return null
}
