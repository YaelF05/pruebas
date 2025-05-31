export interface BrushRecord {
  brushId: number
  childId: number
  brushDatetime: string
}

export interface CreateBrushResult {
  message: string
  brushId?: number
}
