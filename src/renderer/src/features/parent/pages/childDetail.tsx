import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import BackButton from '@renderer/components/backButton'
import { getChildByIdService, ChildResponse } from '../services/childService'
import { getDentistByIdService, DentistResponse } from '../services/dentistService'
import styles from '../styles/childDetail.module.css'
import ProfileAvatar from '@renderer/assets/images/profile-icon-9.png'

const ChildDetail: React.FC = () => {
  const { childId } = useParams<{ childId: string }>()
  const navigate = useNavigate()

  const [child, setChild] = useState<ChildResponse | null>(null)
  const [dentist, setDentist] = useState<DentistResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (childId) {
      loadChildData(parseInt(childId))
    } else {
      setError('ID de niño no proporcionado')
      setIsLoading(false)
    }
  }, [childId])

  const loadChildData = async (id: number): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)

      // Cargar datos del niño
      const childData = await getChildByIdService(id)
      setChild(childData)

      // Cargar datos del dentista si existe
      if (childData.dentistId) {
        try {
          const dentistData = await getDentistByIdService(childData.dentistId)
          setDentist(dentistData)
        } catch (dentistError) {
          console.warn('No se pudo cargar información del dentista:', dentistError)
          setDentist(null)
        }
      }
    } catch (error) {
      console.error('Error al cargar datos del niño:', error)
      setError(error instanceof Error ? error.message : 'Error al cargar la información del niño')
    } finally {
      setIsLoading(false)
    }
  }

  const calculateAge = (birthDateStr: string): number => {
    const birthDate = new Date(birthDateStr)
    const today = new Date()

    let age = today.getFullYear() - birthDate.getFullYear()

    if (
      today.getMonth() < birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
    ) {
      age--
    }

    return age
  }

  const formatAge = (birthDateStr: string): string => {
    const age = calculateAge(birthDateStr)
    return `${age} ${age === 1 ? 'año' : 'años'}`
  }

  const formatTime = (timeStr: string): string => {
    try {
      const [hours, minutes] = timeStr.split(':')
      const hour24 = parseInt(hours)
      const period = hour24 >= 12 ? 'PM' : 'AM'
      const hour12 = hour24 % 12 || 12
      return `${hour12}:${minutes} ${period}`
    } catch {
      return timeStr
    }
  }

  const formatBirthDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr)
      return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }).format(date)
    } catch {
      return dateStr
    }
  }

  const handleEdit = (): void => {
    // TODO: Implementar edición del niño
    alert('Función de editar próximamente')
  }

  const handleDelete = (): void => {
    if (confirm('¿Estás seguro de que deseas eliminar este niño?')) {
      // TODO: Implementar eliminación del niño
      alert('Función de eliminar próximamente')
    }
  }

  if (isLoading) {
    return <div className={styles.loading}>Cargando...</div>
  }

  if (!childId) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <BackButton />
        </div>
        <div className={styles.error}>ID de niño no proporcionado.</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <BackButton />
        </div>
        <div className={styles.error}>
          <p>Error: {error}</p>
          <button onClick={() => loadChildData(parseInt(childId))}>Reintentar</button>
        </div>
      </div>
    )
  }

  if (!child) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <BackButton />
        </div>
        <div className={styles.error}>Niño no encontrado.</div>
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
          <img src={ProfileAvatar} alt="Perfil del niño" className={styles.avatar} />
        </div>

        <div className={styles.profileInfo}>
          <h1 className={styles.name}>
            {child.name} {child.lastName}
          </h1>
          <p className={styles.age}>{formatAge(child.birthDate)}</p>
          <p className={styles.birthDate}>
            Fecha de nacimiento: {formatBirthDate(child.birthDate)}
          </p>
          <p className={styles.gender}>Género: {child.gender === 'M' ? 'Masculino' : 'Femenino'}</p>

          {dentist && (
            <p className={styles.dentistName}>
              Su odontólogo es el Dr. {dentist.name} {dentist.lastName}
            </p>
          )}
        </div>

        <div className={styles.actionSection}>
          <button className={styles.editButton} onClick={handleEdit}>
            Editar
          </button>
          <button className={styles.deleteButton} onClick={handleDelete}>
            Eliminar
          </button>
        </div>
      </div>

      {/* Información de horarios de cepillado */}
      <div className={styles.brushingScheduleSection}>
        <h2 className={styles.sectionTitle}>Horarios de cepillado</h2>
        <div className={styles.scheduleGrid}>
          <div className={styles.scheduleItem}>
            <span className={styles.scheduleLabel}>Cepillado matutino:</span>
            <span className={styles.scheduleTime}>{formatTime(child.morningBrushingTime)}</span>
          </div>
          <div className={styles.scheduleItem}>
            <span className={styles.scheduleLabel}>Cepillado vespertino:</span>
            <span className={styles.scheduleTime}>{formatTime(child.afternoonBrushingTime)}</span>
          </div>
          <div className={styles.scheduleItem}>
            <span className={styles.scheduleLabel}>Cepillado nocturno:</span>
            <span className={styles.scheduleTime}>{formatTime(child.nightBrushingTime)}</span>
          </div>
        </div>
      </div>

      {/* Sección de historias clínicas */}
      <div className={styles.clinicalHistorySection}>
        <h2 className={styles.sectionTitle}>Historias clínicas del hijo</h2>
        <div className={styles.historyPlaceholder}></div>
      </div>
    </div>
  )
}

export default ChildDetail
