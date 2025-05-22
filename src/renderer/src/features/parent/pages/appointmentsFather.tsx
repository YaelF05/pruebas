import { FC, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Calendar from '../../../components/calendar'
import AppointmentCard from '../../../components/appointmentCard'
import {
  getAppointmentsService,
  rescheduleAppointmentService,
  cancelAppointmentService,
  AppointmentResponse
} from '../services/appointmentService'
import styles from '../styles/appointmentsFather.module.css'
import Dentist from '@renderer/assets/images/dentist.png'
import Clock from '@renderer/assets/icons/clock.png'
import ClockActive from '@renderer/assets/icons/clock-active.png'
import Children from '@renderer/assets/icons/children.png'
import ChildrenActive from '@renderer/assets/icons/children-active.png'
import Home from '@renderer/assets/icons/home.png'
import HomeActive from '@renderer/assets/icons/home-active.png'
import ProfileAvatar from '@renderer/assets/images/profile-icon-9.png'

const AppointmentsPage: FC = () => {
  const navigate = useNavigate()

  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [allAppointments, setAllAppointments] = useState<AppointmentResponse[]>([])
  const [activeTab, setActiveTab] = useState<string>('citas')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar las citas al montar el componente
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true)
        setError(null)
        const appointments = await getAppointmentsService()
        setAllAppointments(appointments)
      } catch (error) {
        console.error('Error al cargar las citas:', error)
        setError(error instanceof Error ? error.message : 'Error al cargar las citas')
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [])

  // Función para filtrar las citas por fecha
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

  // Obtener las citas para la fecha seleccionada
  const appointments = getAppointmentsForDate(selectedDate)

  // Función para formatear fecha para mostrar
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'long'
    }).format(date)
  }

  // Función para reagendar cita
  const handleReschedule = async (appointmentId: string): Promise<void> => {
    const appointment = allAppointments.find((a) => a.appointmentId.toString() === appointmentId)

    if (!appointment) {
      alert('Cita no encontrada')
      return
    }

    const newDateTime = prompt(
      'Ingrese nueva fecha y hora (YYYY-MM-DD HH:MM)',
      appointment.appointmentDatetime.slice(0, 16)
    )
    const reason = prompt('Motivo del reagendamiento')

    if (newDateTime && reason) {
      try {
        const newDateTimeFormatted = `${newDateTime}:00`

        await rescheduleAppointmentService(parseInt(appointmentId), newDateTimeFormatted, reason)

        // Actualizar la cita en el estado local
        const updatedAppointments = allAppointments.map((app) => {
          if (app.appointmentId.toString() === appointmentId) {
            return {
              ...app,
              appointmentDatetime: newDateTimeFormatted,
              lastModificationDate: new Date().toISOString()
            }
          }
          return app
        })
        setAllAppointments(updatedAppointments)

        alert('Cita reagendada con éxito')
      } catch (error) {
        console.error('Error al reagendar la cita:', error)
        alert('Error al reagendar la cita. Por favor, inténtelo de nuevo.')
      }
    }
  }

  // Función para cancelar cita
  const handleCancel = async (appointmentId: string): Promise<void> => {
    const reason = prompt('Motivo de la cancelación')

    if (reason && confirm('¿Está seguro de cancelar esta cita?')) {
      try {
        await cancelAppointmentService(parseInt(appointmentId), reason)

        // Remover la cita del estado local
        const updatedAppointments = allAppointments.filter(
          (app) => app.appointmentId.toString() !== appointmentId
        )
        setAllAppointments(updatedAppointments)

        alert('Cita cancelada con éxito')
      } catch (error) {
        console.error('Error al cancelar la cita:', error)
        alert('Error al cancelar la cita. Por favor, inténtelo de nuevo.')
      }
    }
  }

  // Función para navegar a la página de dentistas
  const navigateToDentists = (): void => {
    navigate('/dentistDirectory')
  }

  // Función para manejar la navegación
  const handleNavClick = (tab: string): void => {
    if (tab === 'inicio') {
      navigate('/homeFather')
    } else if (tab === 'hijos') {
      navigate('')
    }
    setActiveTab(tab)
  }

  // Función para calcular minutos hasta la cita
  const calculateMinutesUntil = (appointmentDateTime: string): number => {
    const appointmentTime = new Date(appointmentDateTime)
    const now = new Date()
    const diffMs = appointmentTime.getTime() - now.getTime()
    return Math.floor(diffMs / 60000)
  }

  // Función para formatear hora
  const formatTime = (dateTimeString: string): string => {
    const date = new Date(dateTimeString)
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
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
              {error ? (
                <div className={styles.error}>
                  <p>Error: {error}</p>
                  <button onClick={() => window.location.reload()}>Reintentar</button>
                </div>
              ) : appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.appointmentId}
                    id={appointment.appointmentId.toString()}
                    patientName={`${appointment.child?.name || ''} ${appointment.child?.lastName || ''}`}
                    time={formatTime(appointment.appointmentDatetime)}
                    minutesUntil={calculateMinutesUntil(appointment.appointmentDatetime)}
                    description={appointment.reason}
                    doctorName={`Dr. ${appointment.dentist?.user.name || ''} ${appointment.dentist?.user.lastName || ''}`}
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
