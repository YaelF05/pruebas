import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import BackButton from '@renderer/components/backButton'
import Button from '@renderer/components/button'
import styles from '../styles/dentistDetail.module.css'
import ProfileAvatar from '@renderer/assets/images/profile-icon-9.png'

interface DentistData {
  dentist_id: number
  user: {
    user_id: number
    name: string
    last_name: string
    email: string
  }
  professional_license: string
  university?: string
  speciality?: string
  about?: string
  service_start_time: string
  service_end_time: string
  phone_number: string
  latitude: number
  longitude: number
}

const DentistDetail: React.FC = () => {
  const { dentistId } = useParams<{ dentistId: string }>()
  const navigate = useNavigate()
  const [dentist, setDentist] = useState<DentistData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Efecto para cargar los datos del dentista desde la API
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const fetchDentistData = async () => {
      try {
        setLoading(true)

        // Si tienes un token de autenticación almacenado, obtenlo
        const authToken = localStorage.getItem('authToken')

        if (!authToken) {
          throw new Error('No se encontró el token de autenticación')
        }

        // URL de la API para obtener los detalles del dentista
        const apiUrl = `https://smiltheet-api.rafabeltrans17.workers.dev/api/dentist/${dentistId}`

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
        setError('No se pudieron cargar los datos del dentista. Usando datos de demostración.')

        // En caso de error, usar datos de demostración
        const mockDentist: DentistData = {
          dentist_id: parseInt(dentistId || '1'),
          user: {
            user_id: 1,
            name: 'Jhon',
            last_name: 'Doe',
            email: 'loremimpsum@email.com'
          },
          professional_license: '12345678',
          university: 'Universidad Veracruzana',
          speciality: 'Ortodoncista',
          about: 'Acerca de mí (texto descriptivo del dentista)...',
          service_start_time: '09:00',
          service_end_time: '17:00',
          phone_number: '9211111111',
          latitude: 18.1511, // Coordenadas para Coatzacoalcos, Veracruz
          longitude: -94.4746
        }

        setDentist(mockDentist)
      } finally {
        setLoading(false)
      }
    }

    fetchDentistData()
  }, [dentistId])

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleScheduleAppointment = () => {
    // Navegar a la página de agendar cita, pasando el ID del dentista
    navigate(`/schedule-appointment/${dentistId}`)
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const formatPhoneNumber = (phone: string) => {
    // Formatear el número de teléfono (ej: 921 111 1111)
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')
  }

  // Genera la URL del mapa estático de OpenStreetMap
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-unused-vars
  const getMapUrl = (lat: number, lon: number, _zoom = 15) => {
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.01}%2C${lat - 0.01}%2C${lon + 0.01}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lon}`
  }

  // Genera la URL para abrir el mapa en una nueva ventana
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const getMapLinkUrl = (lat: number, lon: number) => {
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
          <img src={ProfileAvatar} alt={`${dentist.user.name} ${dentist.user.last_name}`} />
        </div>

        <div className={styles.profileInfo}>
          <h1 className={styles.name}>
            {dentist.user.name} {dentist.user.last_name}
          </h1>
          {dentist.university && <p className={styles.university}>{dentist.university}</p>}
          {dentist.speciality && <p className={styles.speciality}>{dentist.speciality}</p>}

          <p className={styles.license}>Cédula profesional: {dentist.professional_license}</p>

          <p className={styles.schedule}>
            Horario de atención: {dentist.service_start_time} a {dentist.service_end_time}
          </p>
        </div>

        <div className={styles.actionSection}>
          <Button name="Agendar cita" onClick={handleScheduleAppointment} />

          <div className={styles.contactSection}>
            <h3 className={styles.contactTitle}>Contacto</h3>
            <div className={styles.contactItem}>
              <span className={styles.phoneIcon}>☎️</span>
              <span>{formatPhoneNumber(dentist.phone_number)}</span>
            </div>
            <div className={styles.contactItem}>
              <span className={styles.emailIcon}>📧</span>
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
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
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
    </div>
  )
}

export default DentistDetail
