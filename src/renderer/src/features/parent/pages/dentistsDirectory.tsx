import { FC, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BackButton from '@renderer/components/backButton'
import { getDentistsService, DentistResponse } from '../services/dentistService'
import { getDistanceFromLatLonInKm } from '@renderer/utils/location/distance'
import styles from '../styles/dentistsDirectory.module.css'
import ProfileAvatar from '@renderer/assets/images/profile-icon-9.png'
import FilterIcon from '@renderer/assets/icons/filterIcon.png'

const DentistsDirectory: FC = () => {
  const navigate = useNavigate()

  const [dentists, setDentists] = useState<DentistResponse[]>([])
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortByDistance, setSortByDistance] = useState(true)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    loadDentists()
  }, [])

  const loadDentists = async () => {
    try {
      setLoading(true)
      setError(null)

      try {
        const position = await getCurrentLocation()
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      } catch (locationError) {
        console.warn('No se pudo obtener ubicación del usuario:', locationError)
        setUserLocation(null)
      }

      const dentistsData = await getDentistsService()

      if (!dentistsData || dentistsData.length === 0) {
        setDentists([])
        return
      }

      let dentistsWithDistance = dentistsData

      if (userLocation) {
        dentistsWithDistance = dentistsData.map((dentist) => ({
          ...dentist,
          distance:
            dentist.latitude && dentist.longitude
              ? getDistanceFromLatLonInKm(
                  userLocation.lat,
                  userLocation.lng,
                  dentist.latitude,
                  dentist.longitude
                )
              : undefined
        }))
      }

      const sortedDentists = [...dentistsWithDistance].sort((a, b) => {
        if (userLocation && sortByDistance) {
          const distanceA = a.distance || 999
          const distanceB = b.distance || 999
          return distanceA - distanceB
        } else {
          return `${a.name} ${a.lastName}`.localeCompare(`${b.name} ${b.lastName}`)
        }
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

  const getCurrentLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        return reject(new Error('La geolocalización no está disponible en este navegador'))
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        (error) => {
          let errorMessage = 'Error desconocido de geolocalización'
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permiso de geolocalización denegado'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Posición no disponible'
              break
            case error.TIMEOUT:
              errorMessage = 'Tiempo de espera agotado para obtener ubicación'
              break
          }
          reject(new Error(errorMessage))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      )
    })
  }

  const handleToggleDistanceSort = () => {
    setSortByDistance(!sortByDistance)

    const sortedDentists = [...dentists].sort((a, b) => {
      if (!sortByDistance) {
        const distanceA = a.distance || 999
        const distanceB = b.distance || 999
        return distanceA - distanceB
      } else {
        return `${a.name} ${a.lastName}`.localeCompare(`${b.name} ${b.lastName}`)
      }
    })

    setDentists(sortedDentists)
  }

  const handleDentistClick = (userId: number): void => {
    navigate(`/dentist/${userId}`)
  }

  const hasDistanceInfo = dentists.some((d) => d.distance !== undefined)

  if (isLoading) {
    return <div className={styles.loading}>Cargando...</div>
  }

  if (error) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.header}>
          <BackButton />
        </div>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={loadDentists} className={styles.retryButton}>
            Reintentar
          </button>
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
          {userLocation && hasDistanceInfo
            ? 'Odontopediatras cerca de ti'
            : 'Odontopediatras disponibles'}
        </h1>
        {userLocation && hasDistanceInfo && (
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
                <img src={ProfileAvatar} className={styles.profileImage} />
              </div>
              <div className={styles.dentistInfo}>
                <h3 className={styles.dentistName}>
                  Dr. {dentist.name} {dentist.lastName}
                </h3>
                {dentist.distance !== undefined && (
                  <p className={styles.dentistDistance}>
                    A {dentist.distance.toFixed(1)} km de distancia
                  </p>
                )}
                {dentist.university && (
                  <p className={styles.dentistUniversity}>{dentist.university}</p>
                )}
                <p className={styles.dentistId}>
                  Cédula profesional: {dentist.professionalLicense}
                </p>
                {dentist.speciality && (
                  <p className={styles.dentistSpecialty}>Especialidad: {dentist.speciality}</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className={styles.noDentists}>
            <h3>No se encontraron dentistas</h3>
            <p>No hay dentistas disponibles en este momento.</p>
            <button onClick={loadDentists} className={styles.retryButton}>
              Actualizar lista
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default DentistsDirectory
