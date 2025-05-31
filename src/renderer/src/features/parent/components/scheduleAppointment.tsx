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
  onSuccess?: () => void
  dentistId: number
}

const ScheduleAppointmentModal: React.FC<ScheduleAppointmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onSuccess,
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

  useEffect(() => {
    if (isOpen && !showSuccess) {
      loadChildren()

      const loadDentist = async (): Promise<void> => {
        try {
          setIsLoadingDentist(true)
          const dentistData = await getDentistByIdService(dentistId)
          setDentist(dentistData)
        } catch (error) {
          console.error('Error al cargar dentista:', error)
          setError('Error al cargar información del dentista')
        } finally {
          setIsLoadingDentist(false)
        }
      }

      loadDentist()
    }
  }, [isOpen, showSuccess, dentistId])

  useEffect(() => {
    if (!isOpen) {
      setSelectedChildId(children.length > 0 ? children[0].childId : null)
      setAppointmentDate('')
      setAppointmentTime('')
      setReason('')
      setError(null)
      setShowSuccess(false)
    }
  }, [isOpen, children])

  const resetForm = (): void => {
    setSelectedChildId(children.length > 0 ? children[0].childId : null)
    setAppointmentDate('')
    setAppointmentTime('')
    setReason('')
    setError(null)
  }

  const loadChildren = async (): Promise<void> => {
    try {
      setIsLoadingChildren(true)
      setError(null)

      const childrenData = await getChildrenService()

      setChildren(childrenData)

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

  const timeToMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number)
    return hours * 60 + minutes
  }

  const isTimeWithinServiceHours = (time: string): boolean => {
    if (!dentist || !time) return false

    const selectedMinutes = timeToMinutes(time)
    const startMinutes = timeToMinutes(dentist.serviceStartTime)
    const endMinutes = timeToMinutes(dentist.serviceEndTime)

    return selectedMinutes >= startMinutes && selectedMinutes <= endMinutes
  }

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

  const isWorkingDay = (date: string): boolean => {
    const selectedDate = new Date(date)
    const dayOfWeek = selectedDate.getDay()
    return dayOfWeek >= 0 && dayOfWeek <= 4
  }

  const validateForm = (): string | null => {
    if (!selectedChildId) {
      return 'Por favor seleccione un hijo'
    }

    if (!appointmentDate || appointmentDate === '') {
      return 'Por favor seleccione una fecha'
    }

    if (!appointmentTime || appointmentTime === '') {
      return 'Por favor seleccione una hora'
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(appointmentDate)) {
      return 'Formato de fecha inválido'
    }

    const timeRegex = /^\d{2}:\d{2}$/
    if (!timeRegex.test(appointmentTime)) {
      return 'Formato de hora inválido'
    }

    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}:00`)

    if (isNaN(appointmentDateTime.getTime())) {
      return 'La fecha y hora seleccionadas no son válidas'
    }

    if (!isWorkingDay(appointmentDate)) {
      return 'Las citas solo se pueden agendar de lunes a viernes'
    }

    if (!isDateTimeFuture(appointmentDate, appointmentTime)) {
      return 'La cita debe ser agendada con al menos 30 minutos de anticipación'
    }

    const now = new Date()
    const maxTime = new Date(now.getTime() + 6 * 30 * 24 * 60 * 60 * 1000)
    if (appointmentDateTime > maxTime) {
      return 'No se pueden agendar citas con más de 6 meses de anticipación'
    }

    if (!isTimeWithinServiceHours(appointmentTime)) {
      if (dentist) {
        return `La hora debe estar dentro del horario de servicio del dentista: ${formatTimeForDisplay(dentist.serviceStartTime)} a ${formatTimeForDisplay(dentist.serviceEndTime)}`
      } else {
        return 'No se pudo validar el horario de servicio del dentista'
      }
    }

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

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newDate = e.target.value
    setAppointmentDate(newDate)

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

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newTime = e.target.value
    setAppointmentTime(newTime)

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

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setError(null)

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    if (!selectedChildId) {
      setError('Error interno: ID de hijo no válido')
      return
    }

    if (!appointmentDate || !appointmentTime) {
      setError('Por favor selecciona una fecha y hora válidas')
      return
    }

    const appointmentDateTime = `${appointmentDate}T${appointmentTime}:00`

    const testDate = new Date(appointmentDateTime)
    if (isNaN(testDate.getTime())) {
      setError('La fecha y hora seleccionadas no son válidas')
      return
    }

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

      await createAppointmentService(appointmentData)

      onSubmit(appointmentData)

      setShowSuccess(true)
    } catch (error) {
      console.error('Error al crear la cita:', error)
      setError(error instanceof Error ? error.message : 'Error al agendar la cita')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuccessContinue = (): void => {
    setShowSuccess(false)

    resetForm()

    if (onSuccess) {
      setTimeout(() => {
        onSuccess()
      }, 100)
    } else {
      onClose()
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

  if (showSuccess) {
    return <AppointmentSuccess isOpen={true} onContinue={handleSuccessContinue} />
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
