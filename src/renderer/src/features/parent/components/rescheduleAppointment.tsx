import React, { useState, useEffect } from 'react'
import Modal from './modal'
import InputForm from '@renderer/components/inputForm'
import TextareaInput from '@renderer/components/textareaInput'
import { AppointmentResponse } from '../services/appointmentService'
import { getDentistByIdService, DentistResponse } from '../services/dentistService'
import styles from '../styles/rescheduleAppointment.module.css'

interface RescheduleAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (newDateTime: string, reason: string) => void
  appointment: AppointmentResponse | null
  existingAppointments: AppointmentResponse[]
}

const RescheduleAppointmentModal: React.FC<RescheduleAppointmentModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  appointment,
  existingAppointments
}) => {
  const [newDate, setNewDate] = useState<string>('')
  const [newTime, setNewTime] = useState<string>('')
  const [reason, setReason] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [dentist, setDentist] = useState<DentistResponse | null>(null)
  const [isLoadingDentist, setIsLoadingDentist] = useState<boolean>(false)

  useEffect(() => {
    if (isOpen && appointment) {
      // Limpiar formulario
      setNewDate('')
      setNewTime('')
      setReason('')
      setError(null)

      // Cargar información del dentista
      loadDentistInfo()
    }
  }, [isOpen, appointment])

  const loadDentistInfo = async (): Promise<void> => {
    if (!appointment?.dentistId) return

    try {
      setIsLoadingDentist(true)
      const dentistData = await getDentistByIdService(appointment.dentistId)
      setDentist(dentistData)
    } catch (error) {
      console.error('Error al cargar dentista:', error)
      setError('No se pudo cargar la información del dentista')
    } finally {
      setIsLoadingDentist(false)
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

    // Agregar 30 minutos de margen mínimo
    const minAllowedTime = new Date(now.getTime() + 30 * 60000)

    return selectedDateTime > minAllowedTime
  }

  const isWorkingDay = (date: string): boolean => {
    const selectedDate = new Date(date)
    const dayOfWeek = selectedDate.getDay()
    return dayOfWeek >= 1 && dayOfWeek <= 5 // Lunes a viernes
  }

  const isTimeSlotAvailable = (date: string, time: string): boolean => {
    if (!appointment || !existingAppointments) return true

    const selectedMinutes = timeToMinutes(time)

    // Filtrar citas del mismo dentista para el mismo día (excluyendo la cita actual)
    const sameDayAppointments = existingAppointments.filter((apt) => {
      if (apt.appointmentId === appointment.appointmentId) return false
      if (apt.dentistId !== appointment.dentistId) return false
      
      const aptDate = apt.appointmentDatetime.split('T')[0]
      return aptDate === date
    })

    // Verificar conflictos con período de 30 minutos
    for (const existingApt of sameDayAppointments) {
      const existingTime = existingApt.appointmentDatetime.split('T')[1].substring(0, 5)
      const existingMinutes = timeToMinutes(existingTime)

      // Verificar si hay menos de 30 minutos de diferencia
      const timeDifference = Math.abs(selectedMinutes - existingMinutes)
      if (timeDifference < 30) {
        return false
      }
    }

    return true
  }

  const validateDateTime = (date: string, time: string): string | null => {
    if (!appointment) return 'Error: No se encontró la cita'

    // Verificar que no sea la misma fecha y hora actual
    const currentDateTime = appointment.appointmentDatetime
    const currentDate = currentDateTime.split('T')[0]
    const currentTime = currentDateTime.split('T')[1].substring(0, 5)

    if (date === currentDate && time === currentTime) {
      return 'Debe seleccionar una fecha y hora diferente a la actual'
    }

    if (!isWorkingDay(date)) {
      return 'Las citas solo se pueden agendar de lunes a viernes'
    }

    if (!isDateTimeFuture(date, time)) {
      return 'La fecha y hora seleccionadas deben ser futuras (al menos 30 minutos)'
    }

    if (!isTimeWithinServiceHours(time)) {
      return dentist
        ? `La hora debe estar dentro del horario de servicio: ${formatTimeForDisplay(dentist.serviceStartTime)} a ${formatTimeForDisplay(dentist.serviceEndTime)}`
        : 'Horario fuera del servicio del dentista'
    }

    if (!isTimeSlotAvailable(date, time)) {
      return 'El horario seleccionado no está disponible. Debe haber al menos 30 minutos de diferencia con otras citas.'
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
    if (!newDate || newDate === '') {
      return 'Por favor seleccione una fecha'
    }

    if (!newTime || newTime === '') {
      return 'Por favor seleccione una hora'
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(newDate)) {
      return 'Formato de fecha inválido'
    }

    const timeRegex = /^\d{2}:\d{2}$/
    if (!timeRegex.test(newTime)) {
      return 'Formato de hora inválido'
    }

    const appointmentDateTime = new Date(`${newDate}T${newTime}:00`)
    if (isNaN(appointmentDateTime.getTime())) {
      return 'La fecha y hora seleccionadas no son válidas'
    }

    const validationError = validateDateTime(newDate, newTime)
    if (validationError) {
      return validationError
    }

    const now = new Date()
    const maxTime = new Date(now.getTime() + 6 * 30 * 24 * 60 * 60 * 1000) // 6 meses
    if (appointmentDateTime > maxTime) {
      return 'No se pueden reagendar citas con más de 6 meses de anticipación'
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

    return null
  }

  const handleConfirm = (): void => {
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    const newDateTime = `${newDate}T${newTime}:00`
    onConfirm(newDateTime, reason.trim())
    handleClose()
  }

  const handleClose = (): void => {
    setNewDate('')
    setNewTime('')
    setReason('')
    setError(null)
    onClose()
  }

  if (!appointment) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Reagenda la cita">
      <div className={styles.modalContent}>
        {error && <div className={styles.errorMessage}>{error}</div>}

        {isLoadingDentist ? (
          <div className={styles.loading}>Cargando información del dentista...</div>
        ) : (
          <>
            <div className={styles.formGroup}>
              <div className={styles.dateTimeGroup}>
                <div style={{ flex: 1 }}>
                  <InputForm
                    label="Nueva fecha"
                    name="newDate"
                    type="date"
                    value={newDate}
                    placeholder="Nueva fecha"
                    onChange={handleDateChange}
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <InputForm
                    label="Nuevo horario"
                    name="newTime"
                    type="time"
                    value={newTime}
                    placeholder="Nuevo horario"
                    onChange={handleTimeChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <TextareaInput
                label="Motivo por el que se reagenda"
                name="reason"
                value={reason}
                placeholder="Ingresa el motivo de la reprogramación"
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>

            <div className={styles.buttonGroup}>
              <button type="button" className={styles.cancelButton} onClick={handleClose}>
                Regresar
              </button>
              <button
                type="button"
                className={styles.confirmButton}
                onClick={handleConfirm}
                disabled={isLoadingDentist}
              >
                Reagendar cita
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

export default RescheduleAppointmentModal
