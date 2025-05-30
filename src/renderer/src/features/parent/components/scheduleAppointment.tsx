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

  // Limpiar formulario cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      resetForm()
    }
  }, [isOpen])

  const resetForm = () => {
    setSelectedChildId(children.length > 0 ? children[0].childId : null)
    setAppointmentDate('')
    setAppointmentTime('')
    setReason('')
    setError(null)
  }

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
      setError(
        'Error al cargar la lista de hijos. Por favor, verifica que tengas hijos registrados.'
      )
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
    if (!appointmentDate || appointmentDate === '') {
      return 'Por favor seleccione una fecha'
    }

    // Validar hora
    if (!appointmentTime || appointmentTime === '') {
      return 'Por favor seleccione una hora'
    }

    // Validar formato de fecha
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(appointmentDate)) {
      return 'Formato de fecha inválido'
    }

    // Validar formato de hora
    const timeRegex = /^\d{2}:\d{2}$/
    if (!timeRegex.test(appointmentTime)) {
      return 'Formato de hora inválido'
    }

    // Validar que la fecha sea válida
    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}:00`)

    if (isNaN(appointmentDateTime.getTime())) {
      return 'La fecha y hora seleccionadas no son válidas'
    }

    // Validar motivo
    if (!reason.trim()) {
      return 'Por favor ingrese el motivo de la cita'
    }

    if (reason.trim().length < 10) {
      return 'El motivo debe tener al menos 10 caracteres'
    }

    if (reason.trim().length > 255) {
      return 'El motivo no puede tener más de 255 caracteres'
    }

    // Validar que la fecha y hora sean futuras (más permisivo)
    const now = new Date()
    const minTime = new Date(now.getTime() + 10 * 60000) // 10 minutos en el futuro

    if (appointmentDateTime <= minTime) {
      return 'La cita debe ser al menos 10 minutos en el futuro'
    }

    // Validar que no sea más de 6 meses en el futuro
    const maxTime = new Date(now.getTime() + 6 * 30 * 24 * 60 * 60 * 1000) // ~6 meses
    if (appointmentDateTime > maxTime) {
      return 'No se pueden agendar citas con más de 6 meses de anticipación'
    }

    // Validar horario de trabajo más flexible (7:00 AM - 7:00 PM)
    const hour = appointmentDateTime.getHours()
    if (hour < 7 || hour >= 19) {
      return 'Las citas solo se pueden agendar entre 7:00 AM y 7:00 PM'
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

    // Validar que tenemos fecha y hora válidas
    if (!appointmentDate || !appointmentTime) {
      setError('Por favor selecciona una fecha y hora válidas')
      return
    }

    // Preparar datos de la cita - crear objeto Date para validar
    const appointmentDateTime = `${appointmentDate}T${appointmentTime}:00`

    // Validar que la fecha construida sea válida
    const testDate = new Date(appointmentDateTime)
    if (isNaN(testDate.getTime())) {
      setError('La fecha y hora seleccionadas no son válidas')
      return
    }

    const appointmentData: AppointmentData = {
      dentistId: dentistId,
      childId: selectedChildId,
      reason: reason.trim(),
      appointmentDatetime: appointmentDateTime
    }

    try {
      setIsLoading(true)
      console.log('Creando cita con datos:', appointmentData)

      await createAppointmentService(appointmentData)

      console.log('Cita creada exitosamente')

      // Llamar al callback del padre
      onSubmit(appointmentData)

      // Cerrar modal y limpiar formulario
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
    resetForm()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title="Agenda tu cita">
      <form onSubmit={handleSubmit} className={styles.modalContent}>
        {error && <div className={styles.errorMessage}>{error}</div>}

        {isLoadingChildren ? (
          <div className={styles.loading}>Cargando hijos...</div>
        ) : children.length === 0 ? (
          <div className={styles.errorMessage}>
            No tienes hijos registrados. Por favor, agrega un hijo primero desde la pantalla
            principal.
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
              <label className={styles.label}>Fecha y horario para la cita</label>
              <div className={styles.dateTimeGroup}>
                <div style={{ flex: 1 }}>
                  <InputForm
                    label="Fecha de la cita"
                    name="appointmentDate"
                    type="date"
                    value={appointmentDate}
                    placeholder="DD/MM/AAAA"
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
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
              </div>
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
