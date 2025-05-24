import React from 'react'
import styles from '../styles/patients.module.css'
import NavBar from '../components/navBar'
import PatientsCard from '../components/patientsCard'

const Patients: React.FC = () => {
  const patients = [
    { name: 'Juan Pérez', birthDate: '2014-01-01' },
    { name: 'María López', birthDate: '2015-02-15' },
    { name: 'Carlos García', birthDate: '2016-03-20' },
    { name: 'Ana Martínez', birthDate: '2017-04-25' },
    { name: 'Luis Rodríguez', birthDate: '2018-05-30' },
    { name: 'Laura Sánchez', birthDate: '2019-06-10' },
    { name: 'Pedro Fernández', birthDate: '2020-07-15' },
    { name: 'Sofía Gómez', birthDate: '2021-08-20' },
    { name: 'Diego Torres', birthDate: '2022-09-25' },
    { name: 'Valentina Ramírez', birthDate: '2023-10-30' },
    { name: 'Mateo Morales', birthDate: '2020-11-05' },
    { name: 'Isabella Castro', birthDate: '2020-12-12' },
    { name: 'Sebastián Díaz', birthDate: '2019-01-18' },
    { name: 'Camila Herrera', birthDate: '2020-02-22' },
    { name: 'Nicolás Jiménez', birthDate: '2021-03-28' },
    { name: 'Valeria Vargas', birthDate: '2022-04-30' }
  ]

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <div className={styles.mainContent}>
          <h1 className={styles.pageTitle}>Pacientes bajo su cuidado</h1>
          <div className={styles.patientsList}>
            {patients.map((patient, index) => (
              <PatientsCard key={index} name={patient.name} birthDate={patient.birthDate} />
            ))}
          </div>
        </div>
        <NavBar />
      </div>
    </div>
  )
}

export default Patients
