import React, { useState, useEffect } from 'react'
import Modal from './modal'
import InputForm from '@renderer/components/inputForm'
import InputList from '@renderer/components/inputList'
import TextareaInput from '@renderer/components/textareaInput'
import { createAppointmentService, AppointmentData } from '../services/appointmentService'
import { getChildrenService, ChildResponse } from '../services/childService'
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
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null)
  const [appointmentDate, setAppointmentDate] = useState<string>('')
  const [appointmentTime, setAppointmentTime] = useState<string>('')
  const [reason, setReason] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isLoadingChildren, setIsLoadingChildren] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar hijos cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      loadChildren()
    }
  }, [isOpen])

  const loadChildren = async () => {
    try {
      setIsLoadingChildren(true)
      setError(null)

      console.log('Cargando hijos desde la API...')
      const childrenData = await getChildrenService()

      console.log('Hijos cargados:', childrenData)
      setChildren(childrenData)

      // Seleccionar el primer hijo por defecto si existe
      if (childrenData.length > 0) {
        setSelectedChildId(childrenData[0].childId)
      }
    } catch (error) {
      console.error('Error al cargar hijos:', error)
      setError('Error al cargar la lista de hijos. Por favor, inténtelo de nuevo.')
      setChildren([])
    } finally {
      setIsLoadingChildren(false)
    }
  }

  const validateForm = (): string | null => {
    // Validar hijo seleccionado
    if (!selectedChildId) {
      return 'Por favor seleccione un hijo'
    }

    // Validar fecha
    if (!appointmentDate) {
      return 'Por favor seleccione una fecha'
    }

    // Validar hora
    if (!appointmentTime) {
      return 'Por favor seleccione una hora'
    }

    // Validar motivo
    if (!reason.trim()) {
      return 'Por favor ingrese el motivo de la cita'
    }

    if (reason.trim().length < 10) {
      return 'El motivo debe tener al menos 10 caracteres'
    }

    // Validar que la fecha y hora sean futuras
    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}:00`)
    const now = new Date()
    const minTime = new Date(now.getTime() + 30 * 60000)

    if (appointmentDateTime <= minTime) {
      return 'La cita debe ser al menos 30 minutos en el futuro'
    }

    // Validar horario de trabajo (8:00 AM - 6:00 PM)
    const hour = appointmentDateTime.getHours()
    if (hour < 8 || hour >= 18) {
      return 'Las citas solo se pueden agendar entre 8:00 AM y 6:00 PM'
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validar formulario
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    if (!selectedChildId) {
      setError('Error interno: ID de hijo no válido')
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

      // Limpiar formulario y cerrar modal
      handleCancel()

      // Mostrar mensaje de éxito
      alert('¡Cita agendada con éxito!')
    } catch (error) {
      console.error('Error al crear la cita:', error)
      setError(error instanceof Error ? error.message : 'Error al agendar la cita')
    } finally {
      setIsLoading(false)
    }
  }

  const childOptions = children.map((child) => ({
    label: `${child.name} ${child.lastName}`,
    value: child.childId.toString()
  }))

  const handleCancel = (): void => {
    setSelectedChildId(children.length > 0 ? children[0].childId : null)
    setAppointmentDate('')
    setAppointmentTime('')
    setReason('')
    setError(null)
    onClose()
  }

  // Obtener fecha mínima (mañana)
  const getMinDate = (): string => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  // Obtener fecha máxima (6 meses en el futuro)
  const getMaxDate = (): string => {
    const maxDate = new Date()
    maxDate.setMonth(maxDate.getMonth() + 6)
    return maxDate.toISOString().split('T')[0]
  }

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title="Agenda tu cita">
      <form onSubmit={handleSubmit} className={styles.modalContent}>
        {error && <div className={styles.errorMessage}>{error}</div>}

        {isLoadingChildren ? (
          <div className={styles.loading}>Cargando hijos...</div>
        ) : children.length === 0 ? (
          <div className={styles.errorMessage}>
            No tienes hijos registrados. Por favor, agrega un hijo primero.
          </div>
        ) : (
          <>
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
              {/* Agregar restricciones de fecha */}
              <input type="hidden" min={getMinDate()} max={getMaxDate()} />
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
              <small style={{ color: '#666', fontSize: '12px' }}>
                Mínimo 10 caracteres. Caracteres actuales: {reason.length}
              </small>
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
              <button
                type="submit"
                className={styles.scheduleButton}
                disabled={isLoading || isLoadingChildren || children.length === 0}
              >
                {isLoading ? 'Agendando...' : 'Agendar cita'}
              </button>
            </div>
          </>
        )}
      </form>
    </Modal>
  )
}

export default ScheduleAppointmentModal
