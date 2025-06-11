import { useState, useEffect, useCallback } from 'react'
import { getChildrenService, ChildResponse } from '../services/childService'
import { getAppointmentsService, AppointmentResponse } from '../services/appointmentService'

interface ChildWithNextAppointment extends ChildResponse {
  nextAppointment: string | null
}

export const useChildren = () => {
  const [children, setChildren] = useState<ChildWithNextAppointment[]>([])
  const [selectedChild, setSelectedChild] = useState<ChildWithNextAppointment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getNextAppointmentForChild = useCallback(
    (childId: number, appointments: AppointmentResponse[]): string | null => {
      const now = new Date()
      const futureAppointments = appointments
        .filter(
          (appointment) =>
            appointment.childId === childId &&
            appointment.isActive &&
            new Date(appointment.appointmentDatetime) > now
        )
        .sort(
          (a, b) =>
            new Date(a.appointmentDatetime).getTime() - new Date(b.appointmentDatetime).getTime()
        )

      return futureAppointments.length > 0 ? futureAppointments[0].appointmentDatetime : null
    },
    []
  )

  const loadChildren = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [childrenData, appointmentsData] = await Promise.all([
        getChildrenService(),
        getAppointmentsService(1, 100)
      ])

      const childrenWithAppointments: ChildWithNextAppointment[] = childrenData.map((child) => ({
        ...child,
        nextAppointment: getNextAppointmentForChild(child.childId, appointmentsData)
      }))

      setChildren(childrenWithAppointments)

      if (childrenWithAppointments.length > 0 && !selectedChild) {
        setSelectedChild(childrenWithAppointments[0])
      }
    } catch (error) {
      console.error('Error al cargar hijos:', error)
      setError(error instanceof Error ? error.message : 'Error al cargar los datos')
    } finally {
      setIsLoading(false)
    }
  }, [getNextAppointmentForChild, selectedChild])

  const updateChildrenAfterCreate = useCallback(async () => {
    try {
      const [updatedChildren, appointmentsData] = await Promise.all([
        getChildrenService(),
        getAppointmentsService(1, 100)
      ])

      const childrenWithAppointments: ChildWithNextAppointment[] = updatedChildren.map((child) => ({
        ...child,
        nextAppointment: getNextAppointmentForChild(child.childId, appointmentsData)
      }))

      setChildren(childrenWithAppointments)

      if (childrenWithAppointments.length > 0) {
        const lastChild = childrenWithAppointments[childrenWithAppointments.length - 1]
        setSelectedChild(lastChild)
      }
    } catch (error) {
      console.error('Error al actualizar hijos:', error)
      throw error
    }
  }, [getNextAppointmentForChild])

  const selectChild = useCallback((child: ChildWithNextAppointment) => {
    setSelectedChild(child)
  }, [])

  useEffect(() => {
    loadChildren()
  }, [loadChildren])

  return {
    children,
    selectedChild,
    isLoading,
    error,
    selectChild,
    updateChildrenAfterCreate
  }
}