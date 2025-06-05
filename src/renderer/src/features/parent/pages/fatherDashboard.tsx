import { FC, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BrushingCard from '../components/brushingCard'
import WeeklyBrushingList from '../components/weeklyBrushingList'
import ChildCard from '../components/childCard'
import Modal from '../components/modal'
import AddChildForm from '../components/addChildForm'
import { getChildrenService, ChildResponse } from '../services/childService'
import {
  getTodayBrushRecordsService,
  getWeeklyBrushRecordsService,
  createBrushRecordService,
  BrushRecord
} from '../services/brushService'
import styles from '../styles/fatherDashboard.module.css'
import Clock from '@renderer/assets/icons/clock.svg'
import ClockActive from '@renderer/assets/icons/clock_active.svg'
import Children from '@renderer/assets/icons/children.svg'
import ChildrenActive from '@renderer/assets/icons/children_active.svg'
import Home from '@renderer/assets/icons/home.svg'
import HomeActive from '@renderer/assets/icons/home_active.svg'
import ProfileAvatar from '@renderer/assets/images/profile-icon-9.png'

interface BrushingStatus {
  morning: 'pending' | 'completed'
  afternoon: 'pending' | 'completed'
  night: 'pending' | 'completed'
}

interface DayBrushing {
  date: Date
  status: BrushingStatus
}

interface ChildBrushingData {
  todayBrushing: BrushingStatus
  weeklyBrushing: DayBrushing[]
  todayRecords: BrushRecord[]
}

const HomePage: FC = () => {
  const navigate = useNavigate()

  const [children, setChildren] = useState<ChildResponse[]>([])
  const [selectedChild, setSelectedChild] = useState<ChildResponse | null>(null)
  const [activeTab, setActiveTab] = useState<string>('inicio')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addChildError, setAddChildError] = useState<string | null>(null)
  const [isCreatingChild, setIsCreatingChild] = useState(false)

  const [childrenBrushingData, setChildrenBrushingData] = useState<{
    [key: number]: ChildBrushingData
  }>({})

  const [isModalOpen, setIsModalOpen] = useState(false)

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  const isTimeNear = (
    recordTime: string,
    scheduledTime: string,
    toleranceMinutes: number = 120
  ): boolean => {
    const recordMinutes = timeToMinutes(recordTime)
    const scheduledMinutes = timeToMinutes(scheduledTime)
    return Math.abs(recordMinutes - scheduledMinutes) <= toleranceMinutes
  }

  const determineBrushType = (
    recordDatetime: string,
    child: ChildResponse
  ): 'morning' | 'afternoon' | 'night' | null => {
    const recordTime = new Date(recordDatetime).toTimeString().slice(0, 5)

    if (isTimeNear(recordTime, child.morningBrushingTime, 120)) {
      return 'morning'
    }
    if (isTimeNear(recordTime, child.afternoonBrushingTime, 120)) {
      return 'afternoon'
    }
    if (isTimeNear(recordTime, child.nightBrushingTime, 120)) {
      return 'night'
    }

    return null
  }

  const getBrushingStatusFromRecords = (
    records: BrushRecord[],
    child: ChildResponse
  ): BrushingStatus => {
    const today = new Date().toISOString().split('T')[0]

    const todayRecords = records.filter((record) => {
      const recordDate = new Date(record.brushDatetime).toISOString().split('T')[0]
      return recordDate === today
    })

    const completedTypes = new Set<string>()

    todayRecords.forEach((record) => {
      const brushType = determineBrushType(record.brushDatetime, child)
      if (brushType) {
        completedTypes.add(brushType)
      }
    })

    return {
      morning: completedTypes.has('morning') ? 'completed' : 'pending',
      afternoon: completedTypes.has('afternoon') ? 'completed' : 'pending',
      night: completedTypes.has('night') ? 'completed' : 'pending'
    }
  }

  const generateWeeklyBrushingFromRecords = (
    records: BrushRecord[],
    child: ChildResponse
  ): DayBrushing[] => {
    const days: DayBrushing[] = []
    const today = new Date()

    const firstDayOfWeek = new Date(today)
    const dayOfWeek = today.getDay()
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
    firstDayOfWeek.setDate(diff)

    for (let i = 0; i < 7; i++) {
      const date = new Date(firstDayOfWeek)
      date.setDate(firstDayOfWeek.getDate() + i)
      const dayStr = date.toISOString().substring(0, 10)

      const dayRecords = records.filter((record) => {
        const recordDate = new Date(record.brushDatetime).toISOString().substring(0, 10)
        return recordDate === dayStr
      })

      const completedTypes = new Set<string>()

      dayRecords.forEach((record) => {
        const brushType = determineBrushType(record.brushDatetime, child)
        if (brushType) {
          completedTypes.add(brushType)
        }
      })

      days.push({
        date,
        status: {
          morning: completedTypes.has('morning') ? 'completed' : 'pending',
          afternoon: completedTypes.has('afternoon') ? 'completed' : 'pending',
          night: completedTypes.has('night') ? 'completed' : 'pending'
        }
      })
    }

    return days
  }

  useEffect(() => {
    const fetchInitialData = async (): Promise<void> => {
      try {
        setIsLoading(true)
        setError(null)

        const childrenData = await getChildrenService()
        setChildren(childrenData)

        if (childrenData.length > 0) {
          setSelectedChild(childrenData[0])

          try {
            const brushingDataPromises = childrenData.map(async (child) => {
              const todayRecords = await getTodayBrushRecordsService(child.childId)
              const weeklyRecords = await getWeeklyBrushRecordsService(child.childId)

              return {
                childId: child.childId,
                data: {
                  todayBrushing: getBrushingStatusFromRecords(todayRecords, child),
                  weeklyBrushing: generateWeeklyBrushingFromRecords(weeklyRecords, child),
                  todayRecords: todayRecords
                }
              }
            })

            const brushingResults = await Promise.all(brushingDataPromises)
            const brushingData: { [key: number]: ChildBrushingData } = {}

            brushingResults.forEach((result) => {
              brushingData[result.childId] = result.data
            })

            setChildrenBrushingData(brushingData)
          } catch (error) {
            console.error('Error al cargar datos de cepillado:', error)
          }
        }
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error)
        setError(error instanceof Error ? error.message : 'Error al cargar los datos')
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialData()
  }, [])

  const handleChildCreated = async (): Promise<void> => {
    try {
      setIsCreatingChild(true)
      setAddChildError(null)

      const updatedChildren = await getChildrenService()
      setChildren(updatedChildren)

      if (updatedChildren.length > 0) {
        const lastChild = updatedChildren[updatedChildren.length - 1]
        setSelectedChild(lastChild)

        const todayRecords = await getTodayBrushRecordsService(lastChild.childId)
        const weeklyRecords = await getWeeklyBrushRecordsService(lastChild.childId)

        const newBrushingData: ChildBrushingData = {
          todayBrushing: getBrushingStatusFromRecords(todayRecords, lastChild),
          weeklyBrushing: generateWeeklyBrushingFromRecords(weeklyRecords, lastChild),
          todayRecords: todayRecords
        }

        setChildrenBrushingData((prev) => ({
          ...prev,
          [lastChild.childId]: newBrushingData
        }))
      }

      setIsModalOpen(false)
    } catch (error) {
      console.error('Error al actualizar datos después de crear hijo:', error)
      setAddChildError('Error al actualizar los datos. Por favor, recarga la página.')
    } finally {
      setIsCreatingChild(false)
    }
  }

  const updateTodayBrushing = async (time: 'morning' | 'afternoon' | 'night'): Promise<void> => {
    if (!selectedChild) return

    const currentData = childrenBrushingData[selectedChild.childId]
    if (!currentData) return

    const currentStatus = currentData.todayBrushing[time]

    try {
      if (currentStatus === 'pending') {
        await createBrushRecordService(selectedChild.childId)

        const todayRecords = await getTodayBrushRecordsService(selectedChild.childId)
        const weeklyRecords = await getWeeklyBrushRecordsService(selectedChild.childId)

        const updatedChildData: ChildBrushingData = {
          todayBrushing: getBrushingStatusFromRecords(todayRecords, selectedChild),
          weeklyBrushing: generateWeeklyBrushingFromRecords(weeklyRecords, selectedChild),
          todayRecords: todayRecords
        }

        setChildrenBrushingData((prev) => ({
          ...prev,
          [selectedChild.childId]: updatedChildData
        }))
      }
    } catch (error) {
      console.error('Error al actualizar estado de cepillado:', error)
      alert(
        'Error al actualizar el estado de cepillado: ' +
          (error instanceof Error ? error.message : 'Error desconocido')
      )
    }
  }

  const handleNavClick = (tab: string): void => {
    if (tab === 'citas') {
      navigate('/appointmentFather')
    } else if (tab === 'hijos') {
      navigate('/children')
    } else if (tab === 'inicio') {
      navigate('/fatherDashboard')
    }
    setActiveTab(tab)
  }

  const handleProfileClick = (): void => {
    navigate('/profile-selection')
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

  const getCurrentChildBrushingData = (): ChildBrushingData => {
    if (!selectedChild || !childrenBrushingData[selectedChild.childId]) {
      return {
        todayBrushing: {
          morning: 'pending',
          afternoon: 'pending',
          night: 'pending'
        },
        weeklyBrushing: [],
        todayRecords: []
      }
    }
    return childrenBrushingData[selectedChild.childId]
  }

  const handleOpenModal = (): void => {
    setAddChildError(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = (): void => {
    setAddChildError(null)
    setIsModalOpen(false)
  }

  const currentBrushingData = getCurrentChildBrushingData()

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
            onClick={handleProfileClick}
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

        {/* Mostrar error de agregar hijo si existe */}
        {addChildError && (
          <div className={styles.error}>
            <p>{addChildError}</p>
            <button onClick={() => setAddChildError(null)}>Cerrar</button>
          </div>
        )}

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
                  status={currentBrushingData.todayBrushing.morning}
                  label="Mañana"
                  onStatusToggle={() => updateTodayBrushing('morning')}
                />
                <BrushingCard
                  time="afternoon"
                  schedule={selectedChild.afternoonBrushingTime}
                  status={currentBrushingData.todayBrushing.afternoon}
                  label="Tarde"
                  onStatusToggle={() => updateTodayBrushing('afternoon')}
                />
                <BrushingCard
                  time="night"
                  schedule={selectedChild.nightBrushingTime}
                  status={currentBrushingData.todayBrushing.night}
                  label="Noche"
                  onStatusToggle={() => updateTodayBrushing('night')}
                />
              </div>
            </div>
            <div className={styles.weeklyBrushing}>
              <h3 className={styles.weeklyTitle}>Esta semana se ha cepillado:</h3>
              <WeeklyBrushingList days={currentBrushingData.weeklyBrushing} />
            </div>
          </>
        )}
      </div>

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

      {/* Modal para agregar un nuevo hijo */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Danos a conocer un poco más sobre tu hijo"
      >
        <AddChildForm onCancel={handleCloseModal} onSuccess={handleChildCreated} />
      </Modal>
    </div>
  )
}

export default HomePage
