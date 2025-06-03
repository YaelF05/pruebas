import React, { useState, useEffect } from 'react'
import { getChildrenService, ChildResponse } from '../services/childService'
import { useNavigate } from 'react-router-dom'
import BackButton from '@renderer/components/backButton'
import ChildCard from '../components/childCard'
import Modal from '../components/modal'
import AddChildForm from '../components/addChildForm'
import styles from '../styles/formFather.module.css'

const FormularioPadre: React.FC = () => {
  const [children, setChildren] = useState<ChildResponse[]>([])
  const [selectedChild, setSelectedChild] = useState<ChildResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [addChildError, setAddChildError] = useState<string | null>(null)
  const [isCreatingChild, setIsCreatingChild] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchChildren = async (): Promise<void> => {
      try {
        setIsLoading(true)
        setError(null)

        const childrenData = await getChildrenService()
        setChildren(childrenData)

        if (childrenData.length > 0) {
          setSelectedChild(childrenData[0])
        }
      } catch (error) {
        console.error('Error al cargar hijos:', error)
        setError(error instanceof Error ? error.message : 'Error al cargar los datos')
      } finally {
        setIsLoading(false)
      }
    }

    fetchChildren()
  }, [])

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

  const handleChildCreated = async (): Promise<void> => {
    try {
      setIsCreatingChild(true)
      setAddChildError(null)

      const updatedChildren = await getChildrenService()
      setChildren(updatedChildren)

      if (updatedChildren.length > 0) {
        const lastChild = updatedChildren[updatedChildren.length - 1]
        setSelectedChild(lastChild)
      }

      setIsModalOpen(false)
    } catch (error) {
      console.error('Error al actualizar datos después de crear hijo:', error)
      setAddChildError('Error al actualizar los datos. Por favor, recarga la página.')
    } finally {
      setIsCreatingChild(false)
    }
  }

  const handleOpenModal = (): void => {
    setAddChildError(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = (): void => {
    setAddChildError(null)
    setIsModalOpen(false)
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <BackButton />
        <div className={styles.loading}>Cargando...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <BackButton />
        <div className={styles.error}>
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <BackButton />
        <h1 className={styles.title}>
          Estamos casi listos. Solo falta agregar a tus hijos para personalizar la experiencia
        </h1>

        <div className={styles.childrenSection}>
          <div className={styles.childrenCards}>
            {children.map((child) => (
              <ChildCard
                key={child.childId}
                child={child}
                isSelected={selectedChild?.childId === child.childId}
                onClick={() => setSelectedChild(child)}
                formatAge={formatAge}
              />
            ))}

            <button
              className={styles.addChildButton}
              onClick={handleOpenModal}
              disabled={isCreatingChild}
            >
              <span className={styles.plusIcon}>+</span>
              <span>{isCreatingChild ? 'Agregando...' : 'Agregar Hijo'}</span>
            </button>
          </div>
        </div>

        {addChildError && (
          <div className={styles.error}>
            <p>{addChildError}</p>
            <button onClick={() => setAddChildError(null)}>Cerrar</button>
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title="Danos a conocer un poco más sobre tu hijo"
        >
          <AddChildForm onCancel={handleCloseModal} onSuccess={handleChildCreated} />
        </Modal>
        <button
          onClick={() => {
            navigate('/fatherDashboard')
          }}
          className={styles.button}
        >
          Continuar
        </button>
      </div>
    </div>
  )
}

export default FormularioPadre
