import React, { useState } from 'react'
import styles from '../styles/appointmentsDentist.module.css'
import NavBar from '../components/navBar'
import Calendar from '@renderer/components/calendar'
import AppointmentCard from '@renderer/components/appointmentCard'

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
}

// Mock data
const mockAppointments: AppointmentData[] = [
  {
    appointmentId: 1,
    userId: 1,
    childId: 1,
    reason: 'Sensibilidad en molares',
    appointmentDatetime: '2025-05-21T10:00:00',
    child: {
      name: 'Jhon',
      lastName: 'Doe'
    }
  },
  {
    appointmentId: 2,
    userId: 1,
    childId: 2,
    reason: 'Dolor de muela',
    appointmentDatetime: '2025-05-23T11:00:00',
    child: {
      name: 'Jane',
      lastName: 'Doe'
    }
  },
  {
    appointmentId: 3,
    userId: 1,
    childId: 3,
    reason: 'Revisión dental',
    appointmentDatetime: '2025-05-21T12:00:00',
    child: {
      name: 'Alice',
      lastName: 'Smith'
    }
  },
  {
    appointmentId: 4,
    userId: 1,
    childId: 4,
    reason: 'Control de caries',
    appointmentDatetime: '2025-05-21T13:00:00',
    child: {
      name: 'Bob',
      lastName: 'Brown'
    }
  },
  {
    appointmentId: 5,
    userId: 1,
    childId: 5,
    reason: 'Limpieza dental',
    appointmentDatetime: '2025-05-21T14:00:00',
    child: {
      name: 'Charlie',
      lastName: 'Johnson'
    }
  },
  {
    appointmentId: 6,
    userId: 1,
    childId: 6,
    reason: 'Ortodoncia',
    appointmentDatetime: '2025-05-22T15:00:00',
    child: {
      name: 'David',
      lastName: 'Williams'
    }
  },
  {
    appointmentId: 7,
    userId: 1,
    childId: 7,
    reason: 'Extracción de muela',
    appointmentDatetime: '2025-05-22T16:00:00',
    child: {
      name: 'Eve',
      lastName: 'Davis'
    }
  }
]

const AppointmentDentist: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [allAppointments, setAllAppointments] = useState<AppointmentData[]>(mockAppointments)

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
  const handleReschedule = (appointmentId: string): void => {
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
  const handleCancel = (appointmentId: string): void => {
    const reason = prompt('Motivo de la cancelación')

    if (reason && confirm('¿Está seguro de cancelar esta cita?')) {
      const updatedAppointments = allAppointments.filter(
        (app) => app.appointmentId.toString() !== appointmentId
      )
      setAllAppointments(updatedAppointments)

      alert('Cita cancelada con éxito')
    }
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
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <div className={styles.mainContent}>
          <div className={styles.header}>
            <h1 className={styles.title}>Citas agendadas</h1>
            <div className={styles.calendarContainer}>
              <Calendar selectedDate={selectedDate} onDateChange={setSelectedDate} />
            </div>
          </div>
          <div className={styles.appointments}>
            {appointments.length > 0 ? (
              appointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.appointmentId}
                  id={appointment.appointmentId.toString()}
                  patientName={`${appointment.child?.name || ''} ${appointment.child?.lastName || ''}`}
                  time={formatTime(appointment.appointmentDatetime)}
                  minutesUntil={calculateMinutesUntil(appointment.appointmentDatetime)}
                  description={appointment.reason}
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
        <NavBar />
      </div>
    </div>
  )
}

export default AppointmentDentist
