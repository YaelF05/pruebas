import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { ChildResponse } from '../types/childTypes'
import styles from '../styles/childCard.module.css'

interface ChildCardProps {
  child: ChildResponse
  isSelected: boolean
  onClick: () => void
  formatAge: (birthDate: string) => string
  enableNavigation?: boolean
}

const ChildCard: React.FC<ChildCardProps> = ({
  child,
  isSelected,
  onClick,
  formatAge,
  enableNavigation = false
}) => {
  const navigate = useNavigate()

  const formatNextAppointment = (dateStr: string | null | undefined): string => {
    if (!dateStr) return 'Sin cita programada'

    const date = new Date(dateStr)

    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      return 'Sin cita programada'
    }

    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date)
  }

  const handleCardClick = (): void => {
    if (enableNavigation) {
      navigate(`/child/${child.childId}/profile`)
    } else {
      onClick()
    }
  }

  return (
    <div
      className={`${styles.card} ${isSelected ? styles.selected : ''}`}
      onClick={handleCardClick}
    >
      <h3 className={styles.name}>
        {child.name} {child.lastName && child.lastName}
      </h3>
      <p className={styles.age}>{formatAge(child.birthDate)}</p>
      <p className={styles.appointment}>
        Próxima cita: {formatNextAppointment(child.nextAppointment)}
      </p>
    </div>
  )
}

export default ChildCard
