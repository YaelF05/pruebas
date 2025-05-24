import { Link, useLocation } from 'react-router-dom'
import styles from '../styles/navBar.module.css'
import HomeIcon from '@renderer/assets/icons/home.png'
import AppointmentIcon from '@renderer/assets/icons/clock.png'
import PatientIcon from '@renderer/assets/icons/patients.svg'
import ProfileIcon from '@renderer/assets/icons/profile.svg'
import SettingsIcon from '@renderer/assets/icons/settings.svg'
import HomeIconActive from '@renderer/assets/icons/home-active.png'
import AppointmentIconActive from '@renderer/assets/icons/clock-active.png'
import PatientIconActive from '@renderer/assets/icons/patients-active.svg'
import ProfileIconActive from '@renderer/assets/icons/profile-active.svg'
import SettingsIconActive from '@renderer/assets/icons/settings-active.svg'

const NavBar: React.FC = () => {
  const location = useLocation()

  const isActive = (path: string): boolean => location.pathname === path

  return (
    <nav className={styles.navBar}>
      <Link
        to="/dentistDashboard"
        className={`${styles.container} ${isActive('/dentistDashboard') ? styles.active : ''}`}
      >
        <img src={isActive('/dentistDashboard') ? HomeIconActive : HomeIcon} alt="Inicio" />
        <span>Inicio</span>
      </Link>
      <Link
        to="/citasDentist"
        className={`${styles.container} ${isActive('/citasDentist') ? styles.active : ''}`}
      >
        <img
          src={isActive('/citasDentist') ? AppointmentIconActive : AppointmentIcon}
          alt="Citas"
        />
        <span>Citas</span>
      </Link>
      <Link
        to="/pacientes"
        className={`${styles.container} ${isActive('/pacientes') ? styles.active : ''}`}
      >
        <img src={isActive('/pacientes') ? PatientIconActive : PatientIcon} alt="Pacientes" />
        <span>Pacientes</span>
      </Link>
      <Link
        to="/perfil"
        className={`${styles.container} ${isActive('/perfil') ? styles.active : ''}`}
      >
        <img src={isActive('/perfil') ? ProfileIconActive : ProfileIcon} alt="Perfil" />
        <span>Perfil</span>
      </Link>
      <Link
        to="/configuracion"
        className={`${styles.container} ${isActive('/configuracion') ? styles.active : ''}`}
      >
        <img
          src={isActive('/configuracion') ? SettingsIconActive : SettingsIcon}
          alt="Configuración"
        />
        <span>Configuración</span>
      </Link>
    </nav>
  )
}

export default NavBar
