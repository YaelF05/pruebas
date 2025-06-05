import React, { useState, FormEvent } from 'react'
import { CreateChildRequest, CreateChildResult } from '../types/childTypes'
import { createChildService } from '../services/childService'
import {
  validateGender,
  validateName,
  validateLastName,
  validateChildBirthDate,
  validateMorningBrushingTime,
  validateAfternoonBrushingTime,
  validateNightBrushingTime,
  validateDentistId
} from '@renderer/utils/validators'
import InputForm from '@renderer/components/inputForm'
import InputList from '@renderer/components/inputList'
import DentistSelector from './dentistSelector'
import styles from '../styles/addChildForm.module.css'

interface AddChildFormProps {
  onCancel?: () => void
  onSuccess?: () => void
}

const AddChildForm = ({ onCancel, onSuccess }: AddChildFormProps): React.JSX.Element => {
  const [gender, setGender] = useState('')
  const [name, setName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dentistId, setDentistId] = useState<number>(0)
  const [morningBrushingTime, setMorningBrushingTime] = useState('')
  const [afternoonBrushingTime, setAfternoonBrushingTime] = useState('')
  const [nightBrushingTime, setNightBrushingTime] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [errors, setErrors] = useState<{
    gender?: string
    name?: string
    lastName?: string
    birthDate?: string
    morningBrushingTime?: string
    afternoonBrushingTime?: string
    nightBrushingTime?: string
    dentistId?: string
  }>({})
  const [createChildError, setCreateChildError] = useState<string | null>(null)
  const [dentistLoadError, setDentistLoadError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const genderOptions = [
    { label: 'Femenino', value: 'F' },
    { label: 'Masculino', value: 'M' }
  ]

  const handleDentistSelect = (id: number): void => {
    setDentistId(id)
    setCreateChildError(null)
  }

  const handleDentistError = (error: string): void => {
    setDentistLoadError(error)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setErrors({})
    setCreateChildError(null)
    setIsLoading(true)

    const genderError = validateGender(gender)
    const nameError = validateName(name)
    const lastNameError = validateLastName(lastName)
    const birthDateError = validateChildBirthDate(birthDate)
    const morningBrushingTimeError = validateMorningBrushingTime(morningBrushingTime)
    const afternoonBrushingTimeError = validateAfternoonBrushingTime(afternoonBrushingTime)
    const nightBrushingTimeError = validateNightBrushingTime(nightBrushingTime)
    const dentistIdError = validateDentistId(dentistId)

    if (
      genderError ||
      nameError ||
      lastNameError ||
      birthDateError ||
      morningBrushingTimeError ||
      afternoonBrushingTimeError ||
      nightBrushingTimeError ||
      dentistIdError
    ) {
      setErrors({
        gender: genderError || undefined,
        name: nameError || undefined,
        lastName: lastNameError || undefined,
        birthDate: birthDateError || undefined,
        morningBrushingTime: morningBrushingTimeError || undefined,
        afternoonBrushingTime: afternoonBrushingTimeError || undefined,
        nightBrushingTime: nightBrushingTimeError || undefined,
        dentistId: dentistIdError || undefined
      })
      setIsLoading(false)
      return
    }

    const credentials: CreateChildRequest = {
      gender: gender as 'M' | 'F',
      name: name.trim(),
      lastName: lastName.trim(),
      birthDate,
      morningBrushingTime,
      afternoonBrushingTime,
      nightBrushingTime,
      dentistId
    }

    try {
      const result: CreateChildResult = await createChildService(credentials)
      console.log('Niño creado:', result)
      setIsLoading(false)

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error creating child:', error)
      setCreateChildError('Error al crear el niño. Por favor, inténtalo de nuevo.')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.addChildForm}>
      {dentistLoadError && <div className={styles.errorMessage}>{dentistLoadError}</div>}
      {createChildError && <div className={styles.errorMessage}>{createChildError}</div>}

      <InputList
        options={genderOptions}
        label={'Género'}
        name={'gender'}
        value={gender}
        placeholder={'Selecciona el género'}
        onChange={(e) => setGender(e.target.value as 'M' | 'F')}
        required
      />
      {errors.gender && <div className={styles.errorMessage}>{errors.gender}</div>}

      <InputForm
        label={'Nombre(s)'}
        name={'name'}
        type={'text'}
        value={name}
        placeholder={'Nombre'}
        onChange={(e) => setName(e.target.value)}
        required={true}
      />
      {errors.name && <div className={styles.errorMessage}>{errors.name}</div>}

      <InputForm
        label={'Apellidos'}
        name={'lastName'}
        type={'text'}
        value={lastName}
        placeholder={'Apellidos'}
        onChange={(e) => setLastName(e.target.value)}
        required={true}
      />
      {errors.lastName && <div className={styles.errorMessage}>{errors.lastName}</div>}

      <InputForm
        label={'Fecha de nacimiento'}
        name={'birthDate'}
        type={'date'}
        value={birthDate}
        placeholder={'Fecha de nacimiento'}
        onChange={(e) => setBirthDate(e.target.value)}
        required={true}
      />
      {errors.birthDate && <div className={styles.errorMessage}>{errors.birthDate}</div>}

      <InputForm
        label={'Hora de cepillado matutino'}
        name={'morningBrushingTime'}
        type={'time'}
        value={morningBrushingTime}
        placeholder={'Hora de cepillado matutino'}
        onChange={(e) => setMorningBrushingTime(e.target.value)}
        required={true}
      />
      {errors.morningBrushingTime && (
        <div className={styles.errorMessage}>{errors.morningBrushingTime}</div>
      )}

      <InputForm
        label={'Hora de cepillado al mediodía'}
        name={'afternoonBrushingTime'}
        type={'time'}
        value={afternoonBrushingTime}
        placeholder={'Hora de cepillado al mediodía'}
        onChange={(e) => setAfternoonBrushingTime(e.target.value)}
        required={true}
      />
      {errors.afternoonBrushingTime && (
        <div className={styles.errorMessage}>{errors.afternoonBrushingTime}</div>
      )}

      <InputForm
        label={'Hora de cepillado nocturno'}
        name={'nightBrushingTime'}
        type={'time'}
        value={nightBrushingTime}
        placeholder={'Hora de cepillado nocturno'}
        onChange={(e) => setNightBrushingTime(e.target.value)}
        required={true}
      />
      {errors.nightBrushingTime && (
        <div className={styles.errorMessage}>{errors.nightBrushingTime}</div>
      )}

      <DentistSelector
        onSelect={handleDentistSelect}
        selectedDentistId={dentistId}
        onError={handleDentistError}
        useGeolocation={true}
        maxDistance={10}
      />
      {errors.dentistId && <div className={styles.errorMessage}>{errors.dentistId}</div>}

      {/* Botones de acción */}
      <div className={styles.formActions}>
        <button
          type={'button'}
          className={styles.cancelButton}
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button type={'submit'} className={styles.continueButton} disabled={isLoading}>
          {isLoading ? 'Creando...' : 'Continuar'}
        </button>
      </div>
    </form>
  )
}

export default AddChildForm
