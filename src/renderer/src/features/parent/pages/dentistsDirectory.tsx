import { FC, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BackButton from '@renderer/components/backButton'
import styles from '../styles/dentistsDirectory.module.css'
import ProfileAvatar from '@renderer/assets/images/profile-icon-9.png'
import FilterIcon from '@renderer/assets/icons/filterIcon.png'

interface DentistData {
  userId: number
  user: {
    userId: number
    name: string
    lastName: string
  }
  professionalLicense: string
  university?: string
  speciality?: string
  distance?: number
}

const DentistsPage: FC = () => {
  const navigate = useNavigate()

  // Estado para almacenar los dentistas (mock data)
  const [dentists] = useState<DentistData[]>([
    {
      userId: 1,
      user: {
        userId: 1,
        name: 'Jhon',
        lastName: 'Doe'
      },
      professionalLicense: '12345678',
      university: 'Universidad Veracruzana',
      speciality: 'Odontopediatría',
      distance: 1.4
    },
    {
      userId: 2,
      user: {
        userId: 2,
        name: 'María',
        lastName: 'González'
      },
      professionalLicense: '87654321',
      university: 'Universidad Nacional Autónoma de México',
      speciality: 'Odontopediatría',
      distance: 2.3
    },
    {
      userId: 3,
      user: {
        userId: 3,
        name: 'Roberto',
        lastName: 'Sánchez'
      },
      professionalLicense: '23456789',
      university: 'Universidad Veracruzana',
      speciality: 'Odontopediatría',
      distance: 0.8
    },
    {
      userId: 4,
      user: {
        userId: 4,
        name: 'Ana',
        lastName: 'López'
      },
      professionalLicense: '98765432',
      university: 'Universidad Autónoma Metropolitana',
      speciality: 'Odontopediatría',
      distance: 3.1
    },
    {
      userId: 5,
      user: {
        userId: 5,
        name: 'Carlos',
        lastName: 'Hernández'
      },
      professionalLicense: '34567890',
      university: 'Universidad Veracruzana',
      speciality: 'Odontopediatría',
      distance: 1.9
    },
    {
      userId: 6,
      user: {
        userId: 6,
        name: 'Laura',
        lastName: 'Martínez'
      },
      professionalLicense: '45678901',
      university: 'Universidad de Guadalajara',
      speciality: 'Odontopediatría',
      distance: 2.7
    }
  ])

  // Función para navegar al detalle del dentista
  const handleDentistClick = (userId: number): void => {
    navigate(`/dentist/${userId}`)
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
            key={dentist.userId}
            className={styles.dentistCard}
            onClick={() => handleDentistClick(dentist.userId)}
          >
            <div className={styles.dentistImage}>
              <img
                src={ProfileAvatar}
                alt={`${dentist.user.name} ${dentist.user.lastName}`}
                className={styles.profileImage}
              />
            </div>
            <div className={styles.dentistInfo}>
              <h3 className={styles.dentistName}>
                {dentist.user.name} {dentist.user.lastName}
              </h3>
              <p className={styles.dentistDistance}>Distancia {dentist.distance} km</p>
              {dentist.university && (
                <p className={styles.dentistUniversity}>{dentist.university}</p>
              )}
              <p className={styles.userId}>Cédula profesional: {dentist.professionalLicense}</p>
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
