import { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from '../styles/profileSelection.module.css'
import ProfileAvatar from '@renderer/assets/images/profile-icon-9.png'

interface FatherProfile {
  userId: number
  name: string
  type: 'FATHER'
}

interface ChildProfile {
  childId: number
  name: string
  lastName: string
}

type Profile =
  | { id: number; type: 'FATHER'; name: string; fullData: FatherProfile }
  | { id: number; type: 'CHILD'; name: string; fullData: ChildProfile }

const ProfileSelection: FC = () => {
  const navigate = useNavigate()

  const profiles: Profile[] = [
    {
      id: 1,
      type: 'FATHER',
      name: 'Mi perfil',
      fullData: {
        userId: 1,
        name: 'Mi perfil',
        type: 'FATHER'
      }
    },
    {
      id: 2,
      type: 'CHILD',
      name: 'Si',
      fullData: {
        childId: 2,
        name: 'Si',
        lastName: 'No'
      }
    }
  ]

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleProfileSelect = (profile: Profile) => {
    if (profile.type === 'FATHER') {
      console.log(`Perfil seleccionado: ${profile.name} (Padre)`)
      navigate('/homeFather')
    } else {
      console.log(`Perfil seleccionado: ${profile.name} (Niño)`)
    }
  }

  return (
    <div className={styles.profileSelectionPage}>
      <h1 className={styles.title}>Bienvenido, seleccione el perfil</h1>

      <div className={styles.profilesContainer}>
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className={styles.profileCard}
            onClick={() => handleProfileSelect(profile)}
          >
            <div className={styles.avatarContainer}>
              <div className={styles.avatarPlaceholder}>
                <img src={ProfileAvatar} alt="Profile" className={styles.profileAvatar} />
              </div>
            </div>
            <p className={styles.profileName}>{profile.name}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProfileSelection
