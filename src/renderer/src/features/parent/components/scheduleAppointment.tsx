import React, { useState, useEffect } from 'react'
import Modal from './modal'
import InputForm from '@renderer/components/inputForm'
import InputList from '@renderer/components/inputList'
import TextareaInput from '@renderer/components/textareaInput'
import styles from '../styles/scheduleAppointment.module.css'

interface ScheduleAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (appointmentData: AppointmentData) => void
  userId: string | undefined
}

interface Child {
  childId: number
  name: string
  lastName: string
}

interface AppointmentData {
  childId: number
  appointmentDate: string
  appointmentTime: string
  reason: string
}

const ScheduleAppointmentModal: React.FC<ScheduleAppointmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<number | null>(null)
  const [appointmentDate, setAppointmentDate] = useState<string>('')
  const [appointmentTime, setAppointmentTime] = useState<string>('')
  const [reason, setReason] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Efecto para cargar la lista de hijos
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const fetchChildren = async () => {
      try {
        setIsLoading(true)
        // Aquí iría la llamada a la API para obtener los hijos
        // Por ahora, usamos datos de ejemplo
        const mockChildren: Child[] = [
          { childId: 1, name: 'Jhon', lastName: 'Doe' },
          { childId: 2, name: 'María', lastName: 'García' }
        ]
        setChildren(mockChildren)
        setIsLoading(false)
      } catch (error) {
        console.error('Error al cargar los hijos:', error)
        setError('No se pudieron cargar los datos de los hijos')
        setIsLoading(false)
      }
    }

    if (isOpen) {
      fetchChildren()
    }
  }, [isOpen])

  // Función para manejar el envío del formulario
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validación básica
    if (!selectedChild) {
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

    const appointmentData: AppointmentData = {
      childId: selectedChild,
      appointmentDate,
      appointmentTime,
      reason
    }

    onSubmit(appointmentData)
  }

  // Opciones para el selector de hijos
  const childOptions = children.map((child) => ({
    label: `${child.name} ${child.lastName}`,
    value: child.childId.toString()
  }))

  // Reset del formulario
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleCancel = () => {
    setSelectedChild(null)
    setAppointmentDate('')
    setAppointmentTime('')
    setReason('')
    setError(null)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Agenda tu cita">
      {isLoading ? (
        <div className={styles.loading}>Cargando...</div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.modalContent}>
          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.formGroup}>
            <InputList
              label="Seleccione hijo"
              name="childId"
              value={selectedChild?.toString() || ''}
              placeholder="Seleccione hijo"
              options={childOptions}
              onChange={(e) => setSelectedChild(parseInt(e.target.value))}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Ingresa la fecha y horario para la cita</label>
            <div className={styles.dateTimeGroup}>
              <InputForm
                label="Nueva fecha"
                name="appointmentDate"
                type="date"
                value={appointmentDate}
                placeholder="DD/MM/AAAA"
                onChange={(e) => setAppointmentDate(e.target.value)}
                required
              />
              <InputForm
                label="Nuevo horario"
                name="appointmentTime"
                type="time"
                value={appointmentTime}
                placeholder="HH:MM"
                onChange={(e) => setAppointmentTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <TextareaInput
              label="Motivo de la cita"
              name="reason"
              value={reason}
              placeholder="Describa el motivo de la cita"
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          <div className={styles.buttonGroup}>
            <button type="button" className={styles.cancelButton} onClick={handleCancel}>
              Regresar
            </button>
            <button type="submit" className={styles.scheduleButton}>
              Agendar cita
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}

export default ScheduleAppointmentModal
