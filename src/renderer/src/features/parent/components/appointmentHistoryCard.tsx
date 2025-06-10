import React from 'react'
import { AppointmentResponse } from '../services/appointmentService'
import styles from '../styles/appointmentHistoryCard.module.css'

interface AppointmentHistoryProps {
  appointments: AppointmentResponse[]
  isLoading: boolean
}

const AppointmentHistory: React.FC<AppointmentHistoryProps> = ({ appointments, isLoading }) => {
  const formatDate = (dateTimeString: string): string => {
    const date = new Date(dateTimeString)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatTime = (dateTimeString: string): string => {
    const date = new Date(dateTimeString)
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Cargando historial de citas...</div>
      </div>
    )
  }

  if (appointments.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.noAppointments}>
          <p>No hay citas registradas para este niño</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {appointments.map((appointment) => {
        return (
          <div key={appointment.appointmentId} className={styles.appointmentCard}>
            <div className={styles.appointmentHeader}>
              <div className={styles.dateTime}>
                <span className={styles.date}>
                  Cita con fecha del {formatDate(appointment.appointmentDatetime)}
                </span>
                <span className={styles.time}>
                  Hora de la cita {formatTime(appointment.appointmentDatetime)}
                </span>
              </div>
            </div>

            <div className={styles.appointmentBody}>
              <p className={styles.reason}>
                <strong>Motivo:</strong> {appointment.reason}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default AppointmentHistory
