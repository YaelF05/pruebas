import { FC, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BackButton from '@renderer/components/backButton'
import {
  getDentistsService,
  getNearbyDentistsService,
  DentistResponse
} from '../services/dentistService'
import { getCurrentLocation } from '@renderer/utils/location/geolocation'
import { getDistanceFromLatLonInKm } from '@renderer/utils/location/distance'
import styles from '../styles/dentistsDirectory.module.css'
import ProfileAvatar from '@renderer/assets/images/profile-icon-9.png'
import FilterIcon from '@renderer/assets/icons/filterIcon.png'

const DentistsPage: FC = () => {
  const navigate = useNavigate()
  const [dentists, setDentists] = useState<DentistResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [sortByDistance, setSortByDistance] = useState(false)

  useEffect(() => {
    const fetchDentists = async () => {
      try {
        setLoading(true)
        setError(null)

        // Intentar obtener la ubicación del usuario
        try {
          const position = await getCurrentLocation()
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(location)

          // Si tenemos ubicación, obtener dentistas cercanos
          const nearbyDentists = await getNearbyDentistsService(location.lat, location.lng, 50) // 50km radius

          // Calcular distancias y ordenar
          const dentistsWithDistance = nearbyDentists
            .map((dentist) => ({
              ...dentist,
              distance: getDistanceFromLatLonInKm(
                location.lat,
                location.lng,
                dentist.latitude,
                dentist.longitude
              )
            }))
            .sort((a, b) => a.distance! - b.distance!)

          setDentists(dentistsWithDistance)
        } catch (locationError) {
          console.warn('No se pudo obtener la ubicación del usuario:', locationError)

          // Si no se puede obtener la ubicación, obtener todos los dentistas
          const allDentists = await getDentistsService()
          setDentists(allDentists)
        }
      } catch (error) {
        console.error('Error al obtener dentistas:', error)
        setError(error instanceof Error ? error.message : 'Error al cargar los dentistas')
      } finally {
        setLoading(false)
      }
    }

    fetchDentists()
  }, [])

  // Función para alternar ordenamiento por distancia
  const handleToggleDistanceSort = () => {
    if (!userLocation) return

    setSortByDistance(!sortByDistance)

    const sortedDentists = [...dentists].sort((a, b) => {
      if (!sortByDistance) {
        // Ordenar por distancia (ascendente)
        const distanceA =
          a.distance ||
          getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, a.latitude, a.longitude)
        const distanceB =
          b.distance ||
          getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, b.latitude, b.longitude)
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

  // Función para navegar al detalle del dentista
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
