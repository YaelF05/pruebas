import React from 'react'
import { useAuthGuard } from '../hooks/useAuthGuard'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * ProtectedRoute component that checks if the user is authenticated.
 * If the user is not authenticated, it returns null.
 * If the authentication status is loading, it returns a fallback component.
 * If the user is authenticated, it renders the children.
 * @param {ProtectedRouteProps} props - The properties for the ProtectedRoute component.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, fallback }) => {
  const { isAllowed, isLoading } = useAuthGuard()

  if (isLoading) return <>{fallback}</>
  if (!isAllowed) return null

  return <>{children}</>
}
