import * as React from 'react'
import styles from '../styles/childCard.module.css'

interface Child {
  id: number
  name: string
  last_name?: string
  birth_date: string
  nextAppointment: string | null
}

interface ChildCardProps {
  child: Child
  isSelected: boolean
  onClick: () => void
  formatAge: (birthDate: string) => string
}

const ChildCard: React.FC<ChildCardProps> = ({ child, isSelected, onClick, formatAge }) => {
  const formatNextAppointment = (dateStr: string | null): string => {
    if (!dateStr) return 'Sin cita programada'
    
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date)
  }

  return (
    <div 
      className={`${styles.card} ${isSelected ? styles.selected : ''}`}
      onClick={onClick}
    >
      <h3 className={styles.name}>
        {child.name} {child.last_name && child.last_name}
      </h3>
      <p className={styles.age}>{formatAge(child.birth_date)}</p>
      <p className={styles.appointment}>
        Próxima cita: {formatNextAppointment(child.nextAppointment)}
      </p>
    </div>
  )
}

export default ChildCard