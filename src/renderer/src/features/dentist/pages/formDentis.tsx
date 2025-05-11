import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { createDentistService } from '../services/createDentistService'
import { CreateDentistCredentials, CreateDentistResponse } from '../types/dentistTypes'
import {
  validateProfessionalLicense,
  validateUniversity,
  validateSpeciality,
  validateAbout,
  validateServiceStartTime,
  validateServiceEndTime,
  validateAddress,
  validatePhoneNumber
} from '@renderer/utils/validators'
import { geocodeAddress } from '@renderer/utils/location/geocoding'
import BackButton from '@renderer/components/backButton'
import InputForm from '@renderer/components/inputForm'
import TextareaInput from '@renderer/components/textareaInput'
import Button from '@renderer/components/button'
import updateImage from '@renderer/assets/icons/updateImage.svg'
import styles from '../styles/formDentist.module.css'

const FormDentist = (): React.JSX.Element => {
  const [profesionalLicense, setProfesionalLicense] = useState('')
  const [university, setUniversity] = useState('')
  const [speciality, setSpeciality] = useState('')
  const [about, setAbout] = useState('')
  const [ServicestartTime, setServiceStartTime] = useState('')
  const [ServiceEndTime, setServiceEndTime] = useState('')
  const [address, setAddress] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [errors, setErrors] = useState<{
    profesionalLicense?: string
    university?: string
    speciality?: string
    about?: string
    serviceStartTime?: string
    serviceEndTime?: string
    address?: string
    phoneNumber?: string
  }>({})
  const [createDentistError, setCreateDentistError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setErrors({})
    setCreateDentistError(null)
    setIsLoading(true)

    const profesionalLicenseError = validateProfessionalLicense(profesionalLicense)
    const ServiceStartTimeError = validateServiceStartTime(ServicestartTime)
    const ServiceEndTimeError = validateServiceEndTime(ServiceEndTime)
    const addressError = validateAddress(address)
    const phoneNumberError = validatePhoneNumber(phoneNumber)

    const universityError = university.trim() !== '' ? validateUniversity(university) : null
    const specialityError = speciality.trim() !== '' ? validateSpeciality(speciality) : null
    const aboutError = about.trim() !== '' ? validateAbout(about) : null

    if (
      profesionalLicenseError ||
      universityError ||
      specialityError ||
      aboutError ||
      ServiceStartTimeError ||
      ServiceEndTimeError ||
      addressError ||
      phoneNumberError
    ) {
      setErrors({
        profesionalLicense: profesionalLicenseError || undefined,
        university: universityError || undefined,
        speciality: specialityError || undefined,
        about: aboutError || undefined,
        serviceStartTime: ServiceStartTimeError || undefined,
        serviceEndTime: ServiceEndTimeError || undefined,
        address: addressError || undefined,
        phoneNumber: phoneNumberError || undefined
      })
      setIsLoading(false)
      return
    }

    let latitude = 0
    let longitude = 0

    try {
      const geoResult = await geocodeAddress(address)
      latitude = geoResult.lat
      longitude = geoResult.lon
    } catch (error) {
      console.error('Error al geocodificar la dirección:', error)
      setCreateDentistError(
        'Error al geocodificar la dirección, verifica que sea correcta y completa'
      )
      setIsLoading(false)
      return
    }

    // Now create the credentials with the newly obtained coordinates
    const credentials: CreateDentistCredentials = {
      professionalLicense: profesionalLicense,
      serviceStartTime: ServicestartTime,
      serviceEndTime: ServiceEndTime,
      phoneNumber: phoneNumber,
      latitude: latitude,
      longitude: longitude
    }

    if (university.trim() !== '') {
      credentials.university = university
    }

    if (speciality.trim() !== '') {
      credentials.speciality = speciality
    }

    if (about.trim() !== '') {
      credentials.about = about
    }

    try {
      const result: CreateDentistResponse = await createDentistService(credentials)
      console.log('Dentista creado:', result)
      navigate('/dentistDashboard')
    } catch (error) {
      console.error('Error al crear el dentista:', error)
      setCreateDentistError('Error al crear el dentista')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <BackButton />

      <form className={styles.form} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Termina de crear tu cuenta para conectar con más pacientes</h1>
        {createDentistError && (
          <div className={styles.createDentistError}>{createDentistError}</div>
        )}

        <div className={styles.profileImageContainer}>
          <img src={updateImage} alt="Update Dentist Image" />
          <fieldset className={styles.fieldsetImage}>
            <InputForm
              label="Cédula profesional"
              name="cedula"
              type="text"
              value={profesionalLicense}
              placeholder="Cédula profesional"
              onChange={(e) => setProfesionalLicense(e.target.value)}
              required={true}
            />
            {errors.profesionalLicense && (
              <div className={styles.errorMessage}>{errors.profesionalLicense}</div>
            )}
            <InputForm
              label="Universidad de procedencia"
              name="university"
              type="text"
              value={university}
              placeholder="Universidad de procedencia"
              onChange={(e) => setUniversity(e.target.value)}
              required={true}
            />
            {errors.university && <div className={styles.errorMessage}>{errors.university}</div>}
            <InputForm
              label="Especialidad"
              name="especiality"
              type="text"
              value={speciality}
              placeholder="Especialidad"
              onChange={(e) => setSpeciality(e.target.value)}
              required={true}
            />
            {errors.speciality && <div className={styles.errorMessage}>{errors.speciality}</div>}
          </fieldset>
        </div>

        <fieldset className={styles.fieldset}>
          <TextareaInput
            label={'Sobre mí'}
            name="aboutMe"
            value={about}
            placeholder="Sobre mí"
            onChange={(e) => setAbout(e.target.value)}
            required={true}
          />
          {errors.about && <div className={styles.errorMessage}>{errors.about}</div>}

          <div className={styles.timeFieldsContainer}>
            <div className={styles.timeField}>
              <InputForm
                label="Inicio de atención"
                name="startTime"
                type="time"
                value={ServicestartTime}
                placeholder="Inicio de atención"
                onChange={(e) => setServiceStartTime(e.target.value)}
                required={true}
              />
              {errors.serviceStartTime && (
                <div className={styles.errorMessage}>{errors.serviceStartTime}</div>
              )}
            </div>
            <div className={styles.timeField}>
              <InputForm
                label="Fin de atención"
                name="endTime"
                type="time"
                value={ServiceEndTime}
                placeholder="Fin de atención"
                onChange={(e) => setServiceEndTime(e.target.value)}
                required={true}
              />
              {errors.serviceEndTime && (
                <div className={styles.errorMessage}>{errors.serviceEndTime}</div>
              )}
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
          {errors.address && <div className={styles.errorMessage}>{errors.address}</div>}

          <InputForm
            label="Número telefónico"
            name="phone"
            type="tel"
            value={phoneNumber}
            placeholder="Número telefónico"
            onChange={(e) => setPhoneNumber(e.target.value)}
            required={true}
          />
          {errors.phoneNumber && <div className={styles.errorMessage}>{errors.phoneNumber}</div>}
        </fieldset>

        <div className={styles.buttonContainer}>
          <Button
            name={isLoading ? 'Procesando...' : 'Crear perfil profesional'}
            type="submit"
            disabled={isLoading}
          />
        </div>
      </form>
    </div>
  )
}

export default FormDentist
