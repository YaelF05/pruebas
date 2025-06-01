import React, { useState } from 'react'
import styles from '../styles/rescheduleAppoinment.module.css'
import Button from '@renderer/components/button'
import InputForm from '@renderer/components/inputForm'
import TextareaInput from '@renderer/components/textareaInput'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  appointmentId: number
  reason: string
  rescheduleDateTime: string
  onSubmit: (appointmentId: number, newDateTime: string, reason: string) => void
}

const RescheduleAppointment: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  appointmentId,
  reason,
  rescheduleDateTime,
  onSubmit
}) => {
  const [reasonAppointment, setReason] = useState(reason)
  const [dateTimeAppointment, setRescheduleDateTime] = useState(rescheduleDateTime)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()

    onSubmit(appointmentId, rescheduleDateTime, reason.trim())
    onClose()
  }

  const handleOverlayClick = (e: React.MouseEvent): void => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modalContent}>
        <h2>Reagendar Cita</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <InputForm
            label={'Ingrese la nueva fecha y hora de la cita'}
            name={'dateTime'}
            type={'datetime-local'}
            value={dateTimeAppointment}
            placeholder={'Ingrese la nueva fecha y hora de la cita'}
            onChange={(e) => setRescheduleDateTime(e.target.value)}
            required={true}
          />
          <TextareaInput
            label={'Motivo por el que se reprograma'}
            name={'reason'}
            value={reasonAppointment}
            placeholder={'Motivo por el que se reprograma'}
            onChange={(e) => setReason(e.target.value)}
            required={true}
          />

          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.buttonDelete}>
              Cancelar
            </button>
            <Button name={'Reagendar cita'} type="submit" onClick={handleSubmit} />
          </div>
        </form>
      </div>
    </div>
  )
}

export default RescheduleAppointment
