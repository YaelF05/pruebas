import { FC, useState, useEffect, useCallback } from 'react'
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
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const extractUserInfoFromToken = useCallback((): {
    userId: number
    email: string
    type: string
  } | null => {
    const authToken = localStorage.getItem('authToken')
    if (!authToken) return null

    try {
      const payload = JSON.parse(atob(authToken.split('.')[1]))
      return {
        userId: payload.userId || 1,
        email: payload.email || 'usuario@email.com',
        type: payload.type || 'FATHER'
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

      try {
        const userProfile = await getUserProfileService()

        profilesList.push({
          id: userProfile.userId,
          type: 'FATHER',
          name: `${userProfile.name} ${userProfile.lastName}`,
          data: userProfile
        })
      } catch (userError) {
        console.error('Error al cargar perfil del usuario:', userError)

        const tokenInfo = extractUserInfoFromToken()
        if (tokenInfo) {
          const basicProfile: UserProfileResponse = {
            userId: tokenInfo.userId,
            name: 'Usuario',
            lastName: 'Padre',
            email: tokenInfo.email,
            type: tokenInfo.type as 'FATHER',
            birthDate: '1990-01-01',
            creationDate: new Date().toISOString(),
            isActive: true
          }

          profilesList.push({
            id: basicProfile.userId,
            type: 'FATHER',
            name: `${basicProfile.name} ${basicProfile.lastName}`,
            data: basicProfile
          })
        } else {
          setError('No se pudo cargar el perfil del usuario')
        }
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
        console.error('Error al cargar hijos :', childrenError)
      }

      setProfiles(profilesList)
    } catch (error) {
      console.error(' Error al cargar perfiles:', error)
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

      alert(`Perfil de ${profile.name} seleccionado. Por ahora solo se registra en consola.`)
    }
  }

  const getProfileName = (profile: Profile): string => {
    if (profile.type === 'FATHER') {
      return 'Mi perfil'
    } else {
      return `${profile.name}`
    }
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

  if (isLoading) {
    return <div className={styles.loading}>Cargando...</div>
  }

  return (
    <div className={styles.profileSelectionPage}>
      <h1 className={styles.title}>Bienvenido, seleccione el perfil</h1>

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
    </div>
  )
}

export default ProfileSelection
