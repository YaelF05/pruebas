import React from 'react'
import styles from '../styles/appointmentCard.module.css'

interface AppointmentCardProps {
  id: string
  patientName: string
  time: string
  minutesUntil: number
  description: string
  doctorName?: string
  onReschedule: (id: string) => void
  onCancel: (id: string) => void
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  id,
  patientName,
  time,
  minutesUntil,
  description,
  doctorName,
  onReschedule,
  onCancel
}) => {
  return (
    <div className={styles.appointmentCard}>
      <div className={styles.timeBlock}>
        <div className={styles.appointmentTime}>{time}</div>
        <div className={styles.timeRemaining}>
          {minutesUntil > 0
            ? `en ${minutesUntil} minutos`
            : minutesUntil === 0
              ? 'Ahora'
              : `hace ${Math.abs(minutesUntil)} minutos`}
        </div>
      </div>
      <div className={styles.appointmentDetails}>
        <div className={styles.appointmentActions}>
          <button className={styles.rescheduleButton} onClick={() => onReschedule(id)}>
            Reagendar cita
          </button>
          <button className={styles.cancelButton} onClick={() => onCancel(id)}>
            Cancelar cita
          </button>
        </div>
        <h3 className={styles.patientName}>{patientName}</h3>
        <p className={styles.appointmentDescription}>{description}</p>
        <p className={styles.doctorName}>{doctorName}</p>
      </div>
    </div>
  )
}

export default AppointmentCard
