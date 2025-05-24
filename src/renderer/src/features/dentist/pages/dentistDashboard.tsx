import React from 'react'
import { useEffect, useState } from 'react'
import { useGreeting } from '../hooks/useGreeting'
import styles from '../styles/dentistDashboard.module.css'
import NavBar from '../components/navBar'
import RecentPatients from '../components/recentPatients'
import AppointmentCard from '../components/appointmentCard'

interface RecentPatientsProps {
  name: string
  reason: string
}

interface AppointmentProps {
  appointmentDateTime: string
  name: string
  reason: string
}

const DentistDashboard: React.FC = () => {
  const [patients, setPatients] = useState<RecentPatientsProps[]>([])
  const [appointments, setAppointments] = useState<AppointmentProps[]>([])
  const greeting = useGreeting()
  const now = new Date()
  const capitalizeFirstLetter = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1)

  useEffect(() => {
    const data: RecentPatientsProps[] = [
      { name: 'Juan Pérez', reason: 'Dolor de muelas' },
      { name: 'María López', reason: 'Revisión dental' },
      { name: 'Carlos García', reason: 'Ortodoncia' },
      { name: 'Ana Martínez', reason: 'Limpieza dental' },
      { name: 'Luis Rodríguez', reason: 'Extracción de muela' },
      { name: 'Laura Sánchez', reason: 'Consulta de ortodoncia' },
      { name: 'Pedro Fernández', reason: 'Revisión de ortodoncia' },
      { name: 'Sofía Gómez', reason: 'Dolor de muelas' },
      { name: 'Diego Torres', reason: 'Limpieza dental' }
    ]

    setPatients(data)
  }, [])

  useEffect(() => {
    const data: AppointmentProps[] = [
      {
        appointmentDateTime: '2025-05-21T10:00:00',
        name: 'Jhon Doe',
        reason: 'Sensibilidad en molares'
      },
      {
        appointmentDateTime: '2025-05-21T11:00:00',
        name: 'Jane Smith',
        reason: 'Revisión de ortodoncia'
      },
      {
        appointmentDateTime: '2025-05-21T12:00:00',
        name: 'Alice Johnson',
        reason: 'Dolor de muelas'
      },
      {
        appointmentDateTime: '2025-05-21T13:00:00',
        name: 'Bob Brown',
        reason: 'Consulta de ortodoncia'
      },
      {
        appointmentDateTime: '2025-05-21T14:00:00',
        name: 'Charlie Davis',
        reason: 'Limpieza dental'
      },
      {
        appointmentDateTime: '2025-05-21T15:00:00',
        name: 'Diana Evans',
        reason: 'Extracción de muela'
      },
      {
        appointmentDateTime: '2025-05-21T16:00:00',
        name: 'Ethan Wilson',
        reason: 'Revisión dental'
      }
    ]

    setAppointments(data)
  }, [])

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
            {appointments.length > 0 ? (
              appointments.map((appointment, index) => (
                <AppointmentCard
                  key={index}
                  appointmentDateTime={appointment.appointmentDateTime}
                  name={appointment.name}
                  reason={appointment.reason}
                />
              ))
            ) : (
              <p className={styles.loadingAppointments}>Sin citas programadas...</p>
            )}
          </div>
          <div className={styles.recentPatients}>
            <h2>Pacientes recientes</h2>
            {patients.length > 0 ? (
              patients.map((patient, index) => (
                <RecentPatients key={index} name={patient.name} reason={patient.reason} />
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
