import { FC, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Calendar from '../../../components/calendar'
import AppointmentCard from '../../../components/appointmentCard'
import styles from '../styles/appointmentsFather.module.css'
import Dentist from '@renderer/assets/images/dentist.png'
import Clock from '@renderer/assets/icons/clock.png'
import ClockActive from '@renderer/assets/icons/clock-active.png'
import Children from '@renderer/assets/icons/children.png'
import ChildrenActive from '@renderer/assets/icons/children-active.png'
import Home from '@renderer/assets/icons/home.png'
import HomeActive from '@renderer/assets/icons/home-active.png'
import ProfileAvatar from '@renderer/assets/images/profile-icon-9.png'

interface AppointmentData {
  appointmentId: number
  userId: number
  childId: number
  reason: string
  appointmentDatetime: string
  child?: {
    name: string
    lastName: string
  }
  dentist?: {
    user: {
      name: string
      lastName: string
    }
  }
}

// Mock data
const mockAppointments: AppointmentData[] = [
  {
    appointmentId: 1,
    userId: 1,
    childId: 1,
    reason: 'Sensibilidad en molares',
    appointmentDatetime: '2025-05-06T10:00:00',
    child: {
      name: 'Jhon',
      lastName: 'Doe'
    },
    dentist: {
      user: {
        name: 'Sinhue',
        lastName: 'Montalvo Villagomez'
      }
    }
  },
  {
    appointmentId: 2,
    userId: 1,
    childId: 2,
    reason: 'Limpieza dental',
    appointmentDatetime: '2025-05-07T14:30:00',
    child: {
      name: 'María',
      lastName: 'García'
    },
    dentist: {
      user: {
        name: 'Sinhue',
        lastName: 'Montalvo Villagomez'
      }
    }
  },
  {
    appointmentId: 3,
    userId: 2,
    childId: 3,
    reason: 'Revisión ortodóncia',
    appointmentDatetime: '2025-05-06T16:00:00',
    child: {
      name: 'Pedro',
      lastName: 'López'
    },
    dentist: {
      user: {
        name: 'Ana',
        lastName: 'Martínez Ruiz'
      }
    }
  },
  {
    appointmentId: 4,
    userId: 1,
    childId: 4,
    reason: 'Blanqueamiento dental',
    appointmentDatetime: '2025-05-08T11:00:00',
    child: {
      name: 'Ana',
      lastName: 'Martínez'
    },
    dentist: {
      user: {
        name: 'Sinhue',
        lastName: 'Montalvo Villagomez'
      }
    }
  },
  {
    appointmentId: 5,
    userId: 2,
    childId: 1,
    reason: 'Control de brackets',
    appointmentDatetime: '2025-05-23T09:30:00',
    child: {
      name: 'Jhon',
      lastName: 'Doe'
    },
    dentist: {
      user: {
        name: 'Ana',
        lastName: 'Martínez Ruiz'
      }
    }
  }
]

const AppointmentsPage: FC = () => {
  const navigate = useNavigate()

  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const [allAppointments, setAllAppointments] = useState<AppointmentData[]>(mockAppointments)

  const [activeTab, setActiveTab] = useState<string>('citas')

  // Función para filtrar las citas por fecha
  const getAppointmentsForDate = (date: Date): AppointmentData[] => {
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

  // Función para reagendar cita en proceso
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleReschedule = (appointmentId: string) => {
    const appointment = allAppointments.find((a) => a.appointmentId.toString() === appointmentId)

    if (appointment) {
      const newDateTime = prompt('Ingrese nueva fecha y hora (YYYY-MM-DD HH:mm)')
      const reason = prompt('Motivo del reagendamiento')

      if (newDateTime && reason) {
        const updatedAppointments = allAppointments.map((app) => {
          if (app.appointmentId.toString() === appointmentId) {
            return {
              ...app,
              appointmentDatetime: new Date(newDateTime).toISOString()
            }
          }
          return app
        })
        setAllAppointments(updatedAppointments)

        // Simulación de éxito
        alert('Cita reagendada con éxito')
      }
    }
  }

  // Función para cancelar cita en proceso
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleCancel = (appointmentId: string) => {
    const reason = prompt('Motivo de la cancelación')

    if (reason && confirm('¿Está seguro de cancelar esta cita?')) {
      const updatedAppointments = allAppointments.filter(
        (app) => app.appointmentId.toString() !== appointmentId
      )
      setAllAppointments(updatedAppointments)

      alert('Cita cancelada con éxito')
    }
  }

  // Función para navegar a la página de dentistas
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const navigateToDentists = () => {
    navigate('/dentistDirectory')
  }

  // Función para manejar la navegación
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleNavClick = (tab: string) => {
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
