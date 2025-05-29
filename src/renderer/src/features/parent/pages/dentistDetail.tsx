import { FC, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BackButton from '@renderer/components/backButton'
import { getDentistsService, DentistResponse } from '../services/dentistService'
import styles from '../styles/dentistsDirectory.module.css'
import ProfileAvatar from '@renderer/assets/images/profile-icon-9.png'
import FilterIcon from '@renderer/assets/icons/filterIcon.png'

const DentistsPage: FC = () => {
  const navigate = useNavigate()

  const [dentists, setDentists] = useState<DentistResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortByDistance, setSortByDistance] = useState(true)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    const loadDentists = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log('Cargando dentistas desde la API...')

        // Obtener ubicación del usuario si es posible
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

        // Cargar dentistas desde la API
        const dentistsData = await getDentistsService()
        console.log('Dentistas cargados desde API:', dentistsData)

        // Calcular distancias si tenemos ubicación del usuario
        let dentistsWithDistance = dentistsData

        if (userLocation) {
          dentistsWithDistance = dentistsData.map((dentist) => ({
            ...dentist,
            distance:
              dentist.latitude && dentist.longitude
                ? calculateDistance(
                    userLocation.lat,
                    userLocation.lng,
                    dentist.latitude,
                    dentist.longitude
                  )
                : undefined
          }))
        }

        // Ordenar por distancia por defecto
        const sortedDentists = [...dentistsWithDistance].sort((a, b) => {
          const distanceA = a.distance || 999
          const distanceB = b.distance || 999
          return distanceA - distanceB
        })

        setDentists(sortedDentists)
      } catch (error) {
        console.error('Error al cargar dentistas:', error)
        setError(error instanceof Error ? error.message : 'Error al cargar los dentistas')
        setDentists([])
      } finally {
        setLoading(false)
      }
    }

    loadDentists()
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

  // Función para calcular distancia usando fórmula de Haversine
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Radio de la Tierra en km
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180)
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
        return `${a.user.name} ${a.user.lastName}`.localeCompare(
          `${b.user.name} ${b.user.lastName}`
        )
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
        {userLocation && dentists.some(d => d.distance !== undefined) && (
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
                  alt={`${dentist.user.name} ${dentist.user.lastName}`}
                  className={styles.profileImage}
                />
              </div>
              <div className={styles.dentistInfo}>
                <h3 className={styles.dentistName}>
                  Dr. {dentist.user.name} {dentist.user.lastName}
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
