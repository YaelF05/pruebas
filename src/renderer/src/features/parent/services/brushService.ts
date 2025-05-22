// src/renderer/src/features/parent/services/brushService.ts

const API_BASE_URL = 'https://smiltheet-api.rafabeltrans17.workers.dev/api'

export interface BrushRecord {
  brushId: number
  childId: number
  brushDatetime: string
}

export interface CreateBrushResult {
  message: string
  brushId: number
}

/**
 * Service to create a brush record
 * @param childId - The ID of the child
 * @param brushDatetime - The datetime when the child brushed
 * @returns A promise that resolves to the brush creation result
 * @throws An error if the creation fails
 */
export async function createBrushRecordService(
  childId: number,
  brushDatetime: string
): Promise<CreateBrushResult> {
  try {
    const authToken = localStorage.getItem('authToken')

    if (!authToken) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/brush`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        childId,
        brushDatetime
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Failed to create brush record: ${response.status}`)
    }

    const data = await response.json()
    return data as CreateBrushResult
  } catch (error) {
    console.error('Create brush record service error:', error)
    throw error
  }
}

/**
 * Service to get brush records for a specific child
 * @param childId - The ID of the child
 * @param startDate - Optional start date filter (YYYY-MM-DD)
 * @param endDate - Optional end date filter (YYYY-MM-DD)
 * @returns A promise that resolves to the list of brush records
 * @throws An error if the fetch fails
 */
export async function getBrushRecordsService(
  childId: number,
  startDate?: string,
  endDate?: string
): Promise<BrushRecord[]> {
  try {
    const authToken = localStorage.getItem('authToken')

    if (!authToken) {
      throw new Error('No authentication token found')
    }

    const queryParams = new URLSearchParams()
    queryParams.append('childId', childId.toString())

    if (startDate) {
      queryParams.append('startDate', startDate)
    }

    if (endDate) {
      queryParams.append('endDate', endDate)
    }

    const response = await fetch(`${API_BASE_URL}/brush?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Failed to fetch brush records: ${response.status}`)
    }

    const data = await response.json()
    return data as BrushRecord[]
  } catch (error) {
    console.error('Get brush records service error:', error)
    throw error
  }
}

/**
 * Service to delete a brush record
 * @param brushId - The ID of the brush record to delete
 * @returns A promise that resolves to the deletion result
 * @throws An error if the deletion fails
 */
export async function deleteBrushRecordService(brushId: number): Promise<{ message: string }> {
  try {
    const authToken = localStorage.getItem('authToken')

    if (!authToken) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/brush/${brushId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Failed to delete brush record: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Delete brush record service error:', error)
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
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    return await getBrushRecordsService(childId, today, today)
  } catch (error) {
    console.error('Get today brush records service error:', error)
    throw error
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
    const today = new Date()
    const startOfWeek = new Date(today)
    const dayOfWeek = today.getDay()
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) // Monday as start of week
    startOfWeek.setDate(diff)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)

    const startDate = startOfWeek.toISOString().split('T')[0]
    const endDate = endOfWeek.toISOString().split('T')[0]

    return await getBrushRecordsService(childId, startDate, endDate)
  } catch (error) {
    console.error('Get weekly brush records service error:', error)
    throw error
  }
}
