import { FC, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Calendar from '../../../components/calendar'
import AppointmentCard from '../../../components/appointmentCard'
import CancelAppointmentModal from '../components/cancelAppointment'
import RescheduleAppointmentModal from '../components/rescheduleAppointment'
import { getAppointmentsService, AppointmentResponse } from '../services/appointmentService'
import { getChildrenService } from '../services/childService'
import { getDentistsForSelectService } from '../services/dentistService'
import styles from '../styles/appointmentsFather.module.css'
import Dentist from '@renderer/assets/images/dentist.png'
import Clock from '@renderer/assets/icons/clock.svg'
import ClockActive from '@renderer/assets/icons/clock_active.svg'
import Children from '@renderer/assets/icons/children.svg'
import ChildrenActive from '@renderer/assets/icons/children_active.svg'
import Home from '@renderer/assets/icons/home.svg'
import HomeActive from '@renderer/assets/icons/home_active.svg'
import ProfileAvatar from '@renderer/assets/images/profile-icon-9.png'

interface DentistData {
  userId: number
  name: string
}

interface ChildData {
  childId: number
  name: string
  lastName: string
}

interface CancelModalData {
  appointmentId: string
}

interface RescheduleModalData {
  appointment: AppointmentResponse
}

const AppointmentsPage: FC = () => {
  const navigate = useNavigate()

  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [allAppointments, setAllAppointments] = useState<AppointmentResponse[]>([])
  const [children, setChildren] = useState<ChildData[]>([])
  const [dentists, setDentists] = useState<DentistData[]>([])
  const [activeTab, setActiveTab] = useState<string>('citas')
  const [isLoading, setLoading] = useState(true)
  const [, setError] = useState<string | null>(null)

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [cancelModalData, setCancelModalData] = useState<CancelModalData | null>(null)

  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false)
  const [rescheduleModalData, setRescheduleModalData] = useState<RescheduleModalData | null>(null)

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async (): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      const [appointmentsResult, childrenResult, dentistsResult] = await Promise.allSettled([
        getAppointmentsService(1, 100),
        getChildrenService(),
        getDentistsForSelectService()
      ])

      if (appointmentsResult.status === 'fulfilled') {
        setAllAppointments(appointmentsResult.value)
      } else {
        console.error('Error al cargar citas:', appointmentsResult.reason)
        setAllAppointments([])
      }

      if (childrenResult.status === 'fulfilled') {
        const childrenData = childrenResult.value.map((child) => ({
          childId: child.childId,
          name: child.name,
          lastName: child.lastName
        }))
        setChildren(childrenData)
      } else {
        console.error('Error al cargar hijos:', childrenResult.reason)
        setChildren([])
      }

      if (dentistsResult.status === 'fulfilled') {
        setDentists(dentistsResult.value)
      } else {
        console.error('Error al cargar dentistas:', dentistsResult.reason)
        setDentists([])
      }
    } catch (error) {
      console.error('Error general al cargar datos:', error)
      setError(error instanceof Error ? error.message : 'Error al cargar los datos')

      setAllAppointments([])
      setChildren([])
      setDentists([])
    } finally {
      setLoading(false)
    }
  }

  const getAppointmentsForDate = (date: Date): AppointmentResponse[] => {
    return allAppointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.appointmentDatetime)
      return (
        appointmentDate.getDate() === date.getDate() &&
        appointmentDate.getMonth() === date.getMonth() &&
        appointmentDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const appointments = getAppointmentsForDate(selectedDate)

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'long'
    }).format(date)
  }

  const isAppointmentInPast = (appointmentDateTime: string): boolean => {
    const appointmentDate = new Date(appointmentDateTime)
    const now = new Date()
    return appointmentDate <= now
  }

  const handleRescheduleClick = (appointmentId: string): void => {
    const appointment = allAppointments.find((a) => a.appointmentId.toString() === appointmentId)

    if (!appointment) {
      alert('Cita no encontrada')
      return
    }

    // Verificar si la cita ya pasó
    if (isAppointmentInPast(appointment.appointmentDatetime)) {
      alert('No se pueden reagendar citas que ya han pasado')
      return
    }

    // Preparar datos para el modal
    const modalData: RescheduleModalData = {
      appointment
    }

    setRescheduleModalData(modalData)
    setIsRescheduleModalOpen(true)
  }

  const handleRescheduleConfirm = (newDateTime: string, reason: string): void => {
    if (!rescheduleModalData) return

    // Por ahora solo mostrar un mensaje
    console.log('Reagendando cita:', {
      appointmentId: rescheduleModalData.appointment.appointmentId,
      newDateTime: newDateTime,
      reason: reason
    })

    // Formatear la nueva fecha y hora para mostrar
    const newDate = new Date(newDateTime)
    const formattedDate = newDate.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
    const formattedTime = newDate.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })

    alert(`Cita reagendada exitosamente para el ${formattedDate} a las ${formattedTime}`)
    // Servicio para reagendar
    // await rescheduleAppointmentService(rescheduleModalData.appointment.appointmentId, newDateTime, reason)

    fetchAllData()

    setIsRescheduleModalOpen(false)
    setRescheduleModalData(null)
  }

  const handleRescheduleModalClose = (): void => {
    setIsRescheduleModalOpen(false)
    setRescheduleModalData(null)
  }

  const handleCancelClick = (appointmentId: string): void => {
    const appointment = allAppointments.find((a) => a.appointmentId.toString() === appointmentId)

    if (!appointment) {
      alert('Cita no encontrada')
      return
    }

    if (isAppointmentInPast(appointment.appointmentDatetime)) {
      alert('No se pueden cancelar citas que ya han pasado')
      return
    }

    const modalData: CancelModalData = {
      appointmentId
    }

    setCancelModalData(modalData)
    setIsCancelModalOpen(true)
  }

  const handleCancelConfirm = (reason: string): void => {
    if (!cancelModalData) return

    console.log('Cancelando cita:', {
      appointmentId: cancelModalData.appointmentId,
      reason: reason
    })

    alert('Cita cancelada exitosamente')

    // Servicio de cancelar
    // await cancelAppointmentService(parseInt(cancelModalData.appointmentId), reason)

    fetchAllData()

    setIsCancelModalOpen(false)
    setCancelModalData(null)
  }

  const handleCancelModalClose = (): void => {
    setIsCancelModalOpen(false)
    setCancelModalData(null)
  }

  const navigateToDentists = (): void => {
    navigate('/dentistDirectory')
  }

  const handleNavClick = (tab: string): void => {
    if (tab === 'inicio') {
      navigate('/fatherDashboard')
    } else if (tab === 'hijos') {
      navigate('/children')
    }
    setActiveTab(tab)
  }

  const calculateMinutesUntil = (appointmentDateTime: string): number => {
    const appointmentTime = new Date(appointmentDateTime)
    const now = new Date()
    const diffMs = appointmentTime.getTime() - now.getTime()
    return Math.floor(diffMs / 60000)
  }

  const formatTime = (dateTimeString: string): string => {
    const date = new Date(dateTimeString)
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  const getChildName = (childId: number | null): string => {
    if (!childId) return 'Niño desconocido'

    const child = children.find((c) => c.childId === childId)
    return child ? `${child.name} ${child.lastName}` : `Niño ${childId}`
  }

  const getDentistName = (dentistId: number | null): string => {
    if (!dentistId) return 'Dentista desconocido'

    const dentist = dentists.find((d) => d.userId === dentistId)
    return dentist ? dentist.name : `Dentista ${dentistId}`
  }

  if (isLoading) {
    return <div className={styles.loading}>Cargando...</div>
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.appointmentsPage}>
        <div className={styles.profileContainer}>
          <div className={styles.profileImage}>
            <img src={ProfileAvatar} alt="Profile" className={styles.profileAvatar} />
          </div>
        </div>

        <div className={styles.contentContainer}>
          {/* Columna izquierda: Título, Calendario y Nuestros odontólogos */}
          <div className={styles.leftColumn}>
            <h1 className={styles.title}>Citas próximas</h1>

            <Calendar selectedDate={selectedDate} onDateChange={setSelectedDate} />

            <div className={styles.dentistsCard} onClick={navigateToDentists}>
              <div className={styles.dentistIcon}>
                <div className={styles.dentistIconPlaceholder}>
                  <img src={Dentist} alt="Dentist" className={styles.heroImage} />
                </div>
              </div>
              <div className={styles.dentistsText}>Nuestros odontólogos</div>
            </div>
          </div>

          {/* Columna derecha: Lista de citas */}
          <div className={styles.rightColumn}>
            <div className={styles.appointmentsList}>
              {appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.appointmentId}
                    id={appointment.appointmentId.toString()}
                    patientName={getChildName(appointment.childId)}
                    time={formatTime(appointment.appointmentDatetime)}
                    minutesUntil={calculateMinutesUntil(appointment.appointmentDatetime)}
                    description={appointment.reason}
                    doctorName={getDentistName(appointment.dentistId)}
                    onReschedule={handleRescheduleClick}
                    onCancel={handleCancelClick}
                  />
                ))
              ) : (
                <div className={styles.noAppointments}>
                  <p>No hay citas para el {formatDate(selectedDate)}</p>
                </div>
              )}
            </div>
          </div>
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
      </div>

      {/* Modal de cancelación de cita */}
      <CancelAppointmentModal
        isOpen={isCancelModalOpen}
        onClose={handleCancelModalClose}
        onConfirm={handleCancelConfirm}
      />

      {/* Modal de reagendamiento de cita */}
      <RescheduleAppointmentModal
        isOpen={isRescheduleModalOpen}
        onClose={handleRescheduleModalClose}
        onConfirm={handleRescheduleConfirm}
        appointment={rescheduleModalData?.appointment || null}
        existingAppointments={allAppointments}
      />
    </div>
  )
}

export default AppointmentsPage
