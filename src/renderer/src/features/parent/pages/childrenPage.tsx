import { FC, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getChildrenService, ChildResponse } from '../services/childService'
import styles from '../styles/childrenPage.module.css'
import ProfileAvatar from '@renderer/assets/images/profile-icon-9.png'
import Clock from '@renderer/assets/icons/clock.svg'
import ClockActive from '@renderer/assets/icons/clock_active.svg'
import Children from '@renderer/assets/icons/children.svg'
import ChildrenActive from '@renderer/assets/icons/children_active.svg'
import Home from '@renderer/assets/icons/home.svg'
import HomeActive from '@renderer/assets/icons/home_active.svg'

const ChildrenPage: FC = () => {
  const navigate = useNavigate()
  const [children, setChildren] = useState<ChildResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>('hijos')

  useEffect(() => {
    loadChildren()
  }, [])

  const loadChildren = async (): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)
      const childrenData = await getChildrenService()
      setChildren(childrenData)
    } catch (error) {
      console.error('Error al cargar hijos:', error)
      setError(error instanceof Error ? error.message : 'Error al cargar los hijos')
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

  const handleNavClick = (tab: string): void => {
    if (tab === 'inicio') {
      navigate('/fatherDashboard')
    } else if (tab === 'citas') {
      navigate('/appointmentFather')
    }
    setActiveTab(tab)
  }

  const handleChildClick = (child: ChildResponse): void => {
    navigate(`/child/${child.childId}`)
  }

  const handleProfileClick = (): void => {
    navigate('/profile-selection')
  }

  if (isLoading) {
    return <div className={styles.loading}>Cargando...</div>
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.error}>
          <p>Error: {error}</p>
          <button onClick={loadChildren} className={styles.retryButton}>
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.childrenPage}>
      {/* Header con imagen de perfil del padre */}
      <div className={styles.header}>
        <div className={styles.profileSection}>
          <div className={styles.profileImageContainer}>
            <img
              src={ProfileAvatar}
              alt="Profile"
              className={styles.profileAvatar}
              onClick={handleProfileClick}
              style={{ cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className={styles.mainContent}>
        <h1 className={styles.title}>Tus hijos</h1>

        {children.length === 0 ? (
          <div className={styles.noChildrenMessage}>
            <p>Aún no tienes hijos registrados</p>
            <button
              className={styles.addFirstChildButton}
              onClick={() => navigate('/fatherDashboard')}
            >
              Agregar primer hijo
            </button>
          </div>
        ) : (
          <div className={styles.childrenGrid}>
            {children.map((child) => (
              <div
                key={child.childId}
                className={styles.childCard}
                onClick={() => handleChildClick(child)}
              >
                <div className={styles.childImageContainer}>
                  <img
                    src={ProfileAvatar}
                    alt={`Perfil de ${child.name}`}
                    className={styles.childAvatar}
                  />
                </div>
                <div className={styles.childInfo}>
                  <h3 className={styles.childName}>
                    {child.name} {child.lastName}
                  </h3>
                  <p className={styles.childAge}>{formatAge(child.birthDate)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navegación inferior */}
      <nav className={styles.bottomNav}>
        <div
          className={`${styles.navLink} ${activeTab === 'inicio' ? styles.active : ''}`}
          onClick={() => handleNavClick('inicio')}
        >
          <div className={styles.navIcon}>
            <img
              src={activeTab === 'inicio' ? HomeActive : Home}
              alt="Home"
              className={styles.navImage}
            />
          </div>
          <span>Inicio</span>
        </div>

        <div
          className={`${styles.navLink} ${activeTab === 'citas' ? styles.active : ''}`}
          onClick={() => handleNavClick('citas')}
        >
          <div className={styles.navIcon}>
            <img
              src={activeTab === 'citas' ? ClockActive : Clock}
              alt="Clock"
              className={styles.navImage}
            />
          </div>
          <span>Citas</span>
        </div>

        <div
          className={`${styles.navLink} ${activeTab === 'hijos' ? styles.active : ''}`}
          onClick={() => handleNavClick('hijos')}
        >
          <div className={styles.navIcon}>
            <img
              src={activeTab === 'hijos' ? ChildrenActive : Children}
              alt="Children"
              className={styles.navImage}
            />
          </div>
          <span>Hijos</span>
        </div>
      </nav>
    </div>
  )
}

export default ChildrenPage
