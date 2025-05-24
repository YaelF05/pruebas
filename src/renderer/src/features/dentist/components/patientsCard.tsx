import React from 'react'
import styles from '../styles/patientsCard.module.css'
import TeethIcon from '@renderer/assets/images/teeth.svg'

interface PatientProps {
  name: string
  birthDate: string
}

const PatientsCard: React.FC<PatientProps> = ({ name, birthDate }) => {
  const birthDateObj = new Date(birthDate)
  const currentDate = new Date()
  const age = currentDate.getFullYear() - birthDateObj.getFullYear()

  return (
    <div className={styles.container}>
      <div className={styles.iconContainer}>
        <img src={TeethIcon} alt="Icono de dientes" className={styles.icon} />
      </div>
      <div className={styles.details}>
        <p className={styles.name}>{name}</p>
        <p className={styles.age}>{age} años</p>
      </div>
    </div>
  )
}

export default PatientsCard
