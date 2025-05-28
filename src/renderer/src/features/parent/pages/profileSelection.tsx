import { FC, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getChildrenService, ChildResponse } from '../services/childService'
import { getUserProfileService, UserProfileResponse } from '../services/userServices'
import styles from '../styles/profileSelection.module.css'
import ProfileAvatar from '@renderer/assets/images/profile-icon-9.png'

interface Profile {
  id: number
  type: 'FATHER' | 'CHILD'
  name: string
  data: UserProfileResponse | ChildResponse
}

const ProfileSelection: FC = () => {
  const navigate = useNavigate()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Cargando perfiles del usuario...')

      // Cargar perfil del padre
      const userProfile = await getUserProfileService()
      console.log('Perfil del usuario cargado:', userProfile)

      // Cargar hijos
      const children = await getChildrenService()
      console.log('Hijos cargados:', children)

      // Crear array de perfiles
      const profilesList: Profile[] = []

      // Agregar perfil del padre
      profilesList.push({
        id: userProfile.userId,
        type: 'FATHER',
        name: `${userProfile.name} ${userProfile.lastName}`,
        data: userProfile
      })

      // Agregar perfiles de los hijos
      children.forEach(child => {
        profilesList.push({
          id: child.childId,
          type: 'CHILD',
          name: `${child.name} ${child.lastName}`,
          data: child
        })
      })

      setProfiles(profilesList)
    } catch (error) {
      console.error('Error al cargar perfiles:', error)
      setError(error instanceof Error ? error.message : 'Error al cargar los perfiles')

      // En caso de error, crear al menos el perfil del padre básico
      setProfiles([{
          id: Date.now(),
          type: 'FATHER',
          name: 'Mi perfil',
          data: {
            userId: 1,
            name: 'Usuario',
            lastName: 'Padre',
            email: localStorage.getItem('userEmail') || 'usuario@email.com',
            type: 'FATHER',
            birthDate: '1990-01-01',
            creationDate: new Date().toISOString(),
            isActive: true
          } as UserProfileResponse
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleProfileSelect = (profile: Profile): void => {
    console.log(`Perfil seleccionado:`, profile)
    
    if (profile.type === 'FATHER') {
      // Guardar información del perfil del padre seleccionado
      localStorage.setItem('selectedProfile', JSON.stringify({
        type: 'FATHER',
        id: profile.id,
        name: profile.name,
        data: profile.data
      }))
      navigate('/homeFather')
    } else {
      // Guardar información del perfil del niño seleccionado
      localStorage.setItem('selectedProfile', JSON.stringify({
        type: 'CHILD',
        id: profile.id,
        name: profile.name,
        data: profile.data
      }))
      
      // Por ahora ir al home del padre, pero en el futuro podría ser una vista específica del niño
      navigate('/homeFather')
    }
  }

  const calculateAge = (birthDate: string): number => {
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  const getProfileSubtitle = (profile: Profile): string => {
    if (profile.type === 'FATHER') {
      return 'Padre de familia'
    } else {
      const child = profile.data as ChildResponse
      const age = calculateAge(child.birthDate)
      return `${age} años`
    }
  }

  if (loading) {
    return (
      <div className={styles.profileSelectionPage}>
        <div className={styles.loadingContainer}>
          <h1 className={styles.title}>Cargando perfiles...</h1>
        </div>
      </div>
    )
  }

  if (error && profiles.length === 0) {
    return (
      <div className={styles.profileSelectionPage}>
        <div className={styles.errorContainer}>
          <h1 className={styles.title}>Error al cargar perfiles</h1>
          <p className={styles.errorMessage}>{error}</p>
          <button 
            className={styles.retryButton}
            onClick={fetchProfiles}
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.profileSelectionPage}>
      <h1 className={styles.title}>Bienvenido, seleccione el perfil</h1>
      
      {error && (
        <div className={styles.warningMessage}>
          <p>⚠️ Algunos perfiles no pudieron cargarse: {error}</p>
        </div>
      )}

      <div className={styles.profilesContainer}>
        {profiles.map((profile) => (
          <div
            key={`${profile.type}-${profile.id}`}
            className={styles.profileCard}
            onClick={() => handleProfileSelect(profile)}
          >
            <div className={styles.avatarContainer}>
              <div className={styles.avatarPlaceholder}>
                <img src={ProfileAvatar} alt="Profile" className={styles.profileAvatar} />
              </div>
            </div>
            <div className={styles.profileInfo}>
              <p className={styles.profileName}>{profile.name}</p>
              <p className={styles.profileSubtitle}>{getProfileSubtitle(profile)}</p>
            </div>
          </div>
        ))}
      </div>

      {profiles.length === 1 && profiles[0].type === 'FATHER' && (
        <div className={styles.helpText}>
          <p>💡 Tip: Puedes agregar perfiles de tus hijos desde el panel principal</p>
        </div>
      )}
    </div>
  )
}

export default ProfileSelection
