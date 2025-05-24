import React from 'react'
import styles from '../styles/profile.module.css'
import NavBar from '../components/navBar'

const Profile: React.FC = () => {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <div className={styles.mainContent}>
          <h1>Tu perfil</h1>
        </div>
        <NavBar />
      </div>
    </div>
  )
}

export default Profile
