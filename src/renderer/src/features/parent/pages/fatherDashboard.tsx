import { FC, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BrushingCard from '../components/brushingCard'
import WeeklyBrushingList from '../components/weeklyBrushingList'
import ChildCard from '../components/childCard'
import Modal from '../components/modal'
import AddChildForm from '../components/addChildForm'
import { getChildrenService, ChildResponse, ChildData } from '../services/childService'
import {
  getTodayBrushRecordsService,
  getWeeklyBrushRecordsService,
  createBrushRecordService,
  deleteBrushRecordService,
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

  useEffect(() => {
    const fetchInitialData = async (): Promise<void> => {
      try {
        setIsLoading(true)
        setError(null)

        const childrenData = await getChildrenService()
        setChildren(childrenData)

        if (childrenData.length > 0) {
          setSelectedChild(childrenData[0])

          // Cargar datos de cepillado para todos los hijos
          try {
            const brushingDataPromises = childrenData.map(async (child) => {
              const todayRecords = await getTodayBrushRecordsService(child.childId)
              const weeklyRecords = await getWeeklyBrushRecordsService(child.childId)

              return {
                childId: child.childId,
                data: {
                  todayBrushing: getBrushingStatusFromRecords(todayRecords),
                  weeklyBrushing: generateWeeklyBrushingFromRecords(weeklyRecords),
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

  const handleAddChild = async (data: ChildData): Promise<void> => {
    try {
      setIsCreatingChild(true)
      setAddChildError(null)

      const updatedChildren = await getChildrenService()
      setChildren(updatedChildren)

      const newChild = updatedChildren.find(
        (child) => child.name === data.name && child.lastName === data.lastName
      )

      if (newChild) {
        const todayRecords = await getTodayBrushRecordsService(newChild.childId)
        const weeklyRecords = await getWeeklyBrushRecordsService(newChild.childId)

        const newBrushingData: ChildBrushingData = {
          todayBrushing: getBrushingStatusFromRecords(todayRecords),
          weeklyBrushing: generateWeeklyBrushingFromRecords(weeklyRecords),
          todayRecords: todayRecords
        }

        setChildrenBrushingData({
          ...childrenBrushingData,
          [newChild.childId]: newBrushingData
        })

        setSelectedChild(newChild)
      } else {
        console.warn('No se encontró el nuevo hijo en la lista actualizada')
        if (updatedChildren.length > 0) {
          setSelectedChild(updatedChildren[0])
        }
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error al agregar hijo:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setAddChildError(`Error al agregar el hijo: ${errorMessage}`)

      throw error
    } finally {
      setIsCreatingChild(false)
    }
  }

  const getBrushingStatusFromRecords = (records: BrushRecord[]): BrushingStatus => {
    const morningCompleted = records.some((record) => {
      const hour = new Date(record.brushDatetime).getHours()
      return hour >= 6 && hour < 12
    })

    const afternoonCompleted = records.some((record) => {
      const hour = new Date(record.brushDatetime).getHours()
      return hour >= 12 && hour < 18
    })

    const nightCompleted = records.some((record) => {
      const hour = new Date(record.brushDatetime).getHours()
      return hour >= 18 || hour < 6
    })

    return {
      morning: morningCompleted ? 'completed' : 'pending',
      afternoon: afternoonCompleted ? 'completed' : 'pending',
      night: nightCompleted ? 'completed' : 'pending'
    }
  }

  const generateWeeklyBrushingFromRecords = (records: BrushRecord[]): DayBrushing[] => {
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

      const dayRecords = records.filter((record) => record.brushDatetime.startsWith(dayStr))

      const morningCompleted = dayRecords.some((record) => {
        const hour = new Date(record.brushDatetime).getHours()
        return hour >= 6 && hour < 12
      })

      const afternoonCompleted = dayRecords.some((record) => {
        const hour = new Date(record.brushDatetime).getHours()
        return hour >= 12 && hour < 18
      })

      const nightCompleted = dayRecords.some((record) => {
        const hour = new Date(record.brushDatetime).getHours()
        return hour >= 18 || hour < 6
      })

      days.push({
        date,
        status: {
          morning: morningCompleted ? 'completed' : 'pending',
          afternoon: afternoonCompleted ? 'completed' : 'pending',
          night: nightCompleted ? 'completed' : 'pending'
        }
      })
    }

    return days
  }

  const updateTodayBrushing = async (time: 'morning' | 'afternoon' | 'night'): Promise<void> => {
    if (!selectedChild) return

    const currentData = childrenBrushingData[selectedChild.childId]
    if (!currentData) return

    const currentStatus = currentData.todayBrushing[time]
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending'

    try {
      if (newStatus === 'completed') {
        const brushDatetime = new Date()
        if (time === 'morning') {
          brushDatetime.setHours(8, 0, 0)
        } else if (time === 'afternoon') {
          brushDatetime.setHours(14, 0, 0)
        } else {
          brushDatetime.setHours(20, 0, 0)
        }

        await createBrushRecordService(selectedChild.childId, brushDatetime.toISOString())
      } else {
        const recordToDelete = currentData.todayRecords.find((record) => {
          const hour = new Date(record.brushDatetime).getHours()
          if (time === 'morning') return hour >= 6 && hour < 12
          if (time === 'afternoon') return hour >= 12 && hour < 18
          if (time === 'night') return hour >= 18 || hour < 6
          return false
        })

        if (recordToDelete) {
          await deleteBrushRecordService(recordToDelete.brushId)
        }
      }

      // Recargar los datos de cepillado
      const todayRecords = await getTodayBrushRecordsService(selectedChild.childId)
      const weeklyRecords = await getWeeklyBrushRecordsService(selectedChild.childId)

      const updatedChildData: ChildBrushingData = {
        todayBrushing: getBrushingStatusFromRecords(todayRecords),
        weeklyBrushing: generateWeeklyBrushingFromRecords(weeklyRecords),
        todayRecords: todayRecords
      }

      setChildrenBrushingData({
        ...childrenBrushingData,
        [selectedChild.childId]: updatedChildData
      })
    } catch (error) {
      console.error('Error al actualizar estado de cepillado:', error)
      alert('Error al actualizar el estado de cepillado')
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
          <img src={ProfileAvatar} alt="Profile" className={styles.profileAvatar} />
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
        <AddChildForm onSubmit={handleAddChild} onCancel={handleCloseModal} />
      </Modal>
    </div>
  )
}

export default HomePage
