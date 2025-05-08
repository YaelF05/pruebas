import React from 'react'
import styles from '../styles/dentistDashboard.module.css'

const DentalAppointmentApp: React.FC = () => {
  return (
    <div className="app-container">
      <div className="main-content">
        <div className="appointments-section">
          <div className="header">
            <div>
              <h1>Buenos tardes, Dr Sinueh</h1>
              <p>Estas son las citas de hoy</p>
              <p className="date">Lunes 7 de abril</p>
            </div>
          </div>

          <div className="appointment-card">
            <div className="time-block">
              <div className="time">10:00</div>
              <div className="time-info">en 20 minutos</div>
            </div>
            <div className="patient-info">
              <h3>Jhon Doe</h3>
              <p>Sensibilidad en molares</p>
            </div>
          </div>
        </div>

        <div className="side-panel">
          <h3>Pacientes recientes</h3>
          <div className="recent-patient">
            <ToothIcon />
            <span>Jhon Doe</span>
          </div>
        </div>
      </div>

      <nav className="bottom-nav">
        <div className="nav-item active">
          <HomeIcon />
          <span>Inicio</span>
        </div>
        <div className="nav-item">
          <ClockIcon />
          <span>Citas</span>
        </div>
        <div className="nav-item">
          <DocumentIcon />
          <span>Pacientes</span>
        </div>
        <div className="nav-item">
          <UserIcon />
          <span>Perfil</span>
        </div>
        <div className="nav-item">
          <SettingsIcon />
          <span>Configuración</span>
        </div>
      </nav>
    </div>
  )
}

export default DentistDashboard
