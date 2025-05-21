import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import BackButton from '@renderer/components/backButton'
import styles from '../styles/dentistDetail.module.css'
import ProfileAvatar from '@renderer/assets/images/profile-icon-9.png'
import Phone from '@renderer/assets/icons/phone.png'
import Mail from '@renderer/assets/icons/mail.png'
import ScheduleAppointmentModal from '../components/scheduleAppointment'

interface DentistData {
  userId: number
  user: {
    userId: number
    name: string
    lastName: string
    email: string
  }
  professionalLicense: string
  university?: string
  speciality?: string
  about?: string
  serviceStartTime: string
  serviceEndTime: string
  phoneNumber: string
  latitude: number
  longitude: number
}

const DentistDetail: React.FC = () => {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const [dentist, setDentist] = useState<DentistData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchDentistData = async (): Promise<void> => {
      try {
        setLoading(true)

        const authToken = localStorage.getItem('authToken')

        if (!authToken) {
          throw new Error('No se encontró el token de autenticación')
        }

        // URL de la API para obtener los detalles del dentista
        const apiUrl = ``

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error(`Error al obtener los detalles del dentista: ${response.status}`)
        }

        const data = await response.json()
        setDentist(data)
      } catch (error) {
        console.error('Error al obtener los datos del dentista:', error)
        setError('')

        // Pruebas
        const mockDentist: DentistData = {
          userId: parseInt(userId || '1'),
          user: {
            userId: 1,
            name: 'Jhon',
            lastName: 'Doe',
            email: 'loremimpsum@email.com'
          },
          professionalLicense: '12345678',
          university: 'Universidad Veracruzana',
          speciality: 'Ortodoncista',
          about: 'Acerca de mí (texto descriptivo del dentista)...',
          serviceStartTime: '09:00',
          serviceEndTime: '17:00',
          phoneNumber: '9211111111',
          latitude: 18.1511,
          longitude: -94.4746
        }

        setDentist(mockDentist)
      } finally {
        setLoading(false)
      }
    }

    fetchDentistData()
  }, [userId])

  const handleScheduleAppointment = (): void => {
    // Abrir el modal en lugar de navegar
    setIsModalOpen(true)
  }

  // Función para manejar el envío del formulario de cita
  const handleAppointmentSubmit = (appointmentData: unknown): void => {
    // Aquí iría la lógica para enviar los datos a la API
    console.log('Datos de la cita:', appointmentData)

    // alerta de creación de la cita
    alert('¡Cita agendada con éxito!')

    setIsModalOpen(false)

    navigate('/appointmentFather')
  }

  const formatPhoneNumber = (phone: string): string => {
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')
  }

  // Genera la URL del mapa estático de OpenStreetMap
  const getMapUrl = (lat: number, lon: number): string => {
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.01}%2C${lat - 0.01}%2C${lon + 0.01}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lon}`
  }

  // Genera la URL para abrir el mapa en una nueva ventana
  const getMapLinkUrl = (lat: number, lon: number): string => {
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=15/${lat}/${lon}`
  }

  if (loading) {
    return <div className={styles.loading}>Cargando información del dentista...</div>
  }

  if (!dentist) {
    return <div className={styles.error}>No se encontró la información del dentista.</div>
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <BackButton />
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      <div className={styles.profileSection}>
        <div className={styles.profileImage}>
          <img src={ProfileAvatar} alt={`${dentist.user.name} ${dentist.user.lastName}`} />
        </div>

        <div className={styles.profileInfo}>
          <h1 className={styles.name}>
            {dentist.user.name} {dentist.user.lastName}
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
              <span>{dentist.user.email}</span>
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

      <div className={styles.locationSection}>
        <h2 className={styles.locationTitle}>Me encuentras en</h2>
        {dentist.latitude && dentist.longitude ? (
          <>
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
          </>
        ) : (
          <div className={styles.noLocationInfo}>
            No hay información de ubicación disponible para este consultorio.
          </div>
        )}
      </div>

      {/* Modal para agendar cita */}
      <ScheduleAppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAppointmentSubmit}
        userId={userId}
      />
    </div>
  )
}

export default DentistDetail
