import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import BackButton from '@renderer/components/backButton'
import { getDentistByIdService, DentistResponse } from '../services/dentistService'
import { AppointmentData } from '../services/appointmentService'
import ScheduleAppointmentModal from '../components/scheduleAppointment'
import styles from '../styles/dentistDetail.module.css'
import ProfileAvatar from '@renderer/assets/images/profile-icon-9.png'
import Phone from '@renderer/assets/icons/phone.png'
import Mail from '@renderer/assets/icons/mail.png'

const DentistDetail: React.FC = () => {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const [dentist, setDentist] = useState<DentistResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchDentistData = async (): Promise<void> => {
      if (!userId) {
        setError('ID de dentista no encontrado')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const dentistData = await getDentistByIdService(parseInt(userId))
        setDentist(dentistData)
      } catch (error) {
        console.error('Error al obtener los datos del dentista:', error)
        setError(error instanceof Error ? error.message : 'Error al cargar los datos del dentista')
      } finally {
        setLoading(false)
      }
    }

    fetchDentistData()
  }, [userId])

  const handleScheduleAppointment = (): void => {
    setIsModalOpen(true)
  }

  // Función para manejar el envío del formulario de cita
  const handleAppointmentSubmit = (appointmentData: AppointmentData): void => {
    console.log('Datos de la cita:', appointmentData)

    // Mostrar mensaje de éxito
    alert('¡Cita agendada con éxito!')

    // Cerrar modal
    setIsModalOpen(false)

    // Navegar a la página de citas
    navigate('/appointmentFather')
  }

  const formatPhoneNumber = (phone: string): string => {
    // Formato: XXX XXX XXXX
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

  if (!dentist) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <BackButton />
        </div>
        <div className={styles.error}>No se encontró la información del dentista.</div>
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
          <img src={ProfileAvatar} alt={`${dentist.user.name} ${dentist.user.lastName}`} />
        </div>

        <div className={styles.profileInfo}>
          <h1 className={styles.name}>
            Dr. {dentist.user.name} {dentist.user.lastName}
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
        dentistId={dentist.userId}
      />
    </div>
  )
}

export default DentistDetail
