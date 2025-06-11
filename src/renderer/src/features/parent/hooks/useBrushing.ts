import { useState, useCallback } from 'react'
import {
  getWeeklyBrushRecordsService,
  createBrushRecordService,
  BrushRecord
} from '../services/brushService'

interface BrushingStatus {
  morning: 'pending' | 'completed'
  afternoon: 'pending' | 'completed'
  night: 'pending' | 'completed'
}

interface DayBrushing {
  date: Date
  status: BrushingStatus
}

interface ChildBrushingState {
  [childId: number]: {
    [date: string]: {
      morning: boolean
      afternoon: boolean
      night: boolean
    }
  }
}

export const useBrushing = () => {
  const [manualBrushingState, setManualBrushingState] = useState<ChildBrushingState>({})

  const getDateString = useCallback((date: Date = new Date()): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }, [])

  const initializeChildBrushingState = useCallback(
    (childId: number, date: string = getDateString()): void => {
      setManualBrushingState((prev) => ({
        ...prev,
        [childId]: {
          ...prev[childId],
          [date]: prev[childId]?.[date] || {
            morning: false,
            afternoon: false,
            night: false
          }
        }
      }))
    },
    [getDateString]
  )

  const getBrushingStatusFromState = useCallback(
    (childId: number, date: string = getDateString()): BrushingStatus => {
      const state = manualBrushingState[childId]?.[date]

      if (!state) {
        return {
          morning: 'pending',
          afternoon: 'pending',
          night: 'pending'
        }
      }

      return {
        morning: state.morning ? 'completed' : 'pending',
        afternoon: state.afternoon ? 'completed' : 'pending',
        night: state.night ? 'completed' : 'pending'
      }
    },
    [manualBrushingState, getDateString]
  )

  const generateWeeklyBrushingFromState = useCallback(
    (childId: number): DayBrushing[] => {
      const days: DayBrushing[] = []
      const today = new Date()

      const firstDayOfWeek = new Date(today)
      const dayOfWeek = today.getDay()
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
      firstDayOfWeek.setDate(diff)

      for (let i = 0; i < 7; i++) {
        const date = new Date(firstDayOfWeek)
        date.setDate(firstDayOfWeek.getDate() + i)
        const dayStr = getDateString(date)

        const status = getBrushingStatusFromState(childId, dayStr)

        days.push({
          date,
          status
        })
      }

      return days
    },
    [getBrushingStatusFromState, getDateString]
  )

  const loadBrushingStateFromRecords = useCallback(
    async (childId: number): Promise<void> => {
      try {
        const weeklyRecords = await getWeeklyBrushRecordsService(childId)

        const recordsByDate: { [date: string]: BrushRecord[] } = {}
        weeklyRecords.forEach((record) => {
          const recordDate = getDateString(new Date(record.brushDatetime))
          if (!recordsByDate[recordDate]) {
            recordsByDate[recordDate] = []
          }
          recordsByDate[recordDate].push(record)
        })

        const today = new Date()
        const firstDayOfWeek = new Date(today)
        const dayOfWeek = today.getDay()
        const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
        firstDayOfWeek.setDate(diff)

        const newState: {
          [date: string]: { morning: boolean; afternoon: boolean; night: boolean }
        } = {}

        for (let i = 0; i < 7; i++) {
          const date = new Date(firstDayOfWeek)
          date.setDate(firstDayOfWeek.getDate() + i)
          const dayStr = getDateString(date)

          const dayRecords = recordsByDate[dayStr] || []

          newState[dayStr] = {
            morning: dayRecords.length >= 1,
            afternoon: dayRecords.length >= 2,
            night: dayRecords.length >= 3
          }
        }

        setManualBrushingState((prev) => {
          const currentState = { ...prev }

          if (!currentState[childId]) {
            currentState[childId] = {}
          }

          const todayStr = getDateString()

          Object.keys(newState).forEach((dateStr) => {
            if (dateStr === todayStr && currentState[childId][dateStr]) {
              const localState = currentState[childId][dateStr]
              const hasLocalChanges = localState.morning || localState.afternoon || localState.night

              if (!hasLocalChanges) {
                currentState[childId][dateStr] = newState[dateStr]
              }
            } else {
              currentState[childId][dateStr] = newState[dateStr]
            }
          })

          return currentState
        })
      } catch (error) {
        console.error('Error al cargar estado de cepillado:', error)
      }
    },
    [getDateString]
  )

  const updateTodayBrushing = useCallback(
    async (childId: number, time: 'morning' | 'afternoon' | 'night'): Promise<void> => {
      const todayStr = getDateString()
      const currentState = manualBrushingState[childId]?.[todayStr]?.[time]

      try {
        if (!currentState) {
          setManualBrushingState((prev) => ({
            ...prev,
            [childId]: {
              ...prev[childId],
              [todayStr]: {
                ...prev[childId]?.[todayStr],
                [time]: true
              }
            }
          }))

          await createBrushRecordService(childId)
        }
      } catch (error) {
        console.error('Error al actualizar estado de cepillado:', error)

        setManualBrushingState((prev) => ({
          ...prev,
          [childId]: {
            ...prev[childId],
            [todayStr]: {
              ...prev[childId]?.[todayStr],
              [time]: false
            }
          }
        }))

        throw error
      }
    },
    [getDateString, manualBrushingState]
  )

  return {
    initializeChildBrushingState,
    loadBrushingStateFromRecords,
    getBrushingStatusFromState,
    generateWeeklyBrushingFromState,
    updateTodayBrushing
  }
}
