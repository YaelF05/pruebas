import React from 'react'
import { useAuthGuard } from '../hooks/useAuthGuard'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback = <div>Cargando...</div>
}) => {
  const { isAllowed, isLoading } = useAuthGuard()

  if (isLoading) {
    return <>{fallback}</>
  }

  if (!isAllowed) {
    return null
  }

  return <>{children}</>
}
