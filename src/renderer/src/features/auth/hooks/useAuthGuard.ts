import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { useLocation, useNavigate } from 'react-router-dom'

const publicRoutes = ['/', '/signup', '/recover-password']

/**
 * Custom hook to guard routes based on authentication status.
 * It checks if the user is authenticated and allows access to public routes.
 * If the user is not authenticated and tries to access a protected route,
 * it redirects them to the home page.
 * @returns {Object} - An object containing `isAllowed` and `isLoading`.
 */
export const useAuthGuard = (): { isAllowed: boolean; isLoading: boolean } => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isAllowed, setIsAllowed] = useState(false)

  useEffect(() => {
    if (isLoading) {
      setIsAllowed(false)
      return
    }

    const path = location.pathname
    const isPublic = publicRoutes.includes(path)

    if (isPublic) {
      setIsAllowed(true)
      return
    }

    if (isAuthenticated) {
      setIsAllowed(true)
    } else {
      setIsAllowed(false)
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, isLoading, location.pathname, navigate])

  return { isAllowed, isLoading }
}
