import { IncidentRoleKind, IncidentStatusCategory } from './enums'

export type ILoggedInUser = Required<IUser>

type Brand<K, T> = K & { __brand: T }

interface IModel {
  id: Brand<string, 'ModelPK'>
  createdAt: string
}

export interface IOrganisation extends IModel {}

export interface IWorld {
  user: IUser
  organisation: IOrganisation
}

export interface IUser extends IModel {
  authToken?: string
  name: string
  emailAddress: string
  isSuperAdmin?: boolean
}

export type IPublicUser = Pick<IUser, 'id' | 'emailAddress' | 'name'>

export interface IIncident extends IModel {
  name: string
  description: string | null
  reference: string
  slackChannelId: string
  slackChannelName: string
  owner: IPublicUser
  incidentType: IIncidentType
  incidentStatus: IIncidentStatus
  incidentSeverity: IIncidentSeverity
  incidentRoleAssignments: Array<IIncidentRoleAssignment>
}

export interface IIncidentType extends IModel {
  name: string
  description: string
}

export interface IIncidentStatus extends IModel {
  name: string
  description: string
  sortOrder: number
  category: IncidentStatusCategory
}

export interface IIncidentSeverity extends IModel {
  name: string
  description: string
  rating: number
}

export interface IIncidentRole extends IModel {
  name: string
  kind: IncidentRoleKind
}

export interface IIncidentRoleAssignment extends IModel {
  user: IPublicUser
  incidentRole: IIncidentRole
}

export interface IIncidentUpdate extends IModel {
  creator: IPublicUser
  summary: string
  newIncidentStatus: IIncidentStatus | null
  newIncidentSeverity: IIncidentSeverity | null
  previousIncidentStatus: IIncidentStatus | null
  previousIncidentSeverity: IIncidentSeverity | null
}
