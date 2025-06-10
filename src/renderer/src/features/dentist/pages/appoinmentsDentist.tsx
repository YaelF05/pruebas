import React, { useState, useEffect } from 'react'
import styles from '../styles/appointmentsDentist.module.css'
import NavBar from '../components/navBar'
import Calendar from '@renderer/components/calendar'
import AppointmentCard from '@renderer/components/appointmentCard'
import { getAppointmentsService } from '@renderer/features/parent/services/appointmentService'
import { AppointmentResponse } from '../types/dentistTypes'

const AppointmentDentist: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [allAppointments, setAllAppointments] = useState<AppointmentResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAppointments = async (): Promise<void> => {
      try {
        setLoading(true)
        setError(null)
        const appointments = await getAppointmentsService()
        setAllAppointments(appointments)
      } catch (error) {
        console.error('Error fetching appointments:', error)
        setError('Error al cargar las citas')
      } finally {
        setLoading(false)
      }
    }

    loadAppointments()
  }, [])

  const getAppointmentsForDate = (date: Date): AppointmentResponse[] => {
    return allAppointments.filter((appointment) => {
      if (!appointment.isActive) return false

      const appointmentDate = new Date(appointment.appointmentDatetime)
      return (
        appointmentDate.getDate() === date.getDate() &&
        appointmentDate.getMonth() === date.getMonth() &&
        appointmentDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const appointments = getAppointmentsForDate(selectedDate)

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'long'
    }).format(date)
  }

  const handleReschedule = (appointmentId: string): void => {
    console.log('Reprogramar cita con ID:', appointmentId)
  }

  const handleCancel = (appointmentId: string): void => {
    console.log('Cancelar cita con ID:', appointmentId)
  }

  const calculateMinutesUntil = (appointmentDateTime: string): number => {
    const appointmentTime = new Date(appointmentDateTime)
    const now = new Date()
    const diffMs = appointmentTime.getTime() - now.getTime()
    return Math.floor(diffMs / 60000)
  }

  const formatTime = (dateTimeString: string): string => {
    const date = new Date(dateTimeString)
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.container}>
          <div className={styles.mainContent}>
            <div className={styles.header}>
              <p className={styles.loading}>Cargando citas...</p>
            </div>
          </div>
          <NavBar />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.container}>
          <div className={styles.mainContent}>
            <div className={styles.header}>
              <p className={styles.loading}>Error</p>
              <p>{error}</p>
            </div>
          </div>
          <NavBar />
        </div>
      </div>
    )
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <div className={styles.mainContent}>
          <div className={styles.header}>
            <h1 className={styles.title}>Citas agendadas</h1>
            <div className={styles.calendarContainer}>
              <Calendar selectedDate={selectedDate} onDateChange={setSelectedDate} />
            </div>
          </div>
          <div className={styles.appointments}>
            {appointments.length > 0 ? (
              appointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.appointmentId}
                  id={appointment.appointmentId.toString()}
                  patientName={appointment.child || 'Paciente desconocido'}
                  time={formatTime(appointment.appointmentDatetime)}
                  minutesUntil={calculateMinutesUntil(appointment.appointmentDatetime)}
                  description={appointment.reason}
                  onReschedule={handleReschedule}
                  onCancel={handleCancel}
                />
              ))
            ) : (
              <div className={styles.noAppointments}>
                <p>No hay citas para el {formatDate(selectedDate)}</p>
              </div>
            )}
          </div>
        </div>
        <NavBar />
      </div>
    </div>
  )
}

export default AppointmentDentist
