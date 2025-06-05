import { BrushRecord, CreateBrushResult } from '../types/brushTypes'

const API_BASE_URL = 'https://smiltheet-api.rafabeltrans17.workers.dev/api'

/**
 * Service to create a brush record
 * @param childId - The ID of the child
 * @param brushDatetime - The datetime when the child brushed (optional, defaults to current time)
 * @returns A promise that resolves to the brush creation result
 * @throws An error if the creation fails
 */
export async function createBrushRecordService(childId: number): Promise<CreateBrushResult> {
  try {
    const authToken = localStorage.getItem('authToken')

    if (!authToken) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/child/brush?id=${childId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Failed to create brush record: ${response.status}`)
    }

    const data = await response.json()
    return data as CreateBrushResult
  } catch (error) {
    console.error('Error creating brush record:', error)
    throw error
  }
}

/**
 * Service to get brush records for a specific child
 * @param childId - The ID of the child
 * @param page - Page number for pagination (optional, default: 1)
 * @param limit - Number of records per page (optional, default: 100)
 * @returns A promise that resolves to the list of brush records
 * @throws An error if the fetch fails
 */
export async function getBrushRecordsService(
  childId: number,
  page: number = 1,
  limit: number = 100
): Promise<BrushRecord[]> {
  try {
    const authToken = localStorage.getItem('authToken')

    if (!authToken) {
      throw new Error('No authentication token found')
    }

    const queryParams = new URLSearchParams()
    queryParams.append('id', childId.toString())
    queryParams.append('page', page.toString())
    queryParams.append('limit', limit.toString())

    const response = await fetch(`${API_BASE_URL}/child/brush?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      }
    })

    if (!response.ok) {
      if (response.status === 404) {
        return []
      }
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Failed to fetch brush records: ${response.status}`)
    }

    const data = await response.json()

    if (Array.isArray(data)) {
      return data as BrushRecord[]
    } else if (data.items && Array.isArray(data.items)) {
      return data.items as BrushRecord[]
    } else {
      return []
    }
  } catch (error) {
    console.error('Error fetching brush records:', error)
    throw error
  }
}

/**
 * Service to get brush records for today for a specific child
 * @param childId - The ID of the child
 * @returns A promise that resolves to today's brush records
 * @throws An error if the fetch fails
 */
export async function getTodayBrushRecordsService(childId: number): Promise<BrushRecord[]> {
  try {
    const allRecords = await getBrushRecordsService(childId)
    const today = new Date().toISOString().split('T')[0]

    return allRecords.filter((record) => {
      const recordDate = new Date(record.brushDatetime).toISOString().split('T')[0]
      return recordDate === today
    })
  } catch (error) {
    console.error('Error fetching today brush records:', error)
    return []
  }
}

/**
 * Service to get brush records for the current week for a specific child
 * @param childId - The ID of the child
 * @returns A promise that resolves to this week's brush records
 * @throws An error if the fetch fails
 */
export async function getWeeklyBrushRecordsService(childId: number): Promise<BrushRecord[]> {
  try {
    const allRecords = await getBrushRecordsService(childId)

    const today = new Date()
    const startOfWeek = new Date(today)
    const dayOfWeek = today.getDay()
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
    startOfWeek.setDate(diff)
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    return allRecords.filter((record) => {
      const recordDate = new Date(record.brushDatetime)
      return recordDate >= startOfWeek && recordDate <= endOfWeek
    })
  } catch (error) {
    console.error('Error fetching weekly brush records:', error)
    return []
  }
}

export type { BrushRecord }
