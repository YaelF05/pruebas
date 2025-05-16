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
  const [, setMapUrl] = useState('')

  useEffect(() => {
    // Mock data para el dentista
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
      about:
        'Acerca de mí aaaaaaaaaaaaaaaaaaa aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      service_start_time: '09:00',
      service_end_time: '17:00',
      phone_number: '9211111111',
      latitude: 18.1511,
      longitude: -94.4746
    }

    setDentist(mockDentist)
    setLoading(false)

    // Generar URL del mapa embebido
    const mapUrlBase = 'https://www.openstreetmap.org/export/embed.html'
    const bbox = `${mockDentist.longitude - 0.01},${mockDentist.latitude - 0.01},${mockDentist.longitude + 0.01},${mockDentist.latitude + 0.01}`
    const marker = `${mockDentist.latitude},${mockDentist.longitude}`
    setMapUrl(`${mapUrlBase}?bbox=${bbox}&layer=mapnik&marker=${marker}`)
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

  if (loading) {
    return <div className={styles.loading}>Cargando...</div>
  }

  if (!dentist) {
    return <div className={styles.error}>No se encontró el dentista</div>
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <BackButton />
      </div>

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
        <div className={styles.mapContainer}>{/* Mapa vacío por ahora */}</div>
      </div>
    </div>
  )
}

export default DentistDetail
