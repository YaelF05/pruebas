import React from 'react'
import Modal from './modal'
import styles from '../styles/appointmentSuccess.module.css'

interface AppointmentSuccessProps {
  isOpen: boolean
  onContinue: () => void
}

const AppointmentSuccess: React.FC<AppointmentSuccessProps> = ({ isOpen, onContinue }) => {
  return (
    <Modal isOpen={isOpen} onClose={onContinue} title="">
      <div className={styles.successContainer}>
        <h2 className={styles.successTitle}>Cita agendada con éxito</h2>
        <button className={styles.continueButton} onClick={onContinue}>
          Continuar
        </button>
      </div>
    </Modal>
  )
}

export default AppointmentSuccess
