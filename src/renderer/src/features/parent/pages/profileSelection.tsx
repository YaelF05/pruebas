import { FC, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getChildrenService, ChildResponse } from '../services/childService'
import styles from '../styles/profileSelection.module.css'
import ProfileAvatar from '@renderer/assets/images/profile-icon-9.png'

interface Profile {
  id: number
  type: 'FATHER' | 'CHILD'
  name: string
  data: UserProfileFromToken | ChildResponse
}

interface UserProfileFromToken {
  userId: number
  name: string
  lastName: string
  email: string
  type: 'FATHER' | 'DENTIST'
  birthDate: string
  creationDate: string
  isActive: boolean
}

const ProfileSelection: FC = () => {
  const navigate = useNavigate()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const extractUserInfoFromToken = useCallback((): UserProfileFromToken | null => {
    const authToken = localStorage.getItem('authToken')
    if (!authToken) return null

    try {
      const payload = JSON.parse(atob(authToken.split('.')[1]))

      return {
        userId: payload.userId || 1,
        name: payload.name || 'Usuario',
        lastName: payload.lastName || 'Padre',
        email: payload.email || 'usuario@email.com',
        type: payload.type || 'FATHER',
        birthDate: payload.birthDate || '1990-01-01',
        creationDate: payload.creationDate || new Date().toISOString(),
        isActive: payload.isActive !== undefined ? payload.isActive : true
      }
    } catch (error) {
      console.warn('No se pudo decodificar el token JWT:', error)
      return null
    }
  }, [])

  const fetchProfiles = useCallback(async (): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      const profilesList: Profile[] = []

      const userProfile = extractUserInfoFromToken()

      if (userProfile) {
        profilesList.push({
          id: userProfile.userId,
          type: 'FATHER',
          name: `${userProfile.name} ${userProfile.lastName}`,
          data: userProfile
        })
      } else {
        setError('No se pudo cargar el perfil del usuario')
        setLoading(false)
        return
      }

      try {
        const children = await getChildrenService()

        children.forEach((child) => {
          profilesList.push({
            id: child.childId,
            type: 'CHILD',
            name: `${child.name} ${child.lastName}`,
            data: child
          })
        })
      } catch (childrenError) {
        console.warn('No se pudieron cargar los hijos', childrenError)
      }

      setProfiles(profilesList)
    } catch (error) {
      console.error('Error al cargar perfiles:', error)
      setError(error instanceof Error ? error.message : 'Error desconocido al cargar los perfiles')
    } finally {
      setLoading(false)
    }
  }, [extractUserInfoFromToken])

  useEffect(() => {
    fetchProfiles()
  }, [fetchProfiles])

  const handleProfileSelect = (profile: Profile): void => {
    if (profile.type === 'FATHER') {
      localStorage.setItem(
        'selectedProfile',
        JSON.stringify({
          type: 'FATHER',
          id: profile.id,
          name: profile.name,
          data: profile.data
        })
      )

      navigate('/fatherDashboard')
    } else {
      localStorage.setItem(
        'selectedProfile',
        JSON.stringify({
          type: 'CHILD',
          id: profile.id,
          name: profile.name,
          data: profile.data
        })
      )

      console.log('Perfil de hijo seleccionado:', profile)
    }
  }

  const getProfileName = (profile: Profile): string => {
    if (profile.type === 'FATHER') {
      return 'Mi perfil'
    } else {
      return `${profile.name}`
    }
  }

  if (isLoading) {
    return <div className={styles.loading}>Cargando...</div>
  }

  if (error && profiles.length === 0) {
    return (
      <div className={styles.profileSelectionPage}>
        <div className={styles.errorContainer}>
          <h1 className={styles.title}>Error al cargar perfiles</h1>
          <p className={styles.errorMessage}>{error}</p>
          <button className={styles.retryButton} onClick={fetchProfiles}>
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
          <p>Advertencia: {error}</p>
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
              <p className={styles.profileName}>{getProfileName(profile)}</p>
            </div>
          </div>
        ))}
      </div>

      {profiles.length === 1 && profiles[0].type === 'FATHER' && (
        <div className={styles.noChildrenMessage}>
          <p>
            No tienes hijos registrados aún. Puedes continuar con tu perfil y agregar hijos después.
          </p>
        </div>
      )}
    </div>
  )
}

export default ProfileSelection
