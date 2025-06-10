import * as React from 'react'
import styles from '../styles/brushingCard.module.css'

interface BrushingCardProps {
  time: 'morning' | 'afternoon' | 'night'
  schedule: string
  status: 'pending' | 'completed'
  label: string
  onStatusToggle: () => void
  disabled?: boolean
}

const BrushingCard: React.FC<BrushingCardProps> = ({
  time,
  schedule,
  status,
  label,
  onStatusToggle,
  disabled = false
}) => {
  const handleClick = (): void => {
    if (disabled) return

    if (status === 'pending') {
      onStatusToggle()
    } else {
      console.log(`El cepillado ${label.toLowerCase()} ya está completado`)
    }
  }

  const formatTime = (timeStr: string): string => {
    try {
      const [hours, minutes] = timeStr.split(':')
      const hour24 = parseInt(hours)
      const period = hour24 >= 12 ? 'pm' : 'am'
      const hour12 = hour24 % 12 || 12
      return `${hour12}:${minutes} ${period}`
    } catch {
      return timeStr
    }
  }

  return (
    <div
      className={`${styles.card} ${styles[time]} ${status === 'completed' ? styles.completed : ''} ${disabled ? styles.disabled : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Cepillado ${label.toLowerCase()}, programado a las ${schedule}, estado: ${status === 'completed' ? 'completado' : 'pendiente'}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      <div className={styles.timeLabel}>{label}</div>
      <div className={styles.schedule}>Programado a las {formatTime(schedule)}</div>
      <div className={`${styles.status} ${styles[status]}`}>
        {status === 'completed' ? <span>Completado</span> : <span>Pendiente</span>}
      </div>
    </div>
  )
}

export default BrushingCard
