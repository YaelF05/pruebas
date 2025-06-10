import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import BackButton from '@renderer/components/backButton'
import Modal from '../components/modal'
import EditChildForm from '../components/editChildForm'
import EditSuccess from '../components/editSuccess'
import { getChildByIdService, ChildResponse } from '../services/childService'
import { getDentistByIdService, DentistResponse } from '../services/dentistService'
import styles from '../styles/childDetail.module.css'
import ProfileAvatar from '@renderer/assets/images/profile-icon-9.png'

const ChildDetail: React.FC = () => {
  const { childId } = useParams<{ childId: string }>()

  const [child, setChild] = useState<ChildResponse | null>(null)
  const [dentist, setDentist] = useState<DentistResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [updatedFields, setUpdatedFields] = useState<string[]>([])

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

      const childData = await getChildByIdService(id)
      setChild(childData)

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
    return `${age} ${age === 1 ? 'año' : 'años'} de edad`
  }

  const formatTime = (timeStr: string): string => {
    try {
      const [hours] = timeStr.split(':')
      const hour24 = parseInt(hours)
      const period = hour24 >= 12 ? 'pm' : 'am'
      const hour12 = hour24 % 12 || 12
      return `${hour12} ${period}`
    } catch {
      return timeStr
    }
  }

  const handleEdit = (): void => {
    setIsEditModalOpen(true)
  }

  const handleEditCancel = (): void => {
    setIsEditModalOpen(false)
  }

  const handleEditSuccess = async (updatedFieldNames: string[]): Promise<void> => {
    setUpdatedFields(updatedFieldNames)
    setIsEditModalOpen(false)
    setIsSuccessModalOpen(true)

    if (childId) {
      await loadChildData(parseInt(childId))
    }
  }

  const handleSuccessContinue = (): void => {
    setIsSuccessModalOpen(false)
    setUpdatedFields([])
  }

  /*
  const handleDelete = (): void => {
    if (confirm('¿Estás seguro de que deseas eliminar este niño?')) {
      alert('Función de eliminar')
    }
  }
  */

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
        <div className={styles.actionButtons}>
          <button className={styles.editButton} onClick={handleEdit}>
            Editar
          </button>
        </div>
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

          <p className={styles.scheduleText}>
            Cepillados: {formatTime(child.morningBrushingTime)},{' '}
            {formatTime(child.afternoonBrushingTime)} y {formatTime(child.nightBrushingTime)}
          </p>

          {dentist && (
            <p className={styles.dentistName}>
              Su odontólogo es el Dr. {dentist.name} {dentist.lastName}
            </p>
          )}
        </div>
      </div>

      {/* Sección de historias clínicas */}
      <div className={styles.clinicalHistorySection}>
        <h2 className={styles.sectionTitle}>Historias clínicas del hijo</h2>
        <div className={styles.searchBar}>
          <input type="text" placeholder="Buscar fecha" className={styles.searchInput} />
        </div>
        <div className={styles.appointmentCards}>
          {/* Espacio para las citas - se llenará dinámicamente */}
        </div>
      </div>

      {/* Modal de edición */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleEditCancel}
        title={`Editar datos de ${child.name}`}
      >
        <EditChildForm child={child} onCancel={handleEditCancel} onSuccess={handleEditSuccess} />
      </Modal>

      {/* Modal de éxito */}
      <EditSuccess
        isOpen={isSuccessModalOpen}
        onContinue={handleSuccessContinue}
        updatedFields={updatedFields}
        childName={child.name}
      />
    </div>
  )
}

export default ChildDetail
