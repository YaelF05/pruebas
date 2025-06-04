import React from 'react'
import Modal from './modal'
import styles from '../styles/appointmentSuccess.module.css'

interface CancelSuccessProps {
  isOpen: boolean
  onContinue: () => void
}

const CancelSuccess: React.FC<CancelSuccessProps> = ({ isOpen, onContinue }) => {
  return (
    <Modal isOpen={isOpen} onClose={onContinue} title="">
      <div className={styles.successContainer}>
        <h2 className={styles.successTitle}>Cita cancelada con éxito</h2>
        <button className={styles.continueButton} onClick={onContinue}>
          Continuar
        </button>
      </div>
    </Modal>
  )
}

export default CancelSuccess
