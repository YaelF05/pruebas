import { useState } from 'react'
import BackButton from '@renderer/components/backButton'
import InputForm from '@renderer/components/inputForm'
import TextareaInput from '@renderer/components/textareaInput'
import Button from '@renderer/components/button'
import updateImage from '@renderer/assets/icons/updateImage.svg'
import styles from '../styles/formDentist.module.css'

const FormDentist: React.FC = () => {
  const [cedula, setCedula] = useState('')
  const [university, setUniversity] = useState('')
  const [especiality, setEspeciality] = useState('')
  const [aboutMe, setAboutMe] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    // Handle form submission here
    console.log({
      cedula,
      university,
      especiality,
      aboutMe,
      startTime,
      endTime,
      address,
      phone
    })
  }

  return (
    <div className={styles.pageContainer}>
      <BackButton />

      <form className={styles.container} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Termina de crear tu cuenta para conectar con más pacientes</h1>

        <div className={styles.profileImageContainer}>
          <img src={updateImage} alt="Update Dentist Image" />
          <fieldset className={styles.fieldsetImage}>
            <InputForm
              label="Cédula profesional"
              name="cedula"
              type="text"
              value={cedula}
              placeholder="Cédula profesional"
              onChange={(e) => setCedula(e.target.value)}
              required={true}
            />
            <InputForm
              label="Universidad de procedencia"
              name="university"
              type="text"
              value={university}
              placeholder="Universidad de procedencia"
              onChange={(e) => setUniversity(e.target.value)}
              required={true}
            />
            <InputForm
              label="Especialidad"
              name="especiality"
              type="text"
              value={especiality}
              placeholder="Especialidad"
              onChange={(e) => setEspeciality(e.target.value)}
              required={true}
            />
          </fieldset>
        </div>

        <fieldset className={styles.fieldset}>
          <TextareaInput
            label={'Sobre mí'}
            name="aboutMe"
            value={aboutMe}
            placeholder="Sobre mí"
            onChange={(e) => setAboutMe(e.target.value)}
            required={true}
          />

          <div className={styles.timeFieldsContainer}>
            <div className={styles.timeField}>
              <InputForm
                label="Inicio de atención"
                name="startTime"
                type="time"
                value={startTime}
                placeholder="Inicio de atención"
                onChange={(e) => setStartTime(e.target.value)}
                required={true}
              />
            </div>
            <div className={styles.timeField}>
              <InputForm
                label="Fin de atención"
                name="endTime"
                type="time"
                value={endTime}
                placeholder="Fin de atención"
                onChange={(e) => setEndTime(e.target.value)}
                required={true}
              />
            </div>
          </div>

          <InputForm
            label="Dirección del consultorio"
            name="address"
            type="text"
            value={address}
            placeholder="Dirección del consultorio"
            onChange={(e) => setAddress(e.target.value)}
            required={true}
          />

          <InputForm
            label="Número telefónico"
            name="phone"
            type="tel"
            value={phone}
            placeholder="Número telefónico"
            onChange={(e) => setPhone(e.target.value)}
            required={true}
          />
        </fieldset>

        <div className={styles.buttonContainer}>
          <Button name="Crear perfil profesional" type="submit" />
        </div>
      </form>
    </div>
  )
}

export default FormDentist
