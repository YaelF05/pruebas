import React, { useState, useEffect } from 'react'
import styles from '../styles/patients.module.css'
import NavBar from '../components/navBar'
import PatientsCard from '../components/patientsCard'
import { getPatientsService } from '../services/getPatientsService'
import { GetPatientsResponse } from '../types/dentistTypes'

const Patients: React.FC = () => {
  const [patients, setPatients] = useState<GetPatientsResponse[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPatients = async (): Promise<void> => {
      try {
        setLoading(true)
        setError(null)
        const patientsData = await getPatientsService()
        setPatients(patientsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar los pacientes')
        console.error('Error fetching patients:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPatients()
  }, [])

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.container}>
          <div className={styles.mainContent}>
            <h1 className={styles.pageTitle}>Pacientes bajo su cuidado</h1>
            <div className={styles.loadingMessage}>Cargando pacientes...</div>
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
            <h1 className={styles.pageTitle}>Pacientes bajo su cuidado</h1>
            <div className={styles.errorMessage}>Error: {error}</div>
            <button onClick={() => window.location.reload()} className={styles.retryButton}>
              Reintentar
            </button>
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
          <h1 className={styles.pageTitle}>Pacientes bajo su cuidado</h1>
          {patients.length === 0 ? (
            <div className={styles.emptyMessage}>No hay pacientes registrados</div>
          ) : (
            <div className={styles.patientsList}>
              {patients.map((patient) => (
                <PatientsCard
                  key={patient.childId}
                  name={`${patient.name} ${patient.lastName}`}
                  birthDate={patient.birthDate}
                />
              ))}
            </div>
          )}
        </div>
        <NavBar />
      </div>
    </div>
  )
}

export default Patients
