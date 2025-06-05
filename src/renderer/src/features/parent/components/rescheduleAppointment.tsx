import React, { useState, useEffect } from 'react'
import Modal from './modal'
import InputForm from '@renderer/components/inputForm'
import TextareaInput from '@renderer/components/textareaInput'
import { AppointmentResponse } from '../services/appointmentService'
import { getDentistByIdService, DentistResponse } from '../services/dentistService'
import { createAppointmentService } from '../services/appointmentService'
import styles from '../styles/rescheduleAppointment.module.css'

interface RescheduleAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (newDateTime: string, reason: string) => Promise<void>
  appointment: AppointmentResponse | null
  existingAppointments: AppointmentResponse[]
  isLoading?: boolean
}

const RescheduleAppointmentModal: React.FC<RescheduleAppointmentModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  appointment,
  existingAppointments,
  isLoading = false
}) => {
  const [newDate, setNewDate] = useState<string>('')
  const [newTime, setNewTime] = useState<string>('')
  const [reason, setReason] = useState<string>('')
  const [dentist, setDentist] = useState<DentistResponse | null>(null)
  const [isLoadingDentist, setIsLoadingDentist] = useState<boolean>(false)
  const [isRescheduling, setIsRescheduling] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && appointment) {
      loadDentistInfo()

      setNewDate('')
      setNewTime('')
      setReason('')
      setError(null)
    }
  }, [isOpen, appointment])

  const loadDentistInfo = async (): Promise<void> => {
    if (!appointment?.dentistId) return

    try {
      setIsLoadingDentist(true)
      const dentistData = await getDentistByIdService(appointment.dentistId)
      setDentist(dentistData)
    } catch (error) {
      console.error('Error al cargar información del dentista:', error)
      setError('Error al cargar información del dentista')
    } finally {
      setIsLoadingDentist(false)
    }
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

  const isTimeWithinServiceHours = (time: string): boolean => {
    if (!dentist || !time) return false

    const timeToMinutes = (timeString: string): number => {
      const [hours, minutes] = timeString.split(':').map(Number)
      return hours * 60 + minutes
    }

    const selectedMinutes = timeToMinutes(time)
    const startMinutes = timeToMinutes(dentist.serviceStartTime)
    const endMinutes = timeToMinutes(dentist.serviceEndTime)

    return selectedMinutes >= startMinutes && selectedMinutes <= endMinutes
  }

  const isWorkingDay = (date: string): boolean => {
    const selectedDate = new Date(date)
    const dayOfWeek = selectedDate.getDay()
    return dayOfWeek >= 0 && dayOfWeek <= 6
  }

  const isDateTimeFuture = (date: string, time: string): boolean => {
    if (!date || !time) return false

    const selectedDateTime = new Date(`${date}T${time}:00`)
    const now = new Date()

    const minAllowedTime = new Date(now.getTime() + 30 * 60000)

    return selectedDateTime > minAllowedTime
  }

  const isTimeSlotAvailable = (date: string, time: string): boolean => {
    if (!appointment?.dentistId) return true

    const selectedDateTime = new Date(`${date}T${time}:00`)

    const conflictingAppointments = existingAppointments.filter(
      (apt) =>
        apt.dentistId === appointment.dentistId &&
        apt.appointmentId !== appointment.appointmentId &&
        apt.isActive &&
        new Date(apt.appointmentDatetime).toDateString() === selectedDateTime.toDateString()
    )

    for (const apt of conflictingAppointments) {
      const aptDateTime = new Date(apt.appointmentDatetime)
      const timeDiff = Math.abs(selectedDateTime.getTime() - aptDateTime.getTime())
      const minutesDiff = timeDiff / (1000 * 60)

      if (minutesDiff < 30) {
        return false
      }
    }

    return true
  }

  const validateDateTime = (date: string, time: string): string | null => {
    if (!isWorkingDay(date)) {
      return 'Las citas solo se pueden agendar de lunes a viernes'
    }

    if (!isDateTimeFuture(date, time)) {
      return 'La fecha y hora seleccionadas deben ser futuras'
    }

    if (!isTimeWithinServiceHours(time)) {
      return dentist
        ? `La hora debe estar dentro del horario de servicio: ${formatTimeForDisplay(dentist.serviceStartTime)} a ${formatTimeForDisplay(dentist.serviceEndTime)}`
        : 'Horario fuera del servicio del dentista'
    }

    if (!isTimeSlotAvailable(date, time)) {
      return 'Este horario no está disponible'
    }

    return null
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const date = e.target.value
    setNewDate(date)

    if (newTime && date) {
      const validationError = validateDateTime(date, newTime)
      setError(validationError)
    }
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const time = e.target.value
    setNewTime(time)

    if (newDate && time) {
      const validationError = validateDateTime(newDate, time)
      setError(validationError)
    }
  }

  const validateForm = (): string | null => {
    if (!newDate || !newTime) {
      return 'Por favor seleccione una fecha y hora'
    }

    if (!reason.trim()) {
      return 'Por favor ingrese el motivo del reagendamiento'
    }

    if (reason.trim().length < 5) {
      return 'El motivo debe tener al menos 5 caracteres'
    }

    if (reason.trim().length > 255) {
      return 'El motivo no puede tener más de 255 caracteres'
    }

    return validateDateTime(newDate, newTime)
  }

  const handleConfirm = async (): Promise<void> => {
    if (!appointment) return

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    const newDateTime = `${newDate}T${newTime}:00`

    try {
      setIsRescheduling(true)
      setError(null)

      await onConfirm(newDateTime, reason.trim())

      const newAppointmentData = {
        dentistId: appointment.dentistId!,
        childId: appointment.childId!,
        reason: appointment.reason,
        appointmentDatetime: newDateTime
      }

      await createAppointmentService(newAppointmentData)

      handleClose()
    } catch (error) {
      console.error('Error al reagendar la cita:', error)
      setError(error instanceof Error ? error.message : 'Error al reagendar la cita')
    } finally {
      setIsRescheduling(false)
    }
  }

  const handleClose = (): void => {
    if (isLoading || isRescheduling) return
    setNewDate('')
    setNewTime('')
    setReason('')
    setError(null)
    onClose()
  }

  if (!appointment) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Reagendar cita">
      <div className={styles.modalContent}>
        {error && <div className={styles.errorMessage}>{error}</div>}

        {(isLoading || isRescheduling) && (
          <div className={styles.loadingIndicator}>
            <p>{isRescheduling ? 'Reagendando cita...' : 'Cargando...'}</p>
          </div>
        )}

        {isLoadingDentist ? (
          <div className={styles.loading}>Cargando información del dentista...</div>
        ) : (
          <>
            {/* Nueva fecha y hora */}
            <div className={styles.formGroup}>
              <div className={styles.dateTimeGroup}>
                <div>
                  <InputForm
                    label="Nueva fecha"
                    name="newDate"
                    type="date"
                    value={newDate}
                    placeholder="Ingresa la nueva fecha para la cita"
                    onChange={handleDateChange}
                    required
                  />
                </div>
                <div>
                  <InputForm
                    label="Nuevo horario"
                    name="newTime"
                    type="time"
                    value={newTime}
                    placeholder="Ingresa el nuevo horario para la cita"
                    onChange={handleTimeChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Motivo del reagendamiento */}
            <div className={styles.formGroup}>
              <TextareaInput
                label="Motivo por el que se reagenda"
                name="reason"
                value={reason}
                placeholder="Motivo por el que se reagenda"
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>

            {/* Botones de acción */}
            <div className={styles.buttonGroup}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={handleClose}
                disabled={isLoading || isRescheduling}
              >
                Regresar
              </button>
              <button
                type="button"
                className={styles.confirmButton}
                onClick={handleConfirm}
                disabled={
                  isLoadingDentist ||
                  isLoading ||
                  isRescheduling ||
                  !newDate ||
                  !newTime ||
                  !reason.trim()
                }
              >
                {isRescheduling ? 'Reagendando...' : 'Reagendar cita'}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

export default RescheduleAppointmentModal
