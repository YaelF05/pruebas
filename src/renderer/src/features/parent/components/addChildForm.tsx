import React, { useState, useEffect } from 'react'
import InputForm from '@renderer/components/inputForm'
import InputList from '@renderer/components/inputList'
import { ChildData } from '../services/childService'
import { getDentistsForSelectService } from '../services/dentistService'
import styles from '../styles/addChildForm.module.css'

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
  const [formData, setFormData] = useState<ChildData>({
    name: '',
    lastName: '',
    gender: 'M',
    birthDate: '',
    dentistId: 0,
    morningBrushingTime: '08:00',
    afternoonBrushingTime: '14:00',
    nightBrushingTime: '20:00'
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [dentists, setDentists] = useState<{ userId: number; name: string }[]>([])
  const [loadingDentists, setLoadingDentists] = useState(true)

  // Cargar dentistas al montar el componente
  useEffect(() => {
    const loadDentists = async () => {
      try {
        setLoadingDentists(true)
        const dentistsList = await getDentistsForSelectService()
        setDentists(dentistsList)

        // Seleccionar el primer dentista por defecto si existe
        if (dentistsList.length > 0) {
          setFormData((prev) => ({
            ...prev,
            dentistId: dentistsList[0].userId
          }))
        }
      } catch (error) {
        console.error('Error cargando dentistas:', error)
        // En caso de error, usar datos básicos
        setDentists([
          { userId: 1, name: 'Dr. María González' },
          { userId: 2, name: 'Dr. Carlos Rodríguez' }
        ])
        setFormData((prev) => ({
          ...prev,
          dentistId: 1
        }))
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

    // Actualizar el estado
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

  // Función para validar el nombre
  const validateName = (name: string): string | undefined => {
    if (!name.trim()) {
      return 'El nombre es requerido'
    }
    if (name.trim().length < 2) {
      return 'El nombre debe tener al menos 2 caracteres'
    }
    if (name.trim().length > 50) {
      return 'El nombre no puede tener más de 50 caracteres'
    }
    const nameRegex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/
    if (!nameRegex.test(name.trim())) {
      return 'El nombre solo puede contener letras y espacios'
    }
    return undefined
  }

  // Función para validar el apellido
  const validateLastName = (lastName: string): string | undefined => {
    if (!lastName.trim()) {
      return 'El apellido es requerido'
    }
    if (lastName.trim().length < 2) {
      return 'El apellido debe tener al menos 2 caracteres'
    }
    if (lastName.trim().length > 50) {
      return 'El apellido no puede tener más de 50 caracteres'
    }
    const lastNameRegex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/
    if (!lastNameRegex.test(lastName.trim())) {
      return 'El apellido solo puede contener letras y espacios'
    }
    return undefined
  }

  // Función para validar la edad
  const validateAge = (birthDate: string): string | undefined => {
    if (!birthDate) {
      return 'La fecha de nacimiento es requerida'
    }

    const birth = new Date(birthDate)
    const today = new Date()

    // Validar que la fecha no sea futura
    if (birth > today) {
      return 'La fecha de nacimiento no puede ser futura'
    }

    // Validar que sea una fecha válida
    if (isNaN(birth.getTime())) {
      return 'La fecha de nacimiento no es válida'
    }

    // Validar que la fecha esté dentro del rango permitido
    const maxAllowedDate = new Date(today.getFullYear() - 4, today.getMonth(), today.getDate())
    const minAllowedDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate())

    if (birth > maxAllowedDate) {
      return 'El niño debe tener al menos 4 años'
    }

    if (birth < minAllowedDate) {
      return 'El niño no puede tener más de 13 años'
    }

    // Calcular la edad exacta
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    // Validación adicional por si acaso
    if (age < 4) {
      return 'El niño debe tener al menos 4 años cumplidos'
    }

    if (age > 13) {
      return 'El niño no puede tener más de 13 años'
    }

    return undefined
  }

  // Función para validar dentista
  const validateDentist = (dentistId: number): string | undefined => {
    if (!dentistId || dentistId === 0) {
      return 'Debe seleccionar un dentista'
    }
    return undefined
  }

  // Función para validar horarios
  const validateTime = (time: string, label: string): string | undefined => {
    if (!time) {
      return `La hora de ${label} es requerida`
    }

    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(time)) {
      return `La hora de ${label} no tiene un formato válido`
    }

    return undefined
  }

  // Función para validar que los horarios no se sobrepongan
  const validateTimeConflicts = (): string | undefined => {
    const times = [
      { time: formData.morningBrushingTime, label: 'matutino' },
      { time: formData.afternoonBrushingTime, label: 'vespertino' },
      { time: formData.nightBrushingTime, label: 'nocturno' }
    ]

    for (let i = 0; i < times.length; i++) {
      for (let j = i + 1; j < times.length; j++) {
        if (times[i].time === times[j].time) {
          return `Los horarios de cepillado ${times[i].label} y ${times[j].label} no pueden ser iguales`
        }
      }
    }

    return undefined
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()

    // Validar todos los campos
    const nameError = validateName(formData.name)
    const lastNameError = validateLastName(formData.lastName)
    const birthDateError = validateAge(formData.birthDate)
    const dentistError = validateDentist(formData.dentistId)
    const morningTimeError = validateTime(formData.morningBrushingTime, 'cepillado matutino')
    const afternoonTimeError = validateTime(formData.afternoonBrushingTime, 'cepillado vespertino')
    const nightTimeError = validateTime(formData.nightBrushingTime, 'cepillado nocturno')
    const timeConflictError = validateTimeConflicts()

    const newErrors: FormErrors = {}

    if (nameError) newErrors.name = nameError
    if (lastNameError) newErrors.lastName = lastNameError
    if (birthDateError) newErrors.birthDate = birthDateError
    if (dentistError) newErrors.dentistId = dentistError
    if (morningTimeError) newErrors.morningBrushingTime = morningTimeError
    if (afternoonTimeError) newErrors.afternoonBrushingTime = afternoonTimeError
    if (nightTimeError) newErrors.nightBrushingTime = nightTimeError

    // Si hay conflicto de horarios, agregarlo al primer horario con error
    if (timeConflictError) {
      if (!newErrors.morningBrushingTime) newErrors.morningBrushingTime = timeConflictError
    }

    // Si hay errores, actualizar el estado y no enviar
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      console.warn('Errores en el formulario:', newErrors)
      return
    }

    // Si no hay errores, enviar el formulario
    console.log('Enviando datos del formulario:', formData)
    onSubmit(formData)
  }

  // Opciones para el género
  const genderOptions = [
    { label: 'Masculino', value: 'M' },
    { label: 'Femenino', value: 'F' }
  ]

  // Opciones para dentistas
  const dentistOptions = dentists.map((dentist) => ({
    label: dentist.name,
    value: dentist.userId.toString()
  }))

  if (loadingDentists) {
    return (
      <div className={styles.loading}>
        <p>Cargando dentistas...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={styles.addChildForm}>
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

      <div className={styles.formField}>
        <InputForm
          label="Fecha de nacimiento (4-13 años)"
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

      <div className={styles.formField}>
        <InputList
          options={dentistOptions}
          label="Dentista"
          name="dentistId"
          value={formData.dentistId.toString()}
          placeholder="Seleccione un dentista"
          onChange={handleInputChange}
          required
        />
        {errors.dentistId && <div className={styles.errorMessage}>{errors.dentistId}</div>}
      </div>

      <div className={styles.formField}>
        <InputForm
          label="Hora de cepillado matutino"
          name="morningBrushingTime"
          type="time"
          value={formData.morningBrushingTime}
          placeholder="Hora de cepillado matutino"
          onChange={handleInputChange}
          required
          classname={styles.formInput}
        />
        {errors.morningBrushingTime && (
          <div className={styles.errorMessage}>{errors.morningBrushingTime}</div>
        )}
      </div>

      <div className={styles.formField}>
        <InputForm
          label="Hora de cepillado vespertino"
          name="afternoonBrushingTime"
          type="time"
          value={formData.afternoonBrushingTime}
          placeholder="Hora de cepillado vespertino"
          onChange={handleInputChange}
          required
          classname={styles.formInput}
        />
        {errors.afternoonBrushingTime && (
          <div className={styles.errorMessage}>{errors.afternoonBrushingTime}</div>
        )}
      </div>

      <div className={styles.formField}>
        <InputForm
          label="Hora de cepillado nocturno"
          name="nightBrushingTime"
          type="time"
          value={formData.nightBrushingTime}
          placeholder="Hora de cepillado nocturno"
          onChange={handleInputChange}
          required
          classname={styles.formInput}
        />
        {errors.nightBrushingTime && (
          <div className={styles.errorMessage}>{errors.nightBrushingTime}</div>
        )}
      </div>

      <div className={styles.formActions}>
        <button type="button" className={styles.cancelButton} onClick={onCancel} disabled={false}>
          Cancelar
        </button>
        <button type="submit" className={styles.submitButton}>
          Agregar Niño
        </button>
      </div>
    </form>
  )
}

export default AddChildForm
