import React from 'react'
import Modal from './modal'
import styles from '../styles/editSuccess.module.css'

interface EditSuccessProps {
  isOpen: boolean
  onContinue: () => void
  updatedFields: string[]
  childName: string
}

const EditSuccess: React.FC<EditSuccessProps> = ({ isOpen, onContinue, childName }) => {
  return (
    <Modal isOpen={isOpen} onClose={onContinue} title="">
      <div className={styles.successContainer}>
        <h2 className={styles.successTitle}>Datos de {childName} actualizados con éxito</h2>
        <button className={styles.continueButton} onClick={onContinue}>
          Continuar
        </button>
      </div>
    </Modal>
  )
}

export default EditSuccess
