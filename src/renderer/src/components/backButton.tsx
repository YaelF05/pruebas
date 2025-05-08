import React from 'react'
import { useNavigate } from 'react-router-dom'
import styles from '../styles/backButton.module.css'
import backButtonIcon from '@renderer/assets/icons/arrowBack.svg'

const BackButton: React.FC = () => {
  const navigate = useNavigate()

  const handleBack: () => void = () => {
    navigate(-1)
  }

  return (
    <div className={styles.container}>
      <img
        src={backButtonIcon}
        alt="Back button"
        className={styles.backButton}
        onClick={handleBack}
      />
    </div>
  )
}

export default BackButton
