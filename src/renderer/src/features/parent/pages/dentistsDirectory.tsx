import { FC, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BackButton from '@renderer/components/backButton'
import styles from '../styles/dentistsDirectory.module.css'
import ProfileAvatar from '@renderer/assets/images/profile-icon-9.png'
import FilterIcon from '@renderer/assets/icons/filterIcon.png'

interface DentistData {
  dentist_id: number
  user: {
    user_id: number
    name: string
    last_name: string
  }
  professional_license: string
  university?: string
  speciality?: string
  distance?: number
}

const DentistsPage: FC = () => {
  const navigate = useNavigate()

  // Estado para almacenar los dentistas (mock data)
  const [dentists] = useState<DentistData[]>([
    {
      dentist_id: 1,
      user: {
        user_id: 1,
        name: 'Jhon',
        last_name: 'Doe'
      },
      professional_license: '12345678',
      university: 'Universidad Veracruzana',
      speciality: 'Odontopediatría',
      distance: 1.4
    },
    {
      dentist_id: 2,
      user: {
        user_id: 2,
        name: 'María',
        last_name: 'González'
      },
      professional_license: '87654321',
      university: 'Universidad Nacional Autónoma de México',
      speciality: 'Odontopediatría',
      distance: 2.3
    },
    {
      dentist_id: 3,
      user: {
        user_id: 3,
        name: 'Roberto',
        last_name: 'Sánchez'
      },
      professional_license: '23456789',
      university: 'Universidad Veracruzana',
      speciality: 'Odontopediatría',
      distance: 0.8
    },
    {
      dentist_id: 4,
      user: {
        user_id: 4,
        name: 'Ana',
        last_name: 'López'
      },
      professional_license: '98765432',
      university: 'Universidad Autónoma Metropolitana',
      speciality: 'Odontopediatría',
      distance: 3.1
    },
    {
      dentist_id: 5,
      user: {
        user_id: 5,
        name: 'Carlos',
        last_name: 'Hernández'
      },
      professional_license: '34567890',
      university: 'Universidad Veracruzana',
      speciality: 'Odontopediatría',
      distance: 1.9
    },
    {
      dentist_id: 6,
      user: {
        user_id: 6,
        name: 'Laura',
        last_name: 'Martínez'
      },
      professional_license: '45678901',
      university: 'Universidad de Guadalajara',
      speciality: 'Odontopediatría',
      distance: 2.7
    }
  ])

  // Función para navegar al detalle del dentista
  const handleDentistClick = (dentistId: number): void => {
    navigate(`/dentist/${dentistId}`)
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <BackButton />
      </div>

      <div className={styles.titleSection}>
        <h1 className={styles.title}>Odontopediatras cerca de ti</h1>
        <button className={styles.filterButton}>
          <img src={FilterIcon} alt="Filter" />
          <span>Distancia</span>
        </button>
      </div>

      <div className={styles.dentistsContainer}>
        {dentists.map((dentist) => (
          <div
            key={dentist.dentist_id}
            className={styles.dentistCard}
            onClick={() => handleDentistClick(dentist.dentist_id)}
          >
            <div className={styles.dentistImage}>
              <img
                src={ProfileAvatar}
                alt={`${dentist.user.name} ${dentist.user.last_name}`}
                className={styles.profileImage}
              />
            </div>
            <div className={styles.dentistInfo}>
              <h3 className={styles.dentistName}>
                {dentist.user.name} {dentist.user.last_name}
              </h3>
              <p className={styles.dentistDistance}>Distancia {dentist.distance} km</p>
              {dentist.university && (
                <p className={styles.dentistUniversity}>{dentist.university}</p>
              )}
              <p className={styles.dentistId}>Cédula profesional: {dentist.professional_license}</p>
              {dentist.speciality && (
                <p className={styles.dentistSpecialty}>Especialidad: {dentist.speciality}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DentistsPage
