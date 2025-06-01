import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import BackButton from '@renderer/components/backButton'
import { AppointmentData } from '../services/appointmentService'
import { getDentistByIdService, DentistResponse } from '../services/dentistService'
import ScheduleAppointmentModal from '../components/scheduleAppointment'
import styles from '../styles/dentistDetail.module.css'
import Phone from '@renderer/assets/icons/phone.svg'
import Mail from '@renderer/assets/icons/mail.svg'

const DentistDetail: React.FC = () => {
  const { dentistId } = useParams<{ dentistId: string }>()
  const navigate = useNavigate()

  const [dentist, setDentist] = useState<DentistResponse | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (dentistId) {
      loadDentistData(parseInt(dentistId))
    } else {
      setError('ID de dentista no proporcionado')
      setLoading(false)
    }
  }, [dentistId])

  const loadDentistData = async (id: number): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      const dentistData = await getDentistByIdService(id)

      setDentist(dentistData)
    } catch (error) {
      console.error('Error al cargar dentista:', error)
      setError(error instanceof Error ? error.message : 'Error al cargar el dentista')
    } finally {
      setLoading(false)
    }
  }

  const handleScheduleAppointment = (): void => {
    setIsModalOpen(true)
  }

  const handleAppointmentSubmit = (appointmentData: AppointmentData): void => {
    console.log('Cita agendada exitosamente:', appointmentData)
  }

  const handleAppointmentSuccess = (): void => {
    setIsModalOpen(false)

    setTimeout(() => {
      navigate('/appointmentFather')
    }, 100)
  }

  const formatPhoneNumber = (phone: string): string => {
    if (phone.length === 10) {
      return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')
    }
    return phone
  }

  const getMapUrl = (lat: number, lon: number): string => {
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.01}%2C${lat - 0.01}%2C${lon + 0.01}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lon}`
  }

  const getMapLinkUrl = (lat: number, lon: number): string => {
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=15/${lat}/${lon}`
  }

  if (isLoading) {
    return <div className={styles.loading}>Cargando...</div>
  }

  if (!dentistId) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <BackButton />
        </div>
        <div className={styles.error}>ID de dentista no proporcionado.</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <BackButton />
        </div>
        <div className={styles.error}>
          <p>Error: {error}</p>
          <button onClick={() => loadDentistData(parseInt(dentistId))}>Reintentar</button>
        </div>
      </div>
    )
  }

  if (!dentist) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <BackButton />
        </div>
        <div className={styles.error}>Dentista no encontrado.</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <BackButton />
      </div>

      <div className={styles.profileSection}>
        <div className={styles.profileImage}></div>

        <div className={styles.profileInfo}>
          <h1 className={styles.name}>
            Dr. {dentist.name} {dentist.lastName}
          </h1>
          {dentist.university && <p className={styles.university}>{dentist.university}</p>}
          {dentist.speciality && <p className={styles.speciality}>{dentist.speciality}</p>}

          <p className={styles.license}>Cédula profesional: {dentist.professionalLicense}</p>

          <p className={styles.schedule}>
            Horario de atención: {dentist.serviceStartTime} a {dentist.serviceEndTime}
          </p>
        </div>

        <div className={styles.actionSection}>
          <button className={styles.scheduleButton} onClick={handleScheduleAppointment}>
            Agendar cita
          </button>

          <div className={styles.contactSection}>
            <h3 className={styles.contactTitle}>Contacto</h3>
            <div className={styles.contactItem}>
              <img src={Phone} alt="Teléfono" className={styles.contactIcon} />
              <span>{formatPhoneNumber(dentist.phoneNumber)}</span>
            </div>
            <div className={styles.contactItem}>
              <img src={Mail} alt="Correo" className={styles.contactIcon} />
              <span>{formatPhoneNumber(dentist.email)}</span>
            </div>
          </div>
        </div>
      </div>

      {dentist.about && (
        <div className={styles.aboutSection}>
          <h2 className={styles.sectionTitle}>Acerca de mí</h2>
          <p className={styles.aboutText}>{dentist.about}</p>
        </div>
      )}

      {/* Sección de ubicación condicional */}
      {dentist.latitude && dentist.longitude && (
        <div className={styles.locationSection}>
          <h2 className={styles.locationTitle}>Me encuentras en</h2>
          <div className={styles.mapContainer}>
            <iframe
              width="100%"
              height="100%"
              src={getMapUrl(dentist.latitude, dentist.longitude)}
              title="Ubicación del consultorio"
            ></iframe>
          </div>
          <div className={styles.addressInfo}>
            <a
              href={getMapLinkUrl(dentist.latitude, dentist.longitude)}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.viewMapLink}
            >
              Ver mapa completo
            </a>
          </div>
        </div>
      )}

      {/* Modal de agendamiento de citas con callback de éxito */}
      <ScheduleAppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAppointmentSubmit}
        onSuccess={handleAppointmentSuccess}
        dentistId={dentist.userId}
      />
    </div>
  )
}

export default DentistDetail
