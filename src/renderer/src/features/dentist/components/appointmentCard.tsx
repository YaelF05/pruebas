import React, { useEffect, useState } from 'react'
import styles from '../styles/appointmentCard.module.css'

interface AppointmentProps {
  appointmentDateTime: string
  name: string
  reason: string
}

const AppointmentCard: React.FC<AppointmentProps> = ({ appointmentDateTime, name, reason }) => {
  const appointmentDate = new Date(appointmentDateTime)
  const trimmedReason = reason.length > 100 ? reason.slice(0, 100) + '...' : reason

  const formattedTime = appointmentDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })

  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  const diffInMinutes = Math.max(Math.floor((appointmentDate.getTime() - now.getTime()) / 60000), 0)
  const diffInHours = Math.floor(diffInMinutes / 60)

  return (
    <div className={styles.container}>
      <div className={styles.timeBox}>
        <p className={styles.time}>{formattedTime}</p>
        <p className={styles.countdown}>
          {diffInHours > 0
            ? `en ${diffInHours}h ${diffInMinutes % 60}m`
            : `en ${diffInMinutes} minutos`}
        </p>
      </div>
      <div className={styles.details}>
        <p className={styles.name}>{name}</p>
        <p className={styles.reason}>{trimmedReason}</p>
      </div>
    </div>
  )
}

export default AppointmentCard
