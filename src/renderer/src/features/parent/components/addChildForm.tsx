import React, { useState } from 'react'
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

const AddChildForm: React.FC<AddChildFormProps> = ({
  dentists,
  onSubmit,
  onCancel
}) => {

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

  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className={styles.addChildForm}>
      <div className={styles.formField}>
        <select 
          id="gender" 
          name="gender" 
          value={formData.gender} 
          onChange={handleInputChange}
          className={styles.formSelect}
        >
          <option value="M">Masculino</option>
          <option value="F">Femenino</option>
        </select>
      </div>
      
      <div className={styles.formField}>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className={styles.formInput}
          placeholder="Nombre(s)"
          required
        />
      </div>
      
      <div className={styles.formField}>
        <input
          type="text"
          id="last_name"
          name="last_name"
          value={formData.last_name}
          onChange={handleInputChange}
          className={styles.formInput}
          placeholder="Apellidos"
          required
        />
      </div>
      
      <div className={styles.formField}>
        <input
           type="text" 
           id="birth_date"
           name="birth_date"
           value={formData.birth_date}
           onChange={handleInputChange}
           className={styles.formInput}
           placeholder="Fecha de nacimiento"
           required
        />
      </div>
      
      <div className={styles.formField}>
        <input
          type="text" 
          id="morning_brushing_time"
          name="morning_brushing_time"
          value={formData.morning_brushing_time}
          onChange={handleInputChange}
          className={styles.formInput}
          placeholder="Hora de cepillado matutino"
          required
        />
      </div>
      
      <div className={styles.formField}>
        <input
          type="text" 
          id="afternoon_brushing_time"
          name="afternoon"
          value={formData.afternoon_brushing_time}
          onChange={handleInputChange}
          className={styles.formInput}
          placeholder="Hora de cepillado al medio día"
          required
        />
      </div>
      
      <div className={styles.formField}>
        <input
          type="text" 
          id="night_brushing_time"
          name="night_brushing_time"
          value={formData.night_brushing_time}
          onChange={handleInputChange}
          className={styles.formInput}
          placeholder="Hora de cepillado nocturno"
          required
        />
      </div>
      
      <div className={styles.formField}>
        <select 
          id="dentist_id" 
          name="dentist_id" 
          value={formData.dentist_id || ''}
          onChange={handleInputChange}
          className={styles.formSelect}
        >
          <option value="">Seleccionar odontólogo</option>
          {dentists.map(dentist => (
            <option key={dentist.id} value={dentist.id}>
              {dentist.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className={styles.formActions}>
        <button 
          type="button" 
          className={styles.cancelButton}
          onClick={onCancel}
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          className={styles.submitButton}
        >
          Agregar
        </button>
      </div>
    </form>
  )
}

export default AddChildForm