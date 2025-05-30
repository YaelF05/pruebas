import { FC, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Calendar from '../../../components/calendar'
import AppointmentCard from '../../../components/appointmentCard'
import {
  getAppointmentsService,
  AppointmentResponse,
  cancelAppointmentService,
  rescheduleAppointmentService
} from '../services/appointmentService'
import { getChildrenService } from '../services/childService'
import { getDentistsForSelectService } from '../services/dentistService'
import styles from '../styles/appointmentsFather.module.css'
import Dentist from '@renderer/assets/images/dentist.png'
import Clock from '@renderer/assets/icons/clock.png'
import ClockActive from '@renderer/assets/icons/clock-active.png'
import Children from '@renderer/assets/icons/children.png'
import ChildrenActive from '@renderer/assets/icons/children-active.png'
import Home from '@renderer/assets/icons/home.png'
import HomeActive from '@renderer/assets/icons/home-active.png'
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

const AppointmentsPage: FC = () => {
  const navigate = useNavigate()

  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [allAppointments, setAllAppointments] = useState<AppointmentResponse[]>([])
  const [children, setChildren] = useState<ChildData[]>([])
  const [dentists, setDentists] = useState<DentistData[]>([])
  const [activeTab, setActiveTab] = useState<string>('citas')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Cargando datos de citas, hijos y dentistas...')

      // Cargar datos en paralelo
      const [appointmentsResult, childrenResult, dentistsResult] = await Promise.allSettled([
        getAppointmentsService(1, 100), // Obtener más citas
        getChildrenService(),
        getDentistsForSelectService()
      ])

      // Procesar citas
      if (appointmentsResult.status === 'fulfilled') {
        console.log('Citas cargadas:', appointmentsResult.value)
        setAllAppointments(appointmentsResult.value)
      } else {
        console.error('Error al cargar citas:', appointmentsResult.reason)
        setAllAppointments([])
      }

      // Procesar hijos
      if (childrenResult.status === 'fulfilled') {
        console.log('Hijos cargados:', childrenResult.value)
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

      // Procesar dentistas
      if (dentistsResult.status === 'fulfilled') {
        console.log('Dentistas cargados:', dentistsResult.value)
        setDentists(dentistsResult.value)
      } else {
        console.error('Error al cargar dentistas:', dentistsResult.reason)
        setDentists([])
      }
    } catch (error) {
      console.error('Error general al cargar datos:', error)
      setError(error instanceof Error ? error.message : 'Error al cargar los datos')

      // En caso de error general, mantener arrays vacíos
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

  const handleReschedule = async (appointmentId: string): Promise<void> => {
    const appointment = allAppointments.find((a) => a.appointmentId.toString() === appointmentId)

    if (!appointment) {
      alert('Cita no encontrada')
      return
    }

    try {
      // Solicitar nueva fecha y hora
      const newDateTime = prompt(
        'Ingrese nueva fecha y hora (YYYY-MM-DD HH:MM)',
        appointment.appointmentDatetime.slice(0, 16).replace('T', ' ')
      )

      if (!newDateTime) return

      const reason = prompt('Motivo del reagendamiento')
      if (!reason) return

      // Llamar al servicio de reagendamiento
      await rescheduleAppointmentService(parseInt(appointmentId), reason)

      // Recargar las citas
      await fetchAllData()

      alert('Cita reagendada exitosamente')
    } catch (error) {
      console.error('Error al reagendar la cita:', error)
      alert(
        `Error al reagendar la cita: ${error instanceof Error ? error.message : 'Error desconocido'}`
      )
    }
  }

  const handleCancel = async (appointmentId: string): Promise<void> => {
    try {
      const reason = prompt('Motivo de la cancelación')
      if (!reason) return

      if (!confirm('¿Está seguro de cancelar esta cita?')) return

      // Llamar al servicio de cancelación
      await cancelAppointmentService(parseInt(appointmentId), reason)

      // Recargar las citas
      await fetchAllData()

      alert('Cita cancelada exitosamente')
    } catch (error) {
      console.error('Error al cancelar la cita:', error)
      alert(
        `Error al cancelar la cita: ${error instanceof Error ? error.message : 'Error desconocido'}`
      )
    }
  }

  const navigateToDentists = (): void => {
    navigate('/dentistDirectory')
  }

  const handleNavClick = (tab: string): void => {
    if (tab === 'inicio') {
      navigate('/homeFather')
    } else if (tab === 'hijos') {
      navigate('')
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

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.appointmentsPage}>
          <div className={styles.loading}>Cargando citas...</div>
        </div>
      </div>
    )
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
              {error && (
                <div className={styles.error}>
                  <p>⚠️ {error}</p>
                  <button onClick={fetchAllData}>Reintentar</button>
                </div>
              )}

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
                    onReschedule={handleReschedule}
                    onCancel={handleCancel}
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
    </div>
  )
}

export default AppointmentsPage
