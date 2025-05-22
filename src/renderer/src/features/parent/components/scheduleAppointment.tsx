import React, { useState, useEffect } from 'react'
import Modal from './modal'
import InputForm from '@renderer/components/inputForm'
import InputList from '@renderer/components/inputList'
import TextareaInput from '@renderer/components/textareaInput'
import { createAppointmentService, AppointmentData } from '../services/appointmentService'
import styles from '../styles/scheduleAppointment.module.css'

const mockChildren = [
  { childId: 1, name: 'Ana', lastName: 'García' },
  { childId: 2, name: 'Luis', lastName: 'García' },
  { childId: 3, name: 'María', lastName: 'García' }
]

interface ScheduleAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (appointmentData: AppointmentData) => void
  dentistId: number
}

const ScheduleAppointmentModal: React.FC<ScheduleAppointmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  dentistId
}) => {
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null)
  const [appointmentDate, setAppointmentDate] = useState<string>('')
  const [appointmentTime, setAppointmentTime] = useState<string>('')
  const [reason, setReason] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      console.log('Modal abierto - usando datos mock de hijos')
      // Aquí normalmente cargaríamos los hijos desde la API
      // const childrenData = await getChildrenService()
      // Por ahora usamos datos mock
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validaciones
    if (!selectedChildId) {
      setError('Por favor seleccione un hijo')
      return
    }

    if (!appointmentDate) {
      setError('Por favor seleccione una fecha')
      return
    }

    if (!appointmentTime) {
      setError('Por favor seleccione una hora')
      return
    }

    if (!reason.trim()) {
      setError('Por favor ingrese el motivo de la cita')
      return
    }

    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}:00`)
    const now = new Date()

    if (appointmentDateTime <= now) {
      setError('La fecha y hora de la cita debe ser en el futuro')
      return
    }

    const appointmentData: AppointmentData = {
      dentistId: dentistId,
      childId: selectedChildId,
      reason: reason.trim(),
      appointmentDatetime: `${appointmentDate}T${appointmentTime}:00`
    }

    try {
      setIsLoading(true)
      console.log('Creando cita con datos:', appointmentData)

      await createAppointmentService(appointmentData)

      console.log('Cita creada exitosamente')

      // Llamar al callback del padre
      onSubmit(appointmentData)

      // Limpiar formulario
      handleCancel()

      alert('¡Cita agendada con éxito!')
    } catch (error) {
      console.error('Error al crear la cita:', error)
      setError(error instanceof Error ? error.message : 'Error al agendar la cita')
    } finally {
      setIsLoading(false)
    }
  }

  const childOptions = mockChildren.map((child) => ({
    label: `${child.name} ${child.lastName}`,
    value: child.childId.toString()
  }))

  const handleCancel = (): void => {
    setSelectedChildId(null)
    setAppointmentDate('')
    setAppointmentTime('')
    setReason('')
    setError(null)
    onClose()
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title="Agenda tu cita">
      <form onSubmit={handleSubmit} className={styles.modalContent}>
        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.formGroup}>
          <InputList
            label="Seleccione hijo"
            name="childId"
            value={selectedChildId?.toString() || ''}
            placeholder="Seleccione hijo"
            options={childOptions}
            onChange={(e) => setSelectedChildId(parseInt(e.target.value))}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Ingresa la fecha y horario para la cita</label>
          <div className={styles.dateTimeGroup}>
            <InputForm
              label="Fecha de la cita"
              name="appointmentDate"
              type="date"
              value={appointmentDate}
              placeholder="DD/MM/AAAA"
              onChange={(e) => setAppointmentDate(e.target.value)}
              required
            />
            <InputForm
              label="Hora de la cita"
              name="appointmentTime"
              type="time"
              value={appointmentTime}
              placeholder="HH:MM"
              onChange={(e) => setAppointmentTime(e.target.value)}
              required
            />
          </div>
          {/* ✅ Agregar restricción de fecha mínima */}
          <input type="hidden" min={today} />
        </div>

        <div className={styles.formGroup}>
          <TextareaInput
            label="Motivo de la cita"
            name="reason"
            value={reason}
            placeholder="Describa el motivo de la cita (ej: Limpieza dental, Revisión general, Dolor en muela, etc.)"
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </div>

        <div className={styles.buttonGroup}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button type="submit" className={styles.scheduleButton} disabled={isLoading}>
            {isLoading ? 'Agendando...' : 'Agendar cita'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ScheduleAppointmentModal
