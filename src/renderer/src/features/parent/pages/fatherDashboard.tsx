import { FC, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BrushingCard from '../components/brushingCard'
import WeeklyBrushingList from '../components/weeklyBrushingList'
import ChildCard from '../components/childCard'
import Modal from '../components/modal'
import AddChildForm from '../components/addChildForm'
import { getChildrenService, ChildResponse } from '../services/childService'
import { getAppointmentsService, AppointmentResponse } from '../services/appointmentService'
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
  brushTypeMap: {
    morning: string[]
    afternoon: string[]
    night: string[]
  }
}

interface ChildBrushingState {
  [childId: number]: {
    [date: string]: {
      morning: boolean
      afternoon: boolean
      night: boolean
    }
  }
}

interface ChildWithNextAppointment extends ChildResponse {
  nextAppointment?: string | null
}

const HomePage: FC = () => {
  const navigate = useNavigate()

  const [children, setChildren] = useState<ChildWithNextAppointment[]>([])
  const [selectedChild, setSelectedChild] = useState<ChildWithNextAppointment | null>(null)
  const [activeTab, setActiveTab] = useState<string>('inicio')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addChildError, setAddChildError] = useState<string | null>(null)
  const [isCreatingChild, setIsCreatingChild] = useState(false)

  const [childrenBrushingData, setChildrenBrushingData] = useState<{
    [key: number]: ChildBrushingData
  }>({})

  const [manualBrushingState, setManualBrushingState] = useState<ChildBrushingState>({})

  const [isModalOpen, setIsModalOpen] = useState(false)

  const getDateString = (date: Date = new Date()): string => {
    return date.toISOString().split('T')[0]
  }

  const initializeChildBrushingState = (childId: number, date: string = getDateString()): void => {
    setManualBrushingState((prev) => ({
      ...prev,
      [childId]: {
        ...prev[childId],
        [date]: prev[childId]?.[date] || {
          morning: false,
          afternoon: false,
          night: false
        }
      }
    }))
  }

  const getBrushingStatusFromState = (
    childId: number,
    date: string = getDateString()
  ): BrushingStatus => {
    const state = manualBrushingState[childId]?.[date]

    if (!state) {
      return {
        morning: 'pending',
        afternoon: 'pending',
        night: 'pending'
      }
    }

    return {
      morning: state.morning ? 'completed' : 'pending',
      afternoon: state.afternoon ? 'completed' : 'pending',
      night: state.night ? 'completed' : 'pending'
    }
  }

  const generateWeeklyBrushingFromState = (childId: number): DayBrushing[] => {
    const days: DayBrushing[] = []
    const today = new Date()

    const firstDayOfWeek = new Date(today)
    const dayOfWeek = today.getDay()
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
    firstDayOfWeek.setDate(diff)

    for (let i = 0; i < 7; i++) {
      const date = new Date(firstDayOfWeek)
      date.setDate(firstDayOfWeek.getDate() + i)
      const dayStr = getDateString(date)

      const status = getBrushingStatusFromState(childId, dayStr)

      days.push({
        date,
        status
      })
    }

    return days
  }

  const loadBrushingStateFromRecords = async (childId: number): Promise<void> => {
    try {
      const weeklyRecords = await getWeeklyBrushRecordsService(childId)

      const recordsByDate: { [date: string]: BrushRecord[] } = {}
      weeklyRecords.forEach((record) => {
        const recordDate = getDateString(new Date(record.brushDatetime))
        if (!recordsByDate[recordDate]) {
          recordsByDate[recordDate] = []
        }
        recordsByDate[recordDate].push(record)
      })

      const today = new Date()
      const firstDayOfWeek = new Date(today)
      const dayOfWeek = today.getDay()
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
      firstDayOfWeek.setDate(diff)

      const newState: { [date: string]: { morning: boolean; afternoon: boolean; night: boolean } } =
        {}

      for (let i = 0; i < 7; i++) {
        const date = new Date(firstDayOfWeek)
        date.setDate(firstDayOfWeek.getDate() + i)
        const dayStr = getDateString(date)

        const dayRecords = recordsByDate[dayStr] || []

        newState[dayStr] = {
          morning: dayRecords.length >= 1,
          afternoon: dayRecords.length >= 2,
          night: dayRecords.length >= 3
        }
      }

      setManualBrushingState((prev) => ({
        ...prev,
        [childId]: {
          ...prev[childId],
          ...newState
        }
      }))
    } catch (error) {
      console.error('Error al cargar estado de cepillado:', error)
    }
  }

  const getNextAppointmentForChild = (
    childId: number,
    appointments: AppointmentResponse[]
  ): string | null => {
    const now = new Date()

    const futureAppointments = appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.appointmentDatetime)
      return appointment.childId === childId && appointment.isActive && appointmentDate > now
    })

    if (futureAppointments.length === 0) {
      return null
    }

    const sortedAppointments = futureAppointments.sort((a, b) => {
      const dateA = new Date(a.appointmentDatetime)
      const dateB = new Date(b.appointmentDatetime)
      return dateA.getTime() - dateB.getTime()
    })

    return sortedAppointments[0].appointmentDatetime
  }

  const loadChildrenWithAppointments = async (): Promise<ChildWithNextAppointment[]> => {
    try {
      const [childrenData, appointmentsData] = await Promise.all([
        getChildrenService(),
        getAppointmentsService(1, 100).catch(() => [])
      ])

      const childrenWithAppointments: ChildWithNextAppointment[] = childrenData.map((child) => ({
        ...child,
        nextAppointment: getNextAppointmentForChild(child.childId, appointmentsData)
      }))

      return childrenWithAppointments
    } catch (error) {
      console.error('Error al cargar niños con citas:', error)
      const childrenData = await getChildrenService()
      return childrenData.map((child) => ({
        ...child,
        nextAppointment: null
      }))
    }
  }

  useEffect(() => {
    const fetchInitialData = async (): Promise<void> => {
      try {
        setIsLoading(true)
        setError(null)

        const childrenWithAppointments = await loadChildrenWithAppointments()
        setChildren(childrenWithAppointments)

        if (childrenWithAppointments.length > 0) {
          setSelectedChild(childrenWithAppointments[0])

          for (const child of childrenWithAppointments) {
            initializeChildBrushingState(child.childId)
            await loadBrushingStateFromRecords(child.childId)
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

  useEffect(() => {
    if (!selectedChild) return

    const updateChildBrushingData = (): void => {
      const todayStr = getDateString()
      const todayBrushing = getBrushingStatusFromState(selectedChild.childId, todayStr)
      const weeklyBrushing = generateWeeklyBrushingFromState(selectedChild.childId)

      setChildrenBrushingData((prev) => ({
        ...prev,
        [selectedChild.childId]: {
          todayBrushing,
          weeklyBrushing,
          todayRecords: prev[selectedChild.childId]?.todayRecords || [],
          brushTypeMap: prev[selectedChild.childId]?.brushTypeMap || {
            morning: [],
            afternoon: [],
            night: []
          }
        }
      }))
    }

    updateChildBrushingData()
  }, [manualBrushingState, selectedChild])

  const handleChildCreated = async (): Promise<void> => {
    try {
      setIsCreatingChild(true)
      setAddChildError(null)

      const updatedChildrenWithAppointments = await loadChildrenWithAppointments()
      setChildren(updatedChildrenWithAppointments)

      if (updatedChildrenWithAppointments.length > 0) {
        const lastChild =
          updatedChildrenWithAppointments[updatedChildrenWithAppointments.length - 1]
        setSelectedChild(lastChild)

        initializeChildBrushingState(lastChild.childId)
        await loadBrushingStateFromRecords(lastChild.childId)
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

    const todayStr = getDateString()
    const currentState = manualBrushingState[selectedChild.childId]?.[todayStr]?.[time]

    try {
      if (!currentState) {
        setManualBrushingState((prev) => ({
          ...prev,
          [selectedChild.childId]: {
            ...prev[selectedChild.childId],
            [todayStr]: {
              ...prev[selectedChild.childId]?.[todayStr],
              [time]: true
            }
          }
        }))

        await createBrushRecordService(selectedChild.childId)

        try {
          const todayRecords = await getTodayBrushRecordsService(selectedChild.childId)
          setChildrenBrushingData((prev) => ({
            ...prev,
            [selectedChild.childId]: {
              ...prev[selectedChild.childId],
              todayRecords
            }
          }))
        } catch (recordError) {
          console.warn('Error al actualizar registros del día:', recordError)
        }
      }
    } catch (error) {
      console.error('Error al actualizar estado de cepillado:', error)

      setManualBrushingState((prev) => ({
        ...prev,
        [selectedChild.childId]: {
          ...prev[selectedChild.childId],
          [todayStr]: {
            ...prev[selectedChild.childId]?.[todayStr],
            [time]: false
          }
        }
      }))

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
        todayRecords: [],
        brushTypeMap: {
          morning: [],
          afternoon: [],
          night: []
        }
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

  const handleChildSelection = async (child: ChildWithNextAppointment): Promise<void> => {
    setSelectedChild(child)

    if (!manualBrushingState[child.childId]) {
      initializeChildBrushingState(child.childId)
      await loadBrushingStateFromRecords(child.childId)
    }
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
                onClick={() => handleChildSelection(child)}
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
