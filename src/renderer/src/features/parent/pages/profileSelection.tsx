// src/renderer/src/features/parent/pages/profileSelection.tsx
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

  const extractUserInfoFromToken = () => {
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
  }

  const fetchProfiles = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('=== INICIANDO CARGA DE PERFILES ===')
      
      const profilesList: Profile[] = []
      
      // Intentar cargar perfil del padre
      try {
        console.log('Intentando cargar perfil del usuario...')
        const userProfile = await getUserProfileService()
        console.log('✅ Perfil del usuario cargado exitosamente:', userProfile)
        
        profilesList.push({
          id: userProfile.userId,
          type: 'FATHER',
          name: `${userProfile.name} ${userProfile.lastName}`,
          data: userProfile
        })
      } catch (userError) {
        console.error('❌ Error al cargar perfil del usuario:', userError)
        
        // Crear perfil básico usando información del token
        const tokenInfo = extractUserInfoFromToken()
        if (tokenInfo) {
          console.log('📝 Creando perfil básico desde token:', tokenInfo)
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
          console.error('No se pudo obtener información del usuario')
          setError('No se pudo cargar el perfil del usuario')
        }
      }

      // Intentar cargar hijos
      try {
        console.log('Intentando cargar hijos del usuario...')
        const children = await getChildrenService()
        console.log('✅ Hijos cargados exitosamente:', children)
        
        children.forEach(child => {
          profilesList.push({
            id: child.childId,
            type: 'CHILD',
            name: `${child.name} ${child.lastName}`,
            data: child
          })
        })
      } catch (childrenError) {
        console.error('❌ Error al cargar hijos (esto es normal si no hay endpoint o no hay hijos):', childrenError)
        // No es un error crítico si no se pueden cargar los hijos
      }

      console.log('📋 Lista final de perfiles:', profilesList)
      setProfiles(profilesList)

      // Si solo hay un perfil (el padre), continuar automáticamente
      if (profilesList.length === 1 && profilesList[0].type === 'FATHER') {
        console.log('Solo hay un perfil (padre), continuando automáticamente...')
        handleProfileSelect(profilesList[0])
      }

    } catch (error) {
      console.error('💥 Error crítico al cargar perfiles:', error)
      setError(error instanceof Error ? error.message : 'Error desconocido al cargar los perfiles')
    } finally {
      setLoading(false)
      console.log('=== FINALIZADA CARGA DE PERFILES ===')
    }
  }

  const handleProfileSelect = (profile: Profile): void => {
    console.log(`🎯 Perfil seleccionado:`, profile)
    
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
          <p>Por favor espere mientras cargamos su información</p>
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

  // Si solo hay un perfil, continuar automáticamente (esto se maneja en fetchProfiles)
  if (profiles.length === 1 && loading === false) {
    return (
      <div className={styles.profileSelectionPage}>
        <div className={styles.loadingContainer}>
          <h1 className={styles.title}>Redirigiendo...</h1>
          <p>Cargando su perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.profileSelectionPage}>
      <h1 className={styles.title}>Bienvenido, seleccione el perfil</h1>
      
      {error && (
        <div className={styles.warningMessage}>
          <p>⚠️ Algunos perfiles no pudieron cargarse completamente</p>
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