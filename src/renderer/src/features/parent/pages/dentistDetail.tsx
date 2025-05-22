import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import BackButton from '@renderer/components/backButton'
import { AppointmentData } from '../services/appointmentService'
import ScheduleAppointmentModal from '../components/scheduleAppointment'
import styles from '../styles/dentistDetail.module.css'
import ProfileAvatar from '@renderer/assets/images/profile-icon-9.png'
import Phone from '@renderer/assets/icons/phone.png'
import Mail from '@renderer/assets/icons/mail.png'

interface MockDentist {
  userId: number
  name: string
  lastName: string
  email: string
  professionalLicense: string
  university?: string
  speciality?: string
  about?: string
  serviceStartTime: string
  serviceEndTime: string
  phoneNumber: string
  latitude?: number
  longitude?: number
}

const mockDentists: Record<string, MockDentist> = {
  '1': {
    userId: 1,
    name: 'María',
    lastName: 'González',
    email: 'maria.gonzalez@email.com',
    professionalLicense: '1234567',
    university: 'Universidad Nacional',
    speciality: 'Odontopediatría',
    about:
      'Especialista en odontología pediátrica con más de 10 años de experiencia. Me dedico a crear experiencias positivas para los niños durante sus visitas dentales.',
    serviceStartTime: '08:00',
    serviceEndTime: '18:00',
    phoneNumber: '5512345678',
    latitude: 19.4326,
    longitude: -99.1332
  },
  '2': {
    userId: 2,
    name: 'Carlos',
    lastName: 'Rodríguez',
    email: 'carlos.rodriguez@email.com',
    professionalLicense: '2345678',
    university: 'Universidad Autónoma',
    speciality: 'Ortodoncia Pediátrica',
    about:
      'Experto en ortodoncia para niños y adolescentes. Utilizo técnicas modernas y tratamientos personalizados.',
    serviceStartTime: '09:00',
    serviceEndTime: '17:00',
    phoneNumber: '5523456789'
  }
}

const DentistDetail: React.FC = () => {
  const { dentistId } = useParams<{ dentistId: string }>()
  const navigate = useNavigate()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading] = useState(false)
  const [error] = useState<string | null>(null)

  const dentist = dentistId ? mockDentists[dentistId] : null

  const handleScheduleAppointment = (): void => {
    setIsModalOpen(true)
  }

  const handleAppointmentSubmit = (appointmentData: AppointmentData): void => {
    console.log('Datos de la cita enviados:', appointmentData)

    // Cerrar modal
    setIsModalOpen(false)

    // Navegar a la página de citas del padre
    navigate('/appointmentFather')
  }

  const formatPhoneNumber = (phone: string): string => {
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')
  }

  const getMapUrl = (lat: number, lon: number): string => {
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.01}%2C${lat - 0.01}%2C${lon + 0.01}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lon}`
  }

  const getMapLinkUrl = (lat: number, lon: number): string => {
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=15/${lat}/${lon}`
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

  if (!dentist) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <BackButton />
        </div>
        <div className={styles.error}>
          <p>Dentista no encontrado (ID: {dentistId})</p>
          <p>Dentistas disponibles: {Object.keys(mockDentists).join(', ')}</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className={styles.loading}>Cargando información del dentista...</div>
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <BackButton />
        </div>
        <div className={styles.error}>
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <BackButton />
      </div>

      <div className={styles.profileSection}>
        <div className={styles.profileImage}>
          <img src={ProfileAvatar} alt={`${dentist.name} ${dentist.lastName}`} />
        </div>

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
              <span>{dentist.email}</span>
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

      {/* ✅ Sección de ubicación condicional */}
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
            <p className={styles.addressText}>
              <strong>Coordenadas:</strong> {dentist.latitude.toFixed(6)},{' '}
              {dentist.longitude.toFixed(6)}
            </p>
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

      {/* ✅ CORREGIDO: Modal con dentistId correcto */}
      <ScheduleAppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAppointmentSubmit}
        dentistId={dentist.userId}
      />
    </div>
  )
}

export default DentistDetail
