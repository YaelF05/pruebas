import React, { useEffect, useState } from 'react'
import { useGreeting } from '../hooks/useGreeting'
import { getAppointmentsService } from '@renderer/features/parent/services/appointmentService'
import { AppointmentResponse } from '../types/dentistTypes'
import styles from '../styles/dentistDashboard.module.css'
import NavBar from '../components/navBar'
import RecentPatients from '../components/recentPatients'
import AppointmentCard from '../components/appointmentCard'

const DentistDashboard: React.FC = () => {
  const greeting = useGreeting()
  const now = new Date()

  const [appointmentsData, setAppointmentsData] = useState<AppointmentResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const appointments = await getAppointmentsService()
        setAppointmentsData(appointments)
      } catch (err) {
        console.error('Error fetching appointments:', err)
        setError('Error al cargar las citas')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const capitalizeFirstLetter = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1)

  const todayAppointments = appointmentsData.filter((appointment) => {
    const appointmentDate = new Date(appointment.appointmentDatetime)
    const today = new Date()
    return appointmentDate.toDateString() === today.toDateString() && appointment.isActive === true
  })

  const recentAppointments = appointmentsData.filter((appointment) => {
    const appointmentDate = new Date(appointment.appointmentDatetime)
    const today = new Date()
    return (
      appointmentDate < today && appointmentDate >= new Date(today.setDate(today.getDate() - 7))
    )
  })

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <div className={styles.mainContent}>
          <div className={styles.header}>
            <h1 className={styles.title}>{greeting}</h1>
            <p className={styles.subtitle}>Estas son las citas de hoy</p>
            <p className={styles.date}>
              {capitalizeFirstLetter(
                now.toLocaleDateString('es-ES', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })
              )}
            </p>
            {loading ? (
              <p className={styles.loadingAppointments}>Cargando citas...</p>
            ) : error ? (
              <p className={styles.loadingAppointments}>{error}</p>
            ) : todayAppointments.length > 0 ? (
              todayAppointments.map((appointment, index) => (
                <AppointmentCard
                  key={index}
                  appointmentDateTime={appointment.appointmentDatetime}
                  name={appointment.child || 'Paciente desconocido'}
                  reason={appointment.reason}
                />
              ))
            ) : (
              <p className={styles.loadingAppointments}>Sin citas programadas para hoy...</p>
            )}
          </div>

          <div className={styles.recentPatients}>
            <h2>Pacientes recientes</h2>
            {recentAppointments.length > 0 ? (
              recentAppointments.map((appointment, index) => (
                <RecentPatients
                  key={index}
                  name={appointment.child || 'Paciente desconocido'}
                  reason={appointment.reason}
                />
              ))
            ) : (
              <p className={styles.loadingRecentPatients}>Sin pacientes recientes...</p>
            )}
          </div>
        </div>
        <NavBar />
      </div>
    </div>
  )
}

export default DentistDashboard
