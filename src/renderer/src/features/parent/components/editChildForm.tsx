import React, { useState, FormEvent } from 'react'
import { ChildResponse, UpdateChildData } from '../types/childTypes'
import { updateChildService } from '../services/childService'
import {
  validateGender,
  validateName,
  validateLastName,
  validateChildBirthDate,
  validateMorningBrushingTime,
  validateAfternoonBrushingTime,
  validateNightBrushingTime
} from '@renderer/utils/validators'
import InputForm from '@renderer/components/inputForm'
import InputList from '@renderer/components/inputList'
import styles from '../styles/editChildForm.module.css'

interface EditChildFormProps {
  child: ChildResponse
  onCancel?: () => void
  onSuccess?: (updatedFields: string[]) => void
}

const EditChildForm = ({ child, onCancel, onSuccess }: EditChildFormProps): React.JSX.Element => {
  const [formData, setFormData] = useState({
    name: child.name,
    lastName: child.lastName,
    gender: child.gender,
    birthDate: child.birthDate.split('T')[0],
    morningBrushingTime: child.morningBrushingTime,
    afternoonBrushingTime: child.afternoonBrushingTime,
    nightBrushingTime: child.nightBrushingTime
  })

  const [errors, setErrors] = useState<{
    name?: string
    lastName?: string
    gender?: string
    birthDate?: string
    morningBrushingTime?: string
    afternoonBrushingTime?: string
    nightBrushingTime?: string
  }>({})

  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const genderOptions = [
    { label: 'Femenino', value: 'F' },
    { label: 'Masculino', value: 'M' }
  ]

  const handleInputChange = (field: keyof typeof formData, value: string): void => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setSubmitError(null)

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {}

    const nameError = validateName(formData.name)
    if (nameError) newErrors.name = nameError

    const lastNameError = validateLastName(formData.lastName)
    if (lastNameError) newErrors.lastName = lastNameError

    const genderError = validateGender(formData.gender)
    if (genderError) newErrors.gender = genderError

    const birthDateError = validateChildBirthDate(formData.birthDate)
    if (birthDateError) newErrors.birthDate = birthDateError

    const morningTimeError = validateMorningBrushingTime(formData.morningBrushingTime)
    if (morningTimeError) newErrors.morningBrushingTime = morningTimeError

    const afternoonTimeError = validateAfternoonBrushingTime(formData.afternoonBrushingTime)
    if (afternoonTimeError) newErrors.afternoonBrushingTime = afternoonTimeError

    const nightTimeError = validateNightBrushingTime(formData.nightBrushingTime)
    if (nightTimeError) newErrors.nightBrushingTime = nightTimeError

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const getChangedFields = (): UpdateChildData => {
    const changes: UpdateChildData = { childId: child.childId }
    const originalBirthDate = child.birthDate.split('T')[0]

    if (formData.name.trim() !== child.name) {
      changes.name = formData.name.trim()
    }
    if (formData.lastName.trim() !== child.lastName) {
      changes.lastName = formData.lastName.trim()
    }
    if (formData.gender !== child.gender) {
      changes.gender = formData.gender as 'M' | 'F'
    }
    if (formData.birthDate !== originalBirthDate) {
      changes.birthDate = formData.birthDate
    }
    if (formData.morningBrushingTime !== child.morningBrushingTime) {
      changes.morningBrushingTime = formData.morningBrushingTime
    }
    if (formData.afternoonBrushingTime !== child.afternoonBrushingTime) {
      changes.afternoonBrushingTime = formData.afternoonBrushingTime
    }
    if (formData.nightBrushingTime !== child.nightBrushingTime) {
      changes.nightBrushingTime = formData.nightBrushingTime
    }

    return changes
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setErrors({})
    setSubmitError(null)

    if (!validateForm()) {
      return
    }

    const changes = getChangedFields()
    const changedFieldNames = Object.keys(changes).filter((key) => key !== 'childId')

    if (changedFieldNames.length === 0) {
      setSubmitError('No se han detectado cambios para guardar.')
      return
    }

    try {
      setIsLoading(true)
      await updateChildService(child.childId, changes)

      if (onSuccess) {
        onSuccess(changedFieldNames)
      }
    } catch (error) {
      console.error('Error updating child:', error)
      setSubmitError(
        error instanceof Error ? error.message : 'Error al actualizar los datos del niño.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.editChildForm}>
      {submitError && <div className={styles.errorMessage}>{submitError}</div>}

      <InputForm
        label="Nombre(s)"
        name="name"
        type="text"
        value={formData.name}
        placeholder="Nombre"
        onChange={(e) => handleInputChange('name', e.target.value)}
        required={true}
      />
      {errors.name && <div className={styles.errorMessage}>{errors.name}</div>}

      <InputForm
        label="Apellidos"
        name="lastName"
        type="text"
        value={formData.lastName}
        placeholder="Apellidos"
        onChange={(e) => handleInputChange('lastName', e.target.value)}
        required={true}
      />
      {errors.lastName && <div className={styles.errorMessage}>{errors.lastName}</div>}

      <InputList
        options={genderOptions}
        label="Género"
        name="gender"
        value={formData.gender}
        placeholder="Selecciona el género"
        onChange={(e) => handleInputChange('gender', e.target.value)}
        required
      />
      {errors.gender && <div className={styles.errorMessage}>{errors.gender}</div>}

      <InputForm
        label="Fecha de nacimiento"
        name="birthDate"
        type="date"
        value={formData.birthDate}
        placeholder="Fecha de nacimiento"
        onChange={(e) => handleInputChange('birthDate', e.target.value)}
        required={true}
      />
      {errors.birthDate && <div className={styles.errorMessage}>{errors.birthDate}</div>}

      <InputForm
        label="Hora de cepillado matutino"
        name="morningBrushingTime"
        type="time"
        value={formData.morningBrushingTime}
        placeholder="Hora de cepillado matutino"
        onChange={(e) => handleInputChange('morningBrushingTime', e.target.value)}
        required={true}
      />
      {errors.morningBrushingTime && (
        <div className={styles.errorMessage}>{errors.morningBrushingTime}</div>
      )}

      <InputForm
        label="Hora de cepillado al mediodía"
        name="afternoonBrushingTime"
        type="time"
        value={formData.afternoonBrushingTime}
        placeholder="Hora de cepillado al mediodía"
        onChange={(e) => handleInputChange('afternoonBrushingTime', e.target.value)}
        required={true}
      />
      {errors.afternoonBrushingTime && (
        <div className={styles.errorMessage}>{errors.afternoonBrushingTime}</div>
      )}

      <InputForm
        label="Hora de cepillado nocturno"
        name="nightBrushingTime"
        type="time"
        value={formData.nightBrushingTime}
        placeholder="Hora de cepillado nocturno"
        onChange={(e) => handleInputChange('nightBrushingTime', e.target.value)}
        required={true}
      />
      {errors.nightBrushingTime && (
        <div className={styles.errorMessage}>{errors.nightBrushingTime}</div>
      )}

      <div className={styles.formActions}>
        <button
          type="button"
          className={styles.cancelButton}
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button type="submit" className={styles.saveButton} disabled={isLoading}>
          {isLoading ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )
}

export default EditChildForm
