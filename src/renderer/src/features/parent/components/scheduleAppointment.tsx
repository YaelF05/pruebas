import React, { useState, useEffect } from 'react'
import Modal from './modal'
import InputForm from '@renderer/components/inputForm'
import InputList from '@renderer/components/inputList'
import TextareaInput from '@renderer/components/textareaInput'
import { getChildrenService, ChildResponse } from '../services/childService'
import { createAppointmentService, AppointmentData } from '../services/appointmentService'
import styles from '../styles/scheduleAppointment.module.css'

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
  const [children, setChildren] = useState<ChildResponse[]>([])
  const [selectedChild, setSelectedChild] = useState<number | null>(null)
  const [appointmentDate, setAppointmentDate] = useState<string>('')
  const [appointmentTime, setAppointmentTime] = useState<string>('')
  const [reason, setReason] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Efecto para cargar la lista de hijos
  useEffect(() => {
    const fetchChildren = async () => {
      if (!isOpen) return

      try {
        setIsLoading(true)
        setError(null)
        const childrenData = await getChildrenService()
        setChildren(childrenData)
      } catch (error) {
        console.error('Error al cargar los hijos:', error)
        setError('No se pudieron cargar los datos de los hijos')
      } finally {
        setIsLoading(false)
      }
    }

    fetchChildren()
  }, [isOpen])

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

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

    // Combinar fecha y hora para el datetime
    const appointmentDatetime = `${appointmentDate}T${appointmentTime}:00`

    const appointmentData: AppointmentData = {
      childId: selectedChild,
      dentistId: dentistId,
      reason: reason.trim(),
      appointmentDatetime
    }

    try {
      setIsLoading(true)
      await createAppointmentService(appointmentData)

      // Llamar al callback del padre con los datos
      onSubmit(appointmentData)

      // Limpiar el formulario
      handleCancel()
    } catch (error) {
      console.error('Error al crear la cita:', error)
      setError(error instanceof Error ? error.message : 'Error al agendar la cita')
    } finally {
      setIsLoading(false)
    }
  }

  // Opciones para el selector de hijos
  const childOptions = children.map((child) => ({
    label: `${child.name} ${child.lastName}`,
    value: child.childId.toString()
  }))

  // Reset del formulario
  const handleCancel = (): void => {
    setSelectedChild(null)
    setAppointmentDate('')
    setAppointmentTime('')
    setReason('')
    setError(null)
    onClose()
  }

  // Obtener la fecha mínima (hoy)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const today = new Date().toISOString().split('T')[0]

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title="Agenda tu cita">
      {isLoading && children.length === 0 ? (
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
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleCancel}
              disabled={isLoading}
            >
              Regresar
            </button>
            <button type="submit" className={styles.scheduleButton} disabled={isLoading}>
              {isLoading ? 'Agendando...' : 'Agendar cita'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}

export default ScheduleAppointmentModal
