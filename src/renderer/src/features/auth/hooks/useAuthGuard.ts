import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'

interface UseAuthGuardOptions {
  redirectTo?: string
  publicRoutes?: string[]
}

export const useAuthGuard = (
  options: UseAuthGuardOptions = {}
): { isAuthenticated: boolean; isLoading: boolean; isAllowed: boolean } => {
  const { redirectTo = '/', publicRoutes = ['/', '/signup', '/recover-password'] } = options

  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // No hacer nada si aún está cargando
    if (isLoading) return

    const currentPath = location.pathname
    const isPublicRoute = publicRoutes.some((route) => currentPath.startsWith(route))

    // Si no está autenticado y no es una ruta pública, redirigir
    if (!isAuthenticated && !isPublicRoute) {
      // Guardar la ruta actual para redirigir después del login
      sessionStorage.setItem('redirectAfterLogin', currentPath)
      navigate(redirectTo)
    }

    // Si está autenticado y está en login, redirigir al dashboard
    if (isAuthenticated && currentPath === '/login') {
      const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/dashboard'
      sessionStorage.removeItem('redirectAfterLogin')
      navigate(redirectPath)
    }
  }, [isAuthenticated, isLoading, location.pathname, navigate, redirectTo, publicRoutes])

  return {
    isAuthenticated,
    isLoading,
    isAllowed: isLoading
      ? false
      : isAuthenticated || publicRoutes.some((route) => location.pathname.startsWith(route))
  }
}
