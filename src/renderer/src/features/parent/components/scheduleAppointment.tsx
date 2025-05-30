import React, { useState, useEffect } from 'react'
import Modal from './modal'
import AppointmentSuccess from './appointmentSuccess'
import InputForm from '@renderer/components/inputForm'
import InputList from '@renderer/components/inputList'
import TextareaInput from '@renderer/components/textareaInput'
import { createAppointmentService, AppointmentData } from '../services/appointmentService'
import { getChildrenService, ChildResponse } from '../services/childService'
import { getDentistByIdService, DentistResponse } from '../services/dentistService'
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
  const [dentist, setDentist] = useState<DentistResponse | null>(null)
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null)
  const [appointmentDate, setAppointmentDate] = useState<string>('')
  const [appointmentTime, setAppointmentTime] = useState<string>('')
  const [reason, setReason] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isLoadingChildren, setIsLoadingChildren] = useState<boolean>(false)
  const [isLoadingDentist, setIsLoadingDentist] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState<boolean>(false)

  // Cargar hijos y dentista cuando se abre el modal
  useEffect(() => {
    if (isOpen && !showSuccess) {
      loadChildren()
      loadDentist()
    }
  }, [isOpen, showSuccess, dentistId])

  // Limpiar formulario cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      resetForm()
      setShowSuccess(false)
    }
  }, [isOpen])

  const resetForm = () => {
    setSelectedChildId(children.length > 0 ? children[0].childId : null)
    setAppointmentDate('')
    setAppointmentTime('')
    setReason('')
    setError(null)
  }

  const loadDentist = async () => {
    try {
      setIsLoadingDentist(true)
      console.log('Cargando datos del dentista:', dentistId)
      const dentistData = await getDentistByIdService(dentistId)
      console.log('Dentista cargado:', dentistData)
      setDentist(dentistData)
    } catch (error) {
      console.error('Error al cargar dentista:', error)
      setError('Error al cargar información del dentista')
    } finally {
      setIsLoadingDentist(false)
    }
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

  // Función para convertir hora en formato HH:MM a minutos desde medianoche
  const timeToMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number)
    return hours * 60 + minutes
  }

  // Función para validar si la hora está dentro del horario de servicio del dentista
  const isTimeWithinServiceHours = (time: string): boolean => {
    if (!dentist || !time) return false

    const selectedMinutes = timeToMinutes(time)
    const startMinutes = timeToMinutes(dentist.serviceStartTime)
    const endMinutes = timeToMinutes(dentist.serviceEndTime)

    return selectedMinutes >= startMinutes && selectedMinutes <= endMinutes
  }

  // Función para formatear hora para mostrar al usuario
  const formatTimeForDisplay = (timeString: string): string => {
    if (!timeString) return ''
    try {
      const [hours, minutes] = timeString.split(':')
      const hour24 = parseInt(hours)
      const period = hour24 >= 12 ? 'PM' : 'AM'
      const hour12 = hour24 % 12 || 12
      return `${hour12}:${minutes} ${period}`
    } catch {
      return timeString
    }
  }
  const isDateTimeFuture = (date: string, time: string): boolean => {
    if (!date || !time) return false

    const selectedDateTime = new Date(`${date}T${time}:00`)
    const now = new Date()

    //Agregar 30 minutos de margen mínimo
    const minAllowedTime = new Date(now.getTime() + 30 * 60000)

    return selectedDateTime > minAllowedTime
  }

  // Función para validar si es día de trabajo (lunes a viernes)
  const isWorkingDay = (date: string): boolean => {
    const selectedDate = new Date(date)
    const dayOfWeek = selectedDate.getDay()
    return dayOfWeek >= 0 && dayOfWeek <= 4
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

    // Validar que sea día de trabajo
    if (!isWorkingDay(appointmentDate)) {
      return 'Las citas solo se pueden agendar de lunes a viernes'
    }

    // Validar que la fecha y hora sean futuras
    if (!isDateTimeFuture(appointmentDate, appointmentTime)) {
      return 'La cita debe ser agendada con al menos 30 minutos de anticipación'
    }

    // Validar que no sea más de 6 meses en el futuro
    const now = new Date()
    const maxTime = new Date(now.getTime() + 6 * 30 * 24 * 60 * 60 * 1000) // ~6 meses
    if (appointmentDateTime > maxTime) {
      return 'No se pueden agendar citas con más de 6 meses de anticipación'
    }

    // Validar que la hora esté dentro del horario de servicio del dentista
    if (!isTimeWithinServiceHours(appointmentTime)) {
      if (dentist) {
        return `La hora debe estar dentro del horario de servicio del dentista: ${formatTimeForDisplay(dentist.serviceStartTime)} a ${formatTimeForDisplay(dentist.serviceEndTime)}`
      } else {
        return 'No se pudo validar el horario de servicio del dentista'
      }
    }

    // Validar motivo
    if (!reason.trim()) {
      return 'Por favor ingrese el motivo de la cita'
    }

    if (reason.trim().length < 5) {
      return 'El motivo debe tener al menos 5 caracteres'
    }

    if (reason.trim().length > 255) {
      return 'El motivo no puede tener más de 255 caracteres'
    }

    return null
  }

  // Función para manejar cambio de fecha
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value
    setAppointmentDate(newDate)

    // Si ya hay una hora seleccionada, validar la combinación
    if (appointmentTime && newDate) {
      if (!isDateTimeFuture(newDate, appointmentTime)) {
        setError('La fecha y hora seleccionadas deben ser futuras')
      } else if (!isWorkingDay(newDate)) {
        setError('Las citas solo se pueden agendar de lunes a viernes')
      } else if (!isTimeWithinServiceHours(appointmentTime)) {
        setError(
          dentist
            ? `La hora debe estar dentro del horario de servicio: ${formatTimeForDisplay(dentist.serviceStartTime)} a ${formatTimeForDisplay(dentist.serviceEndTime)}`
            : 'Horario fuera del servicio del dentista'
        )
      } else {
        setError(null)
      }
    }
  }

  // Función para manejar cambio de hora
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value
    setAppointmentTime(newTime)

    // Si ya hay una fecha seleccionada, validar la combinación
    if (appointmentDate && newTime) {
      if (!isDateTimeFuture(appointmentDate, newTime)) {
        setError('La fecha y hora seleccionadas deben ser futuras')
      } else if (!isTimeWithinServiceHours(newTime)) {
        setError(
          dentist
            ? `La hora debe estar dentro del horario de servicio: ${formatTimeForDisplay(dentist.serviceStartTime)} a ${formatTimeForDisplay(dentist.serviceEndTime)}`
            : 'Horario fuera del servicio del dentista'
        )
      } else {
        setError(null)
      }
    }
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

    // Validación final de tiempo futuro antes de enviar
    if (!isDateTimeFuture(appointmentDate, appointmentTime)) {
      setError('La cita debe ser agendada con al menos 30 minutos de anticipación')
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

      // Mostrar pantalla de éxito
      setShowSuccess(true)
    } catch (error) {
      console.error('Error al crear la cita:', error)
      setError(error instanceof Error ? error.message : 'Error al agendar la cita')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuccessContinue = () => {
    setShowSuccess(false)
    resetForm()
    onClose()
  }

  const childOptions = children.map((child) => ({
    label: `${child.name} ${child.lastName}`,
    value: child.childId.toString()
  }))

  const handleCancel = (): void => {
    resetForm()
    onClose()
  }

  // Si debe mostrar la pantalla de éxito
  if (showSuccess) {
    return <AppointmentSuccess isOpen={isOpen} onContinue={handleSuccessContinue} />
  }

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title="Agenda tu cita">
      <form onSubmit={handleSubmit} className={styles.modalContent}>
        {error && <div className={styles.errorMessage}>{error}</div>}

        {isLoadingChildren || isLoadingDentist ? (
          <div className={styles.loading}>
            {isLoadingChildren && 'Cargando hijos...'}
            {isLoadingDentist && 'Cargando información del dentista...'}
          </div>
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
              <div className={styles.dateTimeGroup}>
                <div style={{ flex: 1 }}>
                  <InputForm
                    label="Fecha de la cita"
                    name="appointmentDate"
                    type="date"
                    value={appointmentDate}
                    placeholder="DD/MM/AAAA"
                    onChange={handleDateChange}
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <InputForm
                    label={
                      dentist
                        ? `Hora de la cita (${formatTimeForDisplay(dentist.serviceStartTime)} - ${formatTimeForDisplay(dentist.serviceEndTime)})`
                        : 'Hora de la cita'
                    }
                    name="appointmentTime"
                    type="time"
                    value={appointmentTime}
                    placeholder="HH:MM"
                    onChange={handleTimeChange}
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
                placeholder="Describa el motivo de la cita "
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
                disabled={
                  isLoading ||
                  isLoadingChildren ||
                  isLoadingDentist ||
                  children.length === 0 ||
                  !dentist
                }
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
