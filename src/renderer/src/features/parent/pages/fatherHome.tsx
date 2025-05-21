import { FC, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BrushingCard from '../components/brushingCard'
import WeeklyBrushingList from '../components/weeklyBrushingList'
import ChildCard from '../components/childCard'
import styles from '../styles/fatherHome.module.css'
import Modal from '../components/modal'
import AddChildForm from '../components/addChildForm'
import Clock from '@renderer/assets/icons/clock.png'
import ClockActive from '@renderer/assets/icons/clock-active.png'
import Children from '@renderer/assets/icons/children.png'
import ChildrenActive from '@renderer/assets/icons/children-active.png'
import Home from '@renderer/assets/icons/home.png'
import HomeActive from '@renderer/assets/icons/home-active.png'
import ProfileAvatar from '@renderer/assets/images/profile-icon-9.png'

interface Child {
  childId: number
  name: string
  lastName?: string
  birthDate: string
  morningBrushingTime: string
  afternoonBrushingTime: string
  nightBrushingTime: string
  nextAppointment: string | null
}

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
}

interface Dentist {
  userId: number
  name: string
}

const HomePage: FC = () => {
  const navigate = useNavigate()

  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [activeTab, setActiveTab] = useState<string>('inicio')
  const [isLoading, setIsLoading] = useState(true)

  const [childrenBrushingData, setChildrenBrushingData] = useState<{
    [key: number]: ChildBrushingData
  }>({})

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [dentists, setDentists] = useState<Dentist[]>([])

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true)

        const childrenData = await fetchChildren()

        setChildren(childrenData)
        if (childrenData.length > 0) {
          setSelectedChild(childrenData[0])
        }

        // Cargar datos de cepillado de cada hijo
        const brushingData = await fetchChildrenBrushingData(childrenData)
        setChildrenBrushingData(brushingData)

        const dentistsData = await fetchDentists()
        setDentists(dentistsData)
      } catch (error) {
        console.error('Error al cargar datos:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const fetchDentists = async () => {
    return [
      { userId: 1, name: 'Dr. María Pérez' },
      { userId: 2, name: 'Dr. Juan García' },
      { userId: 3, name: 'Dra. Ana López' }
    ]
  }

  //
  const fetchChildren = async (): Promise<Child[]> => {
    // Datos prueba
    return [
      {
        childId: 1,
        name: 'Jhon',
        lastName: 'Doe',
        birthDate: '2020-05-05T00:00:00',
        morningBrushingTime: '08:00',
        afternoonBrushingTime: '14:00',
        nightBrushingTime: '20:00',
        nextAppointment: '2025-05-06T10:00:00'
      }
    ]
  }

  const fetchChildrenBrushingData = async (
    children: Child[]
  ): Promise<{ [key: number]: ChildBrushingData }> => {
    const brushRecords = await fetchBrushRecords()

    const initialData: { [key: number]: ChildBrushingData } = {}

    for (const child of children) {
      // registro de cepillado del chamaco
      initialData[child.childId] = {
        todayBrushing: getBrushingStatusForToday(brushRecords, child.childId),
        weeklyBrushing: generateWeeklyBrushing(brushRecords, child.childId)
      }
    }

    return initialData
  }

  // modificar para que se guarde la info
  const fetchBrushRecords = async () => {
    return [
      {
        brushId: 1,
        childId: 1,
        brushDateTime: new Date().toISOString().substring(0, 10) + 'T08:30:00'
      }
    ]
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getBrushingStatusForToday = (brushRecords: any[], childId: number): BrushingStatus => {
    const today = new Date().toISOString().substring(0, 10)

    const todayRecords = brushRecords.filter(
      (record) => record.childId === childId && record.brushDateTime.startsWith(today)
    )

    const morningCompleted = todayRecords.some((record) => {
      const hour = new Date(record.brushDateTime).getHours()
      return hour >= 6 && hour < 12
    })

    const afternoonCompleted = todayRecords.some((record) => {
      const hour = new Date(record.brushDateTime).getHours()
      return hour >= 12 && hour < 18
    })

    const nightCompleted = todayRecords.some((record) => {
      const hour = new Date(record.brushDateTime).getHours()
      return hour >= 18 || hour < 24
    })

    return {
      morning: morningCompleted ? 'completed' : 'pending',
      afternoon: afternoonCompleted ? 'completed' : 'pending',
      night: nightCompleted ? 'completed' : 'pending'
    }
  }

  // Genera datos semanales basados en registros de cepillado
  const generateWeeklyBrushing = (brushRecords: any[], childId: number): DayBrushing[] => {
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

      const dayRecords = brushRecords.filter(
        (record) => record.childId === childId && record.brushDateTime.startsWith(dayStr)
      )

      // estado de cepillado para cada periodo
      const morningCompleted = dayRecords.some((record) => {
        const hour = new Date(record.brushDateTime).getHours()
        return hour >= 6 && hour < 12
      })

      const afternoonCompleted = dayRecords.some((record) => {
        const hour = new Date(record.brushDateTime).getHours()
        return hour >= 12 && hour < 18
      })

      const nightCompleted = dayRecords.some((record) => {
        const hour = new Date(record.brushDateTime).getHours()
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

  const updateTodayBrushing = async (time: 'morning' | 'afternoon' | 'night') => {
    if (!selectedChild) return

    const currentData = childrenBrushingData[selectedChild.childId]
    if (!currentData) return

    const currentStatus = currentData.todayBrushing[time]
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending'

    const newTodayBrushing = {
      ...currentData.todayBrushing,
      [time]: newStatus
    }

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

        await createBrushRecord(selectedChild.childId, brushDatetime.toISOString())
      } else {
        await deleteBrushRecord(selectedChild.childId, time)
      }

      const updatedChildData = {
        ...currentData,
        todayBrushing: newTodayBrushing
      }

      const today = new Date()
      const updatedWeeklyBrushing = currentData.weeklyBrushing.map((day) => {
        if (day.date.toDateString() === today.toDateString()) {
          return {
            ...day,
            status: newTodayBrushing
          }
        }
        return day
      })

      updatedChildData.weeklyBrushing = updatedWeeklyBrushing

      setChildrenBrushingData({
        ...childrenBrushingData,
        [selectedChild.childId]: updatedChildData
      })
    } catch (error) {
      console.error('Error al actualizar estado de cepillado:', error)
    }
  }

  const createBrushRecord = async (childId: number, brushDatetime: string) => {
    console.log(`Creando registro de cepillado para niño ${childId} en ${brushDatetime}`)
  }

  const deleteBrushRecord = async (childId: number, time: string) => {
    console.log(`Eliminando registro de cepillado para niño ${childId} en periodo ${time}`)
  }

  const handleNavClick = (tab: string): void => {
    if (tab === 'citas') {
      navigate('/appointmentFather')
    } else if (tab === 'hijos') {
      navigate('')
    } else if (tab === 'inicio') {
      navigate('/homeFather')
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
        weeklyBrushing: []
      }
    }
    return childrenBrushingData[selectedChild.childId]
  }

  const handleAddChild = async (data: {
    name: string
    lastName: string
    birthDate: string
    morningBrushingTime: string
    afternoonBrushingTime: string
    nightBrushingTime: string
    userId: number
  }) => {
    try {
      setIsLoading(true)

      console.log('Enviando datos del niño:', data)

      const newChild: Child = {
        childId: children.length + 1,
        name: data.name,
        lastName: data.lastName,
        birthDate: data.birthDate,
        morningBrushingTime: data.morningBrushingTime,
        afternoonBrushingTime: data.afternoonBrushingTime,
        nightBrushingTime: data.nightBrushingTime,
        nextAppointment: null
      }

      const updatedChildren = [...children, newChild]
      setChildren(updatedChildren)
      setSelectedChild(newChild)

      const newBrushingData = {
        todayBrushing: {
          morning: 'pending' as const,
          afternoon: 'pending' as const,
          night: 'pending' as const
        },
        weeklyBrushing: generateWeeklyBrushing([], newChild.childId)
      }

      setChildrenBrushingData({
        ...childrenBrushingData,
        [newChild.childId]: newBrushingData
      })

      // Cerrar el modal
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error al agregar niño:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const currentBrushingData = getCurrentChildBrushingData()

  if (isLoading) {
    return <div className={styles.loading}>Cargando...</div>
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

            <button className={styles.addChildButton} onClick={() => setIsModalOpen(true)}>
              <span className={styles.plusIcon}>+</span>
              <span>Agregar</span>
            </button>
          </div>
        </div>

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

      {/* Agregar a un nuevo hijo */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Danos a conocer un poco más sobre tu hijo"
      >
        <AddChildForm
          dentists={dentists}
          onSubmit={handleAddChild}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  )
}

export default HomePage
