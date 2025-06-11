import { FC, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BrushingCard from '../components/brushingCard'
import WeeklyBrushingList from '../components/weeklyBrushingList'
import ChildCard from '../components/childCard'
import Modal from '../components/modal'
import AddChildForm from '../components/addChildForm'
import { useChildren } from '../hooks/useChildren'
import { useBrushing } from '../hooks/useBrushing'
import styles from '../styles/fatherDashboard.module.css'
import Clock from '@renderer/assets/icons/clock.svg'
import ClockActive from '@renderer/assets/icons/clock_active.svg'
import Children from '@renderer/assets/icons/children.svg'
import ChildrenActive from '@renderer/assets/icons/children_active.svg'
import Home from '@renderer/assets/icons/home.svg'
import HomeActive from '@renderer/assets/icons/home_active.svg'
import ProfileAvatar from '@renderer/assets/images/profile-icon-9.png'

const HomePage: FC = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<string>('inicio')
  const [addChildError, setAddChildError] = useState<string | null>(null)
  const [isCreatingChild, setIsCreatingChild] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Hooks personalizados
  const {
    children,
    selectedChild,
    isLoading,
    error,
    selectChild,
    updateChildrenAfterCreate
  } = useChildren()

  const {
    initializeChildBrushingState,
    loadBrushingStateFromRecords,
    getBrushingStatusFromState,
    generateWeeklyBrushingFromState,
    updateTodayBrushing
  } = useBrushing()

  // Inicializar estado de cepillado cuando cambia el hijo seleccionado
  useEffect(() => {
    if (selectedChild) {
      initializeChildBrushingState(selectedChild.childId)
      loadBrushingStateFromRecords(selectedChild.childId)
    }
  }, [selectedChild, initializeChildBrushingState, loadBrushingStateFromRecords])

  // Inicializar estado de cepillado para todos los hijos
  useEffect(() => {
    if (children.length > 0) {
      children.forEach((child) => {
        initializeChildBrushingState(child.childId)
        loadBrushingStateFromRecords(child.childId)
      })
    }
  }, [children, initializeChildBrushingState, loadBrushingStateFromRecords])

  const handleChildCreated = async (): Promise<void> => {
    try {
      setIsCreatingChild(true)
      setAddChildError(null)
      await updateChildrenAfterCreate()
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error al actualizar datos después de crear hijo:', error)
      setAddChildError('Error al actualizar los datos. Por favor, recarga la página.')
    } finally {
      setIsCreatingChild(false)
    }
  }

  const handleBrushingToggle = async (time: 'morning' | 'afternoon' | 'night'): Promise<void> => {
    if (!selectedChild) return

    try {
      await updateTodayBrushing(selectedChild.childId, time)
    } catch (error) {
      alert(
        'Error al actualizar el estado de cepillado: ' +
          (error instanceof Error ? error.message : 'Error desconocido')
      )
    }
  }

  const handleNavClick = (tab: string): void => {
    const routes = {
      citas: '/appointmentFather',
      hijos: '/children',
      inicio: '/fatherDashboard'
    }
    
    if (routes[tab as keyof typeof routes]) {
      navigate(routes[tab as keyof typeof routes])
    }
    setActiveTab(tab)
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

  const handleChildSelection = async (child: typeof selectedChild): Promise<void> => {
    if (child) {
      selectChild(child)
    }
  }

  // Estados de cepillado del hijo seleccionado
  const todayBrushing = selectedChild 
    ? getBrushingStatusFromState(selectedChild.childId)
    : { morning: 'pending' as const, afternoon: 'pending' as const, night: 'pending' as const }

  const weeklyBrushing = selectedChild 
    ? generateWeeklyBrushingFromState(selectedChild.childId)
    : []

  if (isLoading) {
    return <div className={styles.loading}>Cargando...</div>
  }

  if (error) {
    return (
      <div className={styles.homePage}>
        <div className={styles.error}>
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.homePage}>
      <div className={styles.header}>
        <div className={styles.profileSection}>
          <img
            src={ProfileAvatar}
            alt="Profile"
            className={styles.profileAvatar}
            onClick={() => navigate('/profile-selection')}
            style={{ cursor: 'pointer' }}
          />
          <h1 className={styles.title}>Seguimiento dental familiar</h1>
        </div>
      </div>

      <div className={styles.mainContent}>
        {/* Sección de hijos */}
        <div className={styles.childrenSection}>
          <div className={styles.childrenCards}>
            {children.map((child) => (
              <ChildCard
                key={child.childId}
                child={child}
                isSelected={selectedChild?.childId === child.childId}
                onClick={() => handleChildSelection(child)}
                formatAge={formatAge}
              />
            ))}

            <button
              className={styles.addChildButton}
              onClick={() => setIsModalOpen(true)}
              disabled={isCreatingChild}
            >
              <span className={styles.plusIcon}>+</span>
              <span>{isCreatingChild ? 'Agregando...' : 'Agregar Hijo'}</span>
            </button>
          </div>
        </div>

        {/* Error de agregar hijo */}
        {addChildError && (
          <div className={styles.error}>
            <p>{addChildError}</p>
            <button onClick={() => setAddChildError(null)}>Cerrar</button>
          </div>
        )}

        {/* Sección de cepillado */}
        {selectedChild && (
          <>
            <div className={styles.brushingSection}>
              <h2 className={styles.sectionTitle}>Cepillado de {selectedChild.name}</h2>
              <p className={styles.sectionSubtitle}>
                Hoy {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
              </p>
              <div className={styles.brushingCards}>
                <BrushingCard
                  time="morning"
                  schedule={selectedChild.morningBrushingTime}
                  status={todayBrushing.morning}
                  label="Mañana"
                  onStatusToggle={() => handleBrushingToggle('morning')}
                />
                <BrushingCard
                  time="afternoon"
                  schedule={selectedChild.afternoonBrushingTime}
                  status={todayBrushing.afternoon}
                  label="Tarde"
                  onStatusToggle={() => handleBrushingToggle('afternoon')}
                />
                <BrushingCard
                  time="night"
                  schedule={selectedChild.nightBrushingTime}
                  status={todayBrushing.night}
                  label="Noche"
                  onStatusToggle={() => handleBrushingToggle('night')}
                />
              </div>
            </div>
            <div className={styles.weeklyBrushing}>
              <h3 className={styles.weeklyTitle}>Esta semana se ha cepillado:</h3>
              <WeeklyBrushingList days={weeklyBrushing} />
            </div>
          </>
        )}
      </div>

      {/* Navegación inferior */}
      <nav className={styles.bottomNav}>
        {[
          { key: 'inicio', icon: Home, activeIcon: HomeActive, label: 'Inicio' },
          { key: 'citas', icon: Clock, activeIcon: ClockActive, label: 'Citas' },
          { key: 'hijos', icon: Children, activeIcon: ChildrenActive, label: 'Hijos' }
        ].map(({ key, icon, activeIcon, label }) => (
          <div
            key={key}
            className={`${styles.navLink} ${activeTab === key ? styles.active : ''}`}
            onClick={() => handleNavClick(key)}
          >
            <div className={styles.navIcon}>
              <img
                src={activeTab === key ? activeIcon : icon}
                alt={label}
                className={styles.navImage}
              />
            </div>
            <span>{label}</span>
          </div>
        ))}
      </nav>

      {/* Modal para agregar hijo */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Danos a conocer un poco más sobre tu hijo"
      >
        <AddChildForm 
          onCancel={() => setIsModalOpen(false)} 
          onSuccess={handleChildCreated} 
        />
      </Modal>
    </div>
  )
}

export default HomePage