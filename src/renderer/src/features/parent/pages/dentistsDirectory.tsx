import { FC, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BackButton from '@renderer/components/backButton'
import styles from '../styles/dentistsDirectory.module.css'
import ProfileAvatar from '@renderer/assets/images/profile-icon-9.png'
import FilterIcon from '@renderer/assets/icons/filterIcon.png'

interface MockDentist {
  userId: number
  name: string
  lastName: string
  email: string
  professionalLicense: string
  university?: string
  speciality?: string
  serviceStartTime: string
  serviceEndTime: string
  phoneNumber: string
  latitude?: number
  longitude?: number
  distance?: number
}

const mockDentists: MockDentist[] = [
  {
    userId: 1,
    name: 'María',
    lastName: 'González',
    email: 'maria.gonzalez@email.com',
    professionalLicense: '1234567',
    university: 'Universidad Nacional',
    speciality: 'Odontopediatría',
    serviceStartTime: '08:00',
    serviceEndTime: '18:00',
    phoneNumber: '5512345678',
    latitude: 19.4326,
    longitude: -99.1332,
    distance: 2.5
  },
  {
    userId: 2,
    name: 'Carlos',
    lastName: 'Rodríguez',
    email: 'carlos.rodriguez@email.com',
    professionalLicense: '2345678',
    university: 'Universidad Autónoma',
    speciality: 'Ortodoncia Pediátrica',
    serviceStartTime: '09:00',
    serviceEndTime: '17:00',
    phoneNumber: '5523456789',
    distance: 5.2
  },
  {
    userId: 3,
    name: 'Ana',
    lastName: 'Martínez',
    email: 'ana.martinez@email.com',
    professionalLicense: '3456789',
    university: 'Universidad Metropolitana',
    speciality: 'Odontología General',
    serviceStartTime: '10:00',
    serviceEndTime: '19:00',
    phoneNumber: '5534567890',
    distance: 1.8
  },
  {
    userId: 4,
    name: 'Luis',
    lastName: 'Fernández',
    email: 'luis.fernandez@email.com',
    professionalLicense: '4567890',
    serviceStartTime: '07:00',
    serviceEndTime: '16:00',
    phoneNumber: '5545678901',
    distance: 8.1
  }
]

const DentistsPage: FC = () => {
  const navigate = useNavigate()

  const [dentists, setDentists] = useState<MockDentist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortByDistance, setSortByDistance] = useState(true)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    const loadMockData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Simular delay de carga
        await new Promise((resolve) => setTimeout(resolve, 500))

        try {
          const position = await getCurrentLocation()
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          console.log('Ubicación obtenida:', position.coords)
        } catch (locationError) {
          console.warn('No se pudo obtener ubicación:', locationError)
          // Usar ubicación por defecto (Ciudad de México)
          setUserLocation({
            lat: 19.4326,
            lng: -99.1332
          })
        }

        const sortedDentists = [...mockDentists].sort((a, b) => {
          const distanceA = a.distance || 999
          const distanceB = b.distance || 999
          return distanceA - distanceB
        })

        setDentists(sortedDentists)
      } catch (error) {
        console.error('Error al cargar dentistas:', error)
        setError(error instanceof Error ? error.message : 'Error al cargar los dentistas')
      } finally {
        setLoading(false)
      }
    }

    loadMockData()
  }, [])

  const getCurrentLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        return reject(new Error('La geolocalización no está disponible'))
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000
      })
    })
  }

  const handleToggleDistanceSort = () => {
    setSortByDistance(!sortByDistance)

    const sortedDentists = [...dentists].sort((a, b) => {
      if (!sortByDistance) {
        // Ordenar por distancia (ascendente)
        const distanceA = a.distance || 999
        const distanceB = b.distance || 999
        return distanceA - distanceB
      } else {
        // Ordenar alfabéticamente por nombre
        return `${a.name} ${a.lastName}`.localeCompare(`${b.name} ${b.lastName}`)
      }
    })

    setDentists(sortedDentists)
  }

  const handleDentistClick = (userId: number): void => {
    navigate(`/dentist/${userId}`)
  }

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.header}>
          <BackButton />
        </div>
        <div className={styles.loading}>Cargando dentistas...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.pageContainer}>
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
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <BackButton />
      </div>

      <div className={styles.titleSection}>
        <h1 className={styles.title}>
          {userLocation ? 'Odontopediatras cerca de ti' : 'Odontopediatras disponibles'}
        </h1>
        {userLocation && (
          <button className={styles.filterButton} onClick={handleToggleDistanceSort}>
            <img src={FilterIcon} alt="Filter" />
            <span>{sortByDistance ? 'Nombre' : 'Distancia'}</span>
          </button>
        )}
      </div>

      <div className={styles.dentistsContainer}>
        {dentists.length > 0 ? (
          dentists.map((dentist) => (
            <div
              key={dentist.userId}
              className={styles.dentistCard}
              onClick={() => handleDentistClick(dentist.userId)}
            >
              <div className={styles.dentistImage}>
                <img
                  src={ProfileAvatar}
                  alt={`${dentist.name} ${dentist.lastName}`}
                  className={styles.profileImage}
                />
              </div>
              <div className={styles.dentistInfo}>
                <h3 className={styles.dentistName}>
                  Dr. {dentist.name} {dentist.lastName}
                </h3>
                {dentist.distance !== undefined && (
                  <p className={styles.dentistDistance}>
                    Distancia {dentist.distance.toFixed(1)} km
                  </p>
                )}
                {dentist.university && (
                  <p className={styles.dentistUniversity}>{dentist.university}</p>
                )}
                <p className={styles.userId}>Cédula profesional: {dentist.professionalLicense}</p>
                {dentist.speciality && (
                  <p className={styles.dentistSpecialty}>Especialidad: {dentist.speciality}</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className={styles.noDentists}>
            <p>No se encontraron dentistas disponibles.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DentistsPage
