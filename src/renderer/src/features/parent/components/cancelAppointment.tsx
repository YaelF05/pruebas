import React, { useState } from 'react'
import Modal from './modal'
import TextareaInput from '@renderer/components/textareaInput'
import styles from '../styles/cancelAppointment.module.css'

interface CancelAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
}

const CancelAppointmentModal: React.FC<CancelAppointmentModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  const [reason, setReason] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setReason(e.target.value)
    if (error) {
      setError(null)
    }
  }

  const handleConfirm = (): void => {
    const trimmedReason = reason.trim()

    if (!trimmedReason) {
      setError('Debe ingresar el motivo de la cancelación')
      return
    }

    if (trimmedReason.length < 5) {
      setError('El motivo debe tener al menos 5 caracteres')
      return
    }

    if (trimmedReason.length > 255) {
      setError('El motivo no puede tener más de 255 caracteres')
      return
    }

    onConfirm(trimmedReason)
    handleClose()
  }

  const handleClose = (): void => {
    setReason('')
    setError(null)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="¿Seguro que quieres cancelar la cita?">
      <div className={styles.modalContent}>
        <div className={styles.formGroup}>
          <TextareaInput
            label="Ingresa el motivo de la cancelación"
            name="reason"
            value={reason}
            placeholder="Describe el motivo por el cual cancelas la cita..."
            onChange={handleReasonChange}
            required
          />
          {error && <div className={styles.errorMessage}>{error}</div>}
        </div>

        <div className={styles.buttonGroup}>
          <button type="button" className={styles.cancelButton} onClick={handleClose}>
            Regresar
          </button>
          <button type="button" className={styles.confirmButton} onClick={handleConfirm}>
            Cancelar cita
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default CancelAppointmentModal
