import * as React from 'react'
import styles from '../styles/weeklyBrushingList.module.css'

interface BrushingStatus {
  morning: 'pending' | 'completed'
  afternoon: 'pending' | 'completed'
  night: 'pending' | 'completed'
}

interface DayBrushing {
  date: Date
  status: BrushingStatus
}

interface WeeklyBrushingListProps {
  days: DayBrushing[]
}

const WeeklyBrushingList: React.FC<WeeklyBrushingListProps> = ({ days }) => {
  const formatDate = (date: Date) => {
    const dayName = new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(date)
    const dayDate = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long' }).format(date)
    
    return {
      name: dayName.charAt(0).toUpperCase() + dayName.slice(1),
      date: dayDate
    }
  }

  return (
    <div className={styles.listContainer}>
      {days.map((day, index) => {
        const formattedDate = formatDate(day.date)
        
        return (
          <div key={index} className={styles.dayRow}>
            <div className={styles.dateInfo}>
              <div className={styles.dayName}>{formattedDate.name}</div>
              <div className={styles.dateText}>{formattedDate.date}</div>
            </div>
            
            <div className={styles.statusIndicators}>
              <div className={`${styles.indicator} ${styles[day.status.morning]}`}>
                Mañana
              </div>
              <div className={`${styles.indicator} ${styles[day.status.afternoon]}`}>
                Tarde
              </div>
              <div className={`${styles.indicator} ${styles[day.status.night]}`}>
                Noche
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default WeeklyBrushingList