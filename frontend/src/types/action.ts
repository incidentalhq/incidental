import { ComponentStatus } from './enums'

export interface CreateStatusPageIncident {
  name: string
  message: string
  status: string
  affectedComponents: Record<string, ComponentStatus>
}

export interface PaginationParams {
  page: number
  size: number
}

export interface GetStatusPageIncidentsRequest {
  id: string
  pagination?: PaginationParams
  isActive?: boolean
}

export interface CreateStatusPageIncidentUpdate {
  message: string
  status: string
  affectedComponents: Record<string, ComponentStatus>
}
