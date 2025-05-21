import React, { useState } from 'react'
import InputForm from '@renderer/components/inputForm'
import InputList from '@renderer/components/inputList'
import styles from '../styles/addChildForm.module.css'

interface Dentist {
  userId: number
  name: string
}

interface ChildFormData {
  name: string
  lastName: string
  gender: 'M' | 'F'
  birthDate: string
  morningBrushingTime: string
  afternoonBrushingTime: string
  nightBrushingTime: string
  userId: number
}

interface FormErrors {
  birthDate?: string
  id?: string
}

interface AddChildFormProps {
  dentists: Dentist[]
  onSubmit: (childData: ChildFormData) => void
  onCancel: () => void
}

const AddChildForm: React.FC<AddChildFormProps> = ({ dentists, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<ChildFormData>({
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
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  ) => {
    const { name, value } = e.target

    const fieldName = name === 'id' ? 'userId' : (name as keyof ChildFormData)

    // Procesar el valor según el tipo de campo
    const processedValue = name === 'id' ? (value ? parseInt(value) : null) : value

    // Actualizar el estado con un typing seguro
    setFormData((prevData) => ({
      ...prevData,
      [fieldName]: processedValue
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

    // Calcular la edad
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    // Validar que la fecha no sea futura
    if (birth > today) {
      return 'La fecha de nacimiento no puede ser futura'
    }

    // Validar rango de edad
    if (age < 4) {
      return 'El niño debe tener al menos 4 años'
    }

    if (age > 13) {
      return 'El niño no puede tener más de 13 años'
    }

    return undefined
  }

  // Función para validar el odontólogo
  const validateDentist = (id: number): string | undefined => {
    if (!id) {
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
      newErrors.id = dentistError
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
        <InputForm
          label="Fecha de nacimiento (4-13 años)"
          name="birthDate"
          type="date"
          value={formData.birthDate}
          placeholder="Fecha de nacimiento"
          onChange={handleInputChange}
          required
          classname={styles.formInput}
        />
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
        {errors.id && <div className={styles.errorMessage}>{errors.id}</div>}
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
