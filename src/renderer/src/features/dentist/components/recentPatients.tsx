import React from 'react'
import styles from '../styles/recentPatients.module.css'
import Teeth from '@renderer/assets/images/teeth.svg'

interface RecentPatientsProps {
  name: string
  reason: string
}

const RecentPatients: React.FC<RecentPatientsProps> = ({ name, reason }) => {
  const trimmedReason = reason.length > 50 ? reason.slice(0, 50) + '...' : reason

  return (
    <div className={styles.container}>
      <div className={styles.containerImage}>
        <img src={Teeth} alt="teeth" />
      </div>
      <div className={styles.containerText}>
        <p className={styles.name}>{name}</p>
        <p className={styles.reason}>{trimmedReason}</p>
      </div>
    </div>
  )
}

export default RecentPatients
