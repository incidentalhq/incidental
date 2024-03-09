import { FormFieldKind, FormType, IncidentRoleKind, IncidentStatusCategory } from './enums'

export type ILoggedInUser = Required<IUser>

type Brand<K, T> = K & { __brand: T }

export type ModelID = Brand<string, 'ModelPK'>

interface IModel {
  id: ModelID
  createdAt: string
}

export interface IOrganisation extends IModel {
  name: string
  slackTeamName: string
  slackTeamId: string
  slackAppInstalled: boolean
}

export interface IWorld {
  user: IUser
  organisations: IOrganisation[]
  statusList: IIncidentStatus[]
  severityList: IIncidentSeverity[]
  forms: IForm[]
  incidentTypes: IIncidentType[]
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

export interface IFormField extends IModel {
  kind: FormFieldKind
  label: string
  name: string
  description: string | null
  position: number
  isRequired: boolean
  isDeletable: boolean
  defaultValue: string | null
}

export interface IForm extends IModel {
  name: string
  isPublished: boolean
  template: string | null
  type: FormType
  formFields: IFormField[]
}
