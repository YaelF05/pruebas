import React from 'react'
import Modal from './modal'
import styles from '../styles/appointmentSuccess.module.css'

interface RescheduleSuccessProps {
  isOpen: boolean
  onContinue: () => void
  newDateTime?: string
}

const RescheduleSuccess: React.FC<RescheduleSuccessProps> = ({ isOpen, onContinue }) => {
  return (
    <Modal isOpen={isOpen} onClose={onContinue} title="">
      <div className={styles.successContainer}>
        <h2 className={styles.successTitle}>Cita reagendada con éxito</h2>
        <button className={styles.continueButton} onClick={onContinue}>
          Continuar
        </button>
      </div>
    </Modal>
  )
}

export default RescheduleSuccess
