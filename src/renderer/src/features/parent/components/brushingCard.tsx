import * as React from 'react'
import styles from '../styles/brushingCard.module.css'

interface BrushingCardProps {
  time: 'morning' | 'afternoon' | 'night'
  schedule: string
  status: 'pending' | 'completed'
  label: string
  onStatusToggle: () => void
}

const BrushingCard: React.FC<BrushingCardProps> = ({ time, schedule, status, label, onStatusToggle }) => {
  return (
    <div 
      className={`${styles.card} ${styles[time]}`}
      onClick={onStatusToggle}
    >
      <div className={styles.timeLabel}>{label}</div>
      <div className={styles.schedule}>Programado a las {schedule}</div>
      <div className={`${styles.status} ${styles[status]}`}>
        {status === 'completed' ? 'Completado' : 'Pendiente'}
      </div>
    </div>
  )
}

export default BrushingCard