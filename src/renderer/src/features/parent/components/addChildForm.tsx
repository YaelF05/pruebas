import React, { useState } from 'react'
import InputForm from '@renderer/components/inputForm'
import InputList from '@renderer/components/inputList'
import styles from '../styles/addChildForm.module.css'

interface Dentist {
  id: number
  name: string
}

interface ChildFormData {
  name: string
  last_name: string
  gender: 'M' | 'F'
  birth_date: string
  morning_brushing_time: string
  afternoon_brushing_time: string
  night_brushing_time: string
  dentist_id: number | null
}

interface AddChildFormProps {
  dentists: Dentist[]
  onSubmit: (childData: ChildFormData) => void
  onCancel: () => void
}

const AddChildForm: React.FC<AddChildFormProps> = ({ dentists, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<ChildFormData>({
    name: '',
    last_name: '',
    gender: 'M',
    birth_date: '',
    morning_brushing_time: '08:00',
    afternoon_brushing_time: '14:00',
    night_brushing_time: '20:00',
    dentist_id: null
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  ) => {
    const { name, value } = e.target

    // Para el campo dentist_id, convertir a número o null
    if (name === 'dentist_id') {
      setFormData({
        ...formData,
        [name]: value ? parseInt(value) : null
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
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
    value: dentist.id.toString()
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
          name="last_name"
          type="text"
          value={formData.last_name}
          placeholder="Apellidos"
          onChange={handleInputChange}
          required
          classname={styles.formInput}
        />
      </div>

      <div className={styles.formField}>
        <InputForm
          label="Fecha de nacimiento"
          name="birth_date"
          type="date"
          value={formData.birth_date}
          placeholder="Fecha de nacimiento"
          onChange={handleInputChange}
          required
          classname={styles.formInput}
        />
      </div>

      <div className={styles.formField}>
        <InputForm
          label="Hora de cepillado matutino"
          name="morning_brushing_time"
          type="time"
          value={formData.morning_brushing_time}
          placeholder="Hora de cepillado matutino"
          onChange={handleInputChange}
          required
          classname={styles.formInput}
        />
      </div>

      <div className={styles.formField}>
        <InputForm
          label="Hora de cepillado al medio día"
          name="afternoon_brushing_time"
          type="time"
          value={formData.afternoon_brushing_time}
          placeholder="Hora de cepillado al medio día"
          onChange={handleInputChange}
          required
          classname={styles.formInput}
        />
      </div>

      <div className={styles.formField}>
        <InputForm
          label="Hora de cepillado nocturno"
          name="night_brushing_time"
          type="time"
          value={formData.night_brushing_time}
          placeholder="Hora de cepillado nocturno"
          onChange={handleInputChange}
          required
          classname={styles.formInput}
        />
      </div>

      <div className={styles.formField}>
        <InputList
          options={dentistOptions}
          label="Odontólogo"
          name="dentist_id"
          value={formData.dentist_id?.toString() || ''}
          placeholder="Seleccionar odontólogo"
          onChange={handleInputChange}
          required={false}
        />
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
