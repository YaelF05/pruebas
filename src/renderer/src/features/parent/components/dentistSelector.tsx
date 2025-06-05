import React, { useEffect, useState } from 'react'
import { getCurrentLocation } from '@renderer/utils/location/geolocation'
import { getDentistsForSelectService } from '../services/dentistGeoService'
import styles from '../styles/dentistSelector.module.css'

interface DentistOption {
  label: string
  value: number
}

interface DentistSelectorProps {
  selectedDentistId: number | null
  onSelect: (id: number) => void
  onError?: (error: string) => void
  useGeolocation?: boolean
  maxDistance?: number
}

const DentistSelector: React.FC<DentistSelectorProps> = ({
  selectedDentistId,
  onSelect,
  onError,
  useGeolocation = true,
  maxDistance
}) => {
  const [options, setOptions] = useState<DentistOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [locationStatus, setLocationStatus] = useState<string>('')

  useEffect(() => {
    const fetchDentists = async (): Promise<void> => {
      try {
        setLoading(true)
        setError(null)
        setLocationStatus('')

        let userLatitude: number | undefined
        let userLongitude: number | undefined

        if (useGeolocation) {
          try {
            setLocationStatus('Obteniendo ubicación...')
            const position = await getCurrentLocation()
            userLatitude = position.coords.latitude
            userLongitude = position.coords.longitude
            setLocationStatus('Buscando odontólogos cercanos...')
          } catch (geoError) {
            console.warn('No se pudo obtener la ubicación:', geoError)
            setLocationStatus('Cargando todos los odontólogos...')
          }
        } else {
          setLocationStatus('Cargando odontólogos...')
        }

        const dentists = await getDentistsForSelectService(userLatitude, userLongitude)

        const formatted: DentistOption[] = dentists.map((d) => ({
          label: d.name,
          value: d.userId
        }))

        setOptions(formatted)
        setLocationStatus('')

        if (formatted.length === 0) {
          const warningMsg =
            useGeolocation && maxDistance
              ? `No se encontraron odontólogos en un radio de ${maxDistance} km.`
              : 'No se encontraron odontólogos disponibles.'
          setError(warningMsg)
          onError?.(warningMsg)
        }
      } catch (err: unknown) {
        const errorMsg = 'No se pudieron cargar los odontólogos. Por favor intenta nuevamente.'
        console.error('Error al cargar dentistas:', err)
        setError(errorMsg)
        onError?.(errorMsg)
        setLocationStatus('')
      } finally {
        setLoading(false)
      }
    }

    fetchDentists()
  }, [useGeolocation, maxDistance, onError])

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const value = Number(e.target.value)
    if (!isNaN(value) && value > 0) {
      onSelect(value)
      setError(null)
    }
  }

  const retryFetch = (): void => {
    setError(null)
    setLoading(true)
    // Re-trigger useEffect
    window.location.reload()
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <label className={styles.label}>Odontólogo</label>
        <p className={styles.loadingText}>{locationStatus || 'Cargando...'}</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <label htmlFor="dentist-select" className={styles.label}>
        Odontólogo *
      </label>

      {error ? (
        <div>
          <p className={styles.errorText}>{error}</p>
          <button type="button" onClick={retryFetch} className={styles.retryButton}>
            Reintentar
          </button>
        </div>
      ) : (
        <select
          id="dentist-select"
          value={selectedDentistId ?? ''}
          onChange={handleChange}
          required
          className={styles.input}
        >
          <option value="">Seleccionar odontólogo</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {options.length > 0 && !error && (
        <p className={styles.infoText}>
          {useGeolocation
            ? `${options.length} odontólogo(s) encontrado(s) ${maxDistance ? `en un radio de ${maxDistance} km` : 'ordenados por proximidad'}`
            : `${options.length} odontólogo(s) disponible(s)`}
        </p>
      )}
    </div>
  )
}

export default DentistSelector
