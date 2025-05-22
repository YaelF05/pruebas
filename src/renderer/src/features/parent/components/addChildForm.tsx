import React, { useState } from 'react'
import InputForm from '@renderer/components/inputForm'
import InputList from '@renderer/components/inputList'
import { ChildData } from '../services/childService'
import styles from '../styles/addChildForm.module.css'

interface Dentist {
  userId: number
  name: string
}

interface FormErrors {
  birthDate?: string
  userId?: string
}

interface AddChildFormProps {
  dentists: Dentist[]
  onSubmit: (childData: ChildData) => void
  onCancel: () => void
}

const AddChildForm: React.FC<AddChildFormProps> = ({ dentists, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<ChildData>({
    name: '',
    lastName: '',
    gender: 'M',
    birthDate: '',
    morningBrushingTime: '08:00',
    afternoonBrushingTime: '14:00',
    nightBrushingTime: '20:00',
    userId: 0
  })

  const [errors, setErrors] = useState<FormErrors>({})

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target

    let processedValue: string | number = value

    // Procesar el valor según el tipo de campo
    if (name === 'userId') {
      processedValue = value ? parseInt(value) : 0
    }

    // Actualizar el estado
    setFormData((prevData) => ({
      ...prevData,
      [name]: processedValue
    }))

    // Limpiar errores cuando el usuario modifica el campo
    if (errors[name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [name]: undefined
      })
    }
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

  // Función para validar el odontólogo
  const validateDentist = (userId: number): string | undefined => {
    if (!userId || userId === 0) {
      return 'Debe seleccionar un odontólogo'
    }
    return undefined
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()

    // Validar campos
    const birthDateError = validateAge(formData.birthDate)
    const dentistError = validateDentist(formData.userId)

    const newErrors: FormErrors = {}

    if (birthDateError) {
      newErrors.birthDate = birthDateError
    }

    if (dentistError) {
      newErrors.userId = dentistError
    }

    // Si hay errores, actualizar el estado y no enviar
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Si no hay errores, enviar el formulario
    onSubmit(formData)
  }

  // Opciones para el género
  const genderOptions = [
    { label: 'Masculino', value: 'M' },
    { label: 'Femenino', value: 'F' }
  ]

  // Opciones para los dentistas
  const dentistOptions = dentists.map((dentist) => ({
    label: dentist.name,
    value: dentist.userId.toString()
  }))

  // Obtener la fecha máxima (hace 4 años) y mínima (hace 13 años)
  const today = new Date()
  const maxDate = new Date(today.getFullYear() - 4, today.getMonth(), today.getDate())
    .toISOString()
    .split('T')[0]
  const minDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate())
    .toISOString()
    .split('T')[0]

  return (
    <form onSubmit={handleSubmit} className={styles.addChildForm}>
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
      </div>

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
      </div>

      <div className={styles.formField}>
        <div className={styles.dateInputContainer}>
          <label htmlFor="birthDate" className={styles.dateLabel}>
            Fecha de nacimiento (4-13 años)
          </label>
          <input
            type="date"
            id="birthDate"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleInputChange}
            min={minDate}
            max={maxDate}
            required
            className={styles.dateInput}
          />
        </div>
        {errors.birthDate && <div className={styles.errorMessage}>{errors.birthDate}</div>}
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
      </div>

      <div className={styles.formField}>
        <InputForm
          label="Hora de cepillado al medio día"
          name="afternoonBrushingTime"
          type="time"
          value={formData.afternoonBrushingTime}
          placeholder="Hora de cepillado al medio día"
          onChange={handleInputChange}
          required
          classname={styles.formInput}
        />
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
      </div>

      <div className={styles.formField}>
        <InputList
          options={dentistOptions}
          label="Odontólogo *"
          name="userId"
          value={formData.userId ? formData.userId.toString() : ''}
          placeholder="Seleccionar odontólogo"
          onChange={handleInputChange}
          required={true}
        />
        {errors.userId && <div className={styles.errorMessage}>{errors.userId}</div>}
      </div>

      <div className={styles.formActions}>
        <button type="button" className={styles.cancelButton} onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className={styles.submitButton}>
          Agregar
        </button>
      </div>
    </form>
  )
}

export default AddChildForm
