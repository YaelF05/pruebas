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
 * Validate an address based on OpenStreetMap main tags structure.
 * Expected format: "house_number, street, city, postcode, country"
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

  // Split by commas and clean parts
  const parts = trimmed
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p)

  // Debe tener al menos 4 partes: número, calle, ciudad, país (código postal opcional)
  if (parts.length < 4) {
    return 'La dirección debe incluir al menos: número, calle, ciudad y país (separados por comas)'
  }

  if (parts.length > 5) {
    return 'La dirección tiene demasiados elementos. Formato esperado: número, calle, ciudad, [código postal], país'
  }

  const [houseNumber, street, city, ...remaining] = parts
  let postcode: string | undefined
  let country: string

  // Determinar si hay código postal
  if (remaining.length === 2) {
    ;[postcode, country] = remaining
  } else if (remaining.length === 1) {
    country = remaining[0]
  } else {
    return 'Formato de dirección inválido'
  }

  // Validar número de casa (addr:housenumber)
  if (!houseNumber || houseNumber.length < 1) {
    return 'El número de casa es requerido'
  }

  // Validar que el número contenga al menos un dígito
  if (!/\d/.test(houseNumber)) {
    return 'El número de casa debe contener al menos un dígito'
  }

  // Validar calle (addr:street)
  if (!street || street.length < 2) {
    return 'El nombre de la calle debe tener al menos 2 caracteres'
  }

  // Validar ciudad (addr:city)
  if (!city || city.length < 2) {
    return 'El nombre de la ciudad debe tener al menos 2 caracteres'
  }

  // Validar código postal (addr:postcode) si está presente
  if (postcode) {
    if (postcode.length < 3 || postcode.length > 10) {
      return 'El código postal debe tener entre 3 y 10 caracteres'
    }
    // Validar que contenga al menos un dígito
    if (!/\d/.test(postcode)) {
      return 'El código postal debe contener al menos un dígito'
    }
  }

  // Validar país (addr:country)
  if (!country || country.length < 2) {
    return 'El país debe tener al menos 2 caracteres'
  }

  // Validar que el país sea un código de 2 letras (ISO) o nombre completo
  if (country.length === 2) {
    if (!/^[A-Z]{2}$/i.test(country)) {
      return 'El código de país debe ser de 2 letras (ej: MX, US, ES)'
    }
  } else if (country.length > 50) {
    return 'El nombre del país es demasiado largo'
  }

  // Validar caracteres especiales problemáticos
  const invalidChars = /[<>{}[\]\\|`~]/
  if (parts.some((part) => invalidChars.test(part))) {
    return 'La dirección contiene caracteres no válidos'
  }

  return null
}

/**
 * Parse an address string into OpenStreetMap components.
 *
 * @param address Valid address string
 * @returns Object with OSM address components or null if invalid
 */
export function parseAddressToOSM(address: string): {
  housenumber: string
  street: string
  city: string
  postcode?: string
  country: string
} | null {
  const validationError = validateAddress(address)
  if (validationError) {
    return null
  }

  const parts = address
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p)

  const [houseNumber, street, city, ...remaining] = parts
  let postcode: string | undefined
  let country: string

  if (remaining.length === 2) {
    ;[postcode, country] = remaining
  } else {
    country = remaining[0]
  }

  return {
    housenumber: houseNumber,
    street: street,
    city: city,
    ...(postcode && { postcode }),
    country: country
  }
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

/**
 * Validate gender.
 *
 * @param gender gender to validate.
 * @returns An error message
 **/
export function validateGender(gender: string): string | null {
  if (!gender.trim()) {
    return 'El campo de género no puede estar vacío'
  }
  if (gender != 'M' && gender != 'F') {
    return 'El genero solo puede ser Masculino o Femenino'
  }
  return null
}

/**
 * validate childBirthDate.
 *
 * @param childBirthDate Child birth date to validate.
 * @returns An error message if the child birth date is not valid, or 'null' if it is valid.
 */
export function validateChildBirthDate(birthDate: string): string | null {
  const baseValidation = validateBirthDate(birthDate)
  if (baseValidation) {
    return baseValidation
  }
  const birth = new Date(birthDate)
  const today = new Date()

  if (birth > today) {
    return 'La fecha de nacimiento no puede ser futura'
  }

  const maxAllowedDate = new Date(today.getFullYear() - 4, today.getMonth(), today.getDate())
  const minAllowedDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate())

  if (birth > maxAllowedDate) {
    return 'El niño debe tener al menos 4 años'
  }

  if (birth < minAllowedDate) {
    return 'El niño no puede tener más de 13 años'
  }

  return null
}

/**
 * Validate brushing time.
 *
 * @param morningBrushingTime Brushing time to validate.
 * @returns An error message if the brushing time is not valid, or 'null' if it is valid.
 * */
export function validateMorningBrushingTime(morningBrushingTime: string): string | null {
  if (!morningBrushingTime.trim()) {
    return 'El campo de hora de cepillado no puede estar vacío'
  }
  const morningBrushingTimeRegex = /^\d{2}:\d{2}$/
  if (!morningBrushingTimeRegex.test(morningBrushingTime)) {
    return 'La hora de cepillado no tiene un formato válido (HH:MM)'
  }
  return null
}

/**
 * Validate brushing time.
 *
 * @param afternoonBrushingTime Brushing time to validate.
 * @returns An error message if the brushing time is not valid, or 'null' if it is valid.
 * */
export function validateAfternoonBrushingTime(afternoonBrushingTime: string): string | null {
  if (!afternoonBrushingTime.trim()) {
    return 'El campo de hora de cepillado no puede estar vacío'
  }
  const nightBrushingTimeRegex = /^\d{2}:\d{2}$/
  if (!nightBrushingTimeRegex.test(afternoonBrushingTime)) {
    return 'La hora de cepillado no tiene un formato válido (HH:MM)'
  }
  return null
}

/**
 * Validate brushing time.
 *
 * @param nightBrushingTime Brushing time to validate.
 * @returns An error message if the brushing time is not valid, or 'null' if it is valid.
 * */
export function validateNightBrushingTime(nightBrushingTime: string): string | null {
  if (!nightBrushingTime.trim()) {
    return 'El campo de hora de cepillado no puede estar vacío'
  }
  const nightBrushingTimeRegex = /^\d{2}:\d{2}$/
  if (!nightBrushingTimeRegex.test(nightBrushingTime)) {
    return 'La hora de cepillado no tiene un formato válido (HH:MM)'
  }
  return null
}

/**
 * Validate dentist ID.
 *
 * @param dentistId Dentist ID to validate.
 * @returns An error message if the dentist ID is not valid, or 'null' if it is valid.
 **/
export function validateDentistId(dentistId: number | null): string | null {
  if (dentistId === null) {
    return 'Por favor selecciona un odontólogo.'
  }
  if (typeof dentistId !== 'number' || dentistId <= 0) {
    return 'No se ha seleccionado un odontólogo válido.'
  }
  return null
}
