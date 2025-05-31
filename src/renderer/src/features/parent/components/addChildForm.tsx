import React, { useState, useEffect } from 'react'
import InputForm from '@renderer/components/inputForm'
import InputList from '@renderer/components/inputList'
import { ChildData } from '../services/childService'
import { getDentistsForSelectService } from '../services/dentistService'
import styles from '../styles/addChildForm.module.css'

// Tipos de errores que coinciden exactamente con las validaciones del backend
interface FormErrors {
  name?: string
  lastName?: string
  gender?: string
  birthDate?: string
  dentistId?: string
  morningBrushingTime?: string
  afternoonBrushingTime?: string
  nightBrushingTime?: string
}

interface AddChildFormProps {
  onSubmit: (childData: ChildData) => void
  onCancel: () => void
}

const AddChildForm: React.FC<AddChildFormProps> = ({ onSubmit, onCancel }) => {
  // Estado inicial que coincide EXACTAMENTE con el schema del backend
  const [formData, setFormData] = useState<ChildData>({
    name: '',
    lastName: '',
    gender: 'M', // Valor por defecto válido según enum ['M', 'F'] del backend
    birthDate: '',
    dentistId: 0, // Se establecerá cuando se carguen los dentistas
    morningBrushingTime: '08:00', // Formato HH:MM según schema text(8) del backend
    afternoonBrushingTime: '14:00',
    nightBrushingTime: '20:00'
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [dentists, setDentists] = useState<{ userId: number; name: string }[]>([])
  const [loadingDentists, setLoadingDentists] = useState(true)
  const [dentistLoadError, setDentistLoadError] = useState<string | null>(null)

  // Cargar dentistas al montar el componente
  useEffect(() => {
    const loadDentists = async () => {
      try {
        setLoadingDentists(true)
        setDentistLoadError(null)

        const dentistsList = await getDentistsForSelectService()

        if (dentistsList.length === 0) {
          setDentistLoadError('No hay dentistas disponibles. Contacte al administrador.')
          setDentists([])
        } else {
          setDentists(dentistsList)
          // Seleccionar el primer dentista por defecto (requerido por el backend)
          setFormData((prev) => ({
            ...prev,
            dentistId: dentistsList[0].userId
          }))
        }
      } catch (error) {
        console.error('Error cargando dentistas:', error)
        setDentistLoadError('Error al cargar la lista de dentistas.')
        setDentists([])
      } finally {
        setLoadingDentists(false)
      }
    }

    loadDentists()
  }, [])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target

    setFormData((prevData) => ({
      ...prevData,
      [name]: name === 'dentistId' ? parseInt(value) || 0 : value
    }))

    // Limpiar errores cuando el usuario modifica el campo
    if (errors[name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [name]: undefined
      })
    }
  }

  // Validaciones que coinciden EXACTAMENTE con el backend

  /**
   * Validación de nombre - Backend: schema text(255).notNull()
   * Controller requiere: 'name' en requiredFields (línea 31)
   */
  const validateName = (name: string): string | undefined => {
    if (!name || !name.trim()) {
      return 'El nombre es requerido'
    }
    if (name.trim().length < 2) {
      return 'El nombre debe tener al menos 2 caracteres'
    }
    if (name.trim().length > 255) {
      return 'El nombre no puede tener más de 255 caracteres'
    }
    // Validar solo letras, espacios, acentos y ñ
    const nameRegex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/
    if (!nameRegex.test(name.trim())) {
      return 'El nombre solo puede contener letras y espacios'
    }
    return undefined
  }

  /**
   * Validación de apellido - Backend: schema text(255).notNull()
   * Controller requiere: 'lastName' en requiredFields (línea 31)
   */
  const validateLastName = (lastName: string): string | undefined => {
    if (!lastName || !lastName.trim()) {
      return 'El apellido es requerido'
    }
    if (lastName.trim().length < 2) {
      return 'El apellido debe tener al menos 2 caracteres'
    }
    if (lastName.trim().length > 255) {
      return 'El apellido no puede tener más de 255 caracteres'
    }
    const lastNameRegex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/
    if (!lastNameRegex.test(lastName.trim())) {
      return 'El apellido solo puede contener letras y espacios'
    }
    return undefined
  }

  const validateGender = (gender: string): string | undefined => {
    if (!gender) {
      return 'El género es requerido'
    }
    if (gender !== 'M' && gender !== 'F') {
      return 'El género debe ser M (Masculino) o F (Femenino)'
    }
    return undefined
  }

  const validateBirthDate = (birthDate: string): string | undefined => {
    if (!birthDate) {
      return 'La fecha de nacimiento es requerida'
    }

    const birth = new Date(birthDate)
    const today = new Date()

    if (isNaN(birth.getTime())) {
      return 'La fecha de nacimiento no es válida'
    }

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

    return undefined
  }

  /**
   * Validación de dentista - Backend: int().references(dentistTable.userId)
   * Controller requiere: 'dentistId' en requiredFields (línea 31)
   * Service: se usa el dentistId directamente sin validación adicional
   */
  const validateDentist = (dentistId: number): string | undefined => {
    if (!dentistId || dentistId === 0) {
      return 'Debe seleccionar un dentista'
    }
    if (dentists.length > 0 && !dentists.find((d) => d.userId === dentistId)) {
      return 'El dentista seleccionado no es válido'
    }
    return undefined
  }

  /**
   * Validación de horarios - Backend: schema text(8).notNull()
   * Controller requiere: 'morningBrushingTime', 'afternoonBrushingTime', 'nightBrushingTime' (línea 32-34)
   */
  const validateTime = (time: string, label: string): string | undefined => {
    if (!time) {
      return `La hora de ${label} es requerida`
    }

    // Validar formato HH:MM (texto de 8 caracteres máximo según schema)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(time)) {
      return `La hora de ${label} debe tener formato HH:MM válido (ej: 08:00)`
    }

    return undefined
  }

  const validateTimeConflicts = (): string | undefined => {
    const times = [
      { time: formData.morningBrushingTime, label: 'matutino' },
      { time: formData.afternoonBrushingTime, label: 'vespertino' },
      { time: formData.nightBrushingTime, label: 'nocturno' }
    ]

    for (let i = 0; i < times.length; i++) {
      for (let j = i + 1; j < times.length; j++) {
        if (times[i].time === times[j].time) {
          return `Los horarios ${times[i].label} y ${times[j].label} no pueden ser iguales`
        }
      }
    }

    return undefined
  }

  /**
   * Manejo del envío del formulario
   * Validaciones que coinciden con backend controller isValidData method (líneas 29-35)
   */
  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()

    // Verificar que hay dentistas disponibles
    if (dentists.length === 0) {
      setErrors({ dentistId: 'No hay dentistas disponibles. No se puede crear el niño.' })
      return
    }

    const nameError = validateName(formData.name)
    const lastNameError = validateLastName(formData.lastName)
    const genderError = validateGender(formData.gender)
    const birthDateError = validateBirthDate(formData.birthDate)
    const dentistError = validateDentist(formData.dentistId)
    const morningTimeError = validateTime(formData.morningBrushingTime, 'cepillado matutino')
    const afternoonTimeError = validateTime(formData.afternoonBrushingTime, 'cepillado vespertino')
    const nightTimeError = validateTime(formData.nightBrushingTime, 'cepillado nocturno')
    const timeConflictError = validateTimeConflicts()

    // Recopilar errores
    const newErrors: FormErrors = {}
    if (nameError) newErrors.name = nameError
    if (lastNameError) newErrors.lastName = lastNameError
    if (genderError) newErrors.gender = genderError
    if (birthDateError) newErrors.birthDate = birthDateError
    if (dentistError) newErrors.dentistId = dentistError
    if (morningTimeError) newErrors.morningBrushingTime = morningTimeError
    if (afternoonTimeError) newErrors.afternoonBrushingTime = afternoonTimeError
    if (nightTimeError) newErrors.nightBrushingTime = nightTimeError

    // Agregar error de conflicto de horarios al primer campo disponible
    if (timeConflictError && !newErrors.morningBrushingTime) {
      newErrors.morningBrushingTime = timeConflictError
    }

    // Si hay errores, mostrarlos y no enviar
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      console.warn('Errores de validación:', newErrors)
      return
    }

    const submitData: ChildData = {
      name: formData.name.trim(),
      lastName: formData.lastName.trim(),
      gender: formData.gender as 'M' | 'F',
      birthDate: formData.birthDate,
      dentistId: formData.dentistId,
      morningBrushingTime: formData.morningBrushingTime,
      afternoonBrushingTime: formData.afternoonBrushingTime,
      nightBrushingTime: formData.nightBrushingTime
    }

    console.log('Datos validados para envío al backend:', submitData)
    onSubmit(submitData)
  }

  // Opciones para el selector de género (según schema enum)
  const genderOptions = [
    { label: 'Masculino', value: 'M' },
    { label: 'Femenino', value: 'F' }
  ]

  // Opciones para el selector de dentistas
  const dentistOptions = dentists.map((dentist) => ({
    label: dentist.name,
    value: dentist.userId.toString()
  }))

  // Mostrar loading mientras se cargan los dentistas
  if (loadingDentists) {
    return (
      <div className={styles.loading}>
        <p>Cargando dentistas disponibles...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={styles.addChildForm}>
      {/* Error de carga de dentistas */}
      {dentistLoadError && (
        <div className={styles.errorMessage} style={{ marginBottom: '15px', textAlign: 'center' }}>
          {dentistLoadError}
        </div>
      )}

      {/* Campo: Nombre */}
      <div className={styles.formField}>
        <InputForm
          label="Nombre(s)"
          name="name"
          type="text"
          value={formData.name}
          placeholder="Nombre(s)"
          onChange={handleInputChange}
          required
          classname={styles.formInput}
        />
        {errors.name && <div className={styles.errorMessage}>{errors.name}</div>}
      </div>

      {/* Campo: Apellido */}
      <div className={styles.formField}>
        <InputForm
          label="Apellidos"
          name="lastName"
          type="text"
          value={formData.lastName}
          placeholder="Apellidos"
          onChange={handleInputChange}
          required
          classname={styles.formInput}
        />
        {errors.lastName && <div className={styles.errorMessage}>{errors.lastName}</div>}
      </div>

      {/* Campo: Género */}
      <div className={styles.formField}>
        <InputList
          options={genderOptions}
          label="Género"
          name="gender"
          value={formData.gender}
          placeholder="Seleccione el género"
          onChange={handleInputChange}
          required
        />
        {errors.gender && <div className={styles.errorMessage}>{errors.gender}</div>}
      </div>

      {/* Campo: Fecha de nacimiento */}
      <div className={styles.formField}>
        <InputForm
          label="Fecha de nacimiento"
          name="birthDate"
          type="date"
          value={formData.birthDate}
          placeholder="YYYY-MM-DD"
          onChange={handleInputChange}
          required
          classname={styles.formInput}
        />
        {errors.birthDate && <div className={styles.errorMessage}>{errors.birthDate}</div>}
      </div>

      {/* Campo: Dentista */}
      <div className={styles.formField}>
        <InputList
          options={dentistOptions}
          label="Dentista"
          name="dentistId"
          value={formData.dentistId.toString()}
          placeholder={
            dentists.length > 0 ? 'Seleccione un dentista' : 'No hay dentistas disponibles'
          }
          onChange={handleInputChange}
          required
        />
        {errors.dentistId && <div className={styles.errorMessage}>{errors.dentistId}</div>}
      </div>

      {/* Campo: Hora cepillado matutino */}
      <div className={styles.formField}>
        <InputForm
          label="Hora de cepillado matutino"
          name="morningBrushingTime"
          type="time"
          value={formData.morningBrushingTime}
          placeholder="HH:MM"
          onChange={handleInputChange}
          required
          classname={styles.formInput}
        />
        {errors.morningBrushingTime && (
          <div className={styles.errorMessage}>{errors.morningBrushingTime}</div>
        )}
      </div>

      {/* Campo: Hora cepillado vespertino */}
      <div className={styles.formField}>
        <InputForm
          label="Hora de cepillado vespertino"
          name="afternoonBrushingTime"
          type="time"
          value={formData.afternoonBrushingTime}
          placeholder="HH:MM"
          onChange={handleInputChange}
          required
          classname={styles.formInput}
        />
        {errors.afternoonBrushingTime && (
          <div className={styles.errorMessage}>{errors.afternoonBrushingTime}</div>
        )}
      </div>

      {/* Campo: Hora cepillado nocturno */}
      <div className={styles.formField}>
        <InputForm
          label="Hora de cepillado nocturno"
          name="nightBrushingTime"
          type="time"
          value={formData.nightBrushingTime}
          placeholder="HH:MM"
          onChange={handleInputChange}
          required
          classname={styles.formInput}
        />
        {errors.nightBrushingTime && (
          <div className={styles.errorMessage}>{errors.nightBrushingTime}</div>
        )}
      </div>

      {/* Botones de acción */}
      <div className={styles.formActions}>
        <button type="button" className={styles.cancelButton} onClick={onCancel} disabled={false}>
          Cancelar
        </button>
        <button type="submit" className={styles.submitButton} disabled={dentists.length === 0}>
          {dentists.length === 0 ? 'Sin dentistas disponibles' : 'Agregar Niño'}
        </button>
      </div>
    </form>
  )
}

export default AddChildForm
