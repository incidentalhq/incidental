import {
  FieldInterfaceKind,
  FieldKind,
  FormType,
  IncidentRoleKind,
  IncidentStatusCategory,
  OrganisationKind
} from './enums'

export type ILoggedInUser = Required<IUser>

type Brand<K, T> = K & { __brand: T }

export type ModelID = Brand<string, 'ModelPK'>

interface IModel {
  id: ModelID
  createdAt: string
}

export interface IOrganisation extends IModel {
  slug: string
  name: string
  slackTeamName: string
  slackTeamId: string
  slackAppInstalled: boolean
  kind: OrganisationKind
}

export interface IOrganisationDetail {
  organisation: IOrganisation
  statusList: IIncidentStatus[]
  severityList: IIncidentSeverity[]
  forms: IForm[]
  incidentTypes: IIncidentType[]
  roles: IIncidentRole[]
}

export interface IWorld {
  user: IUser
  organisationDetails: IOrganisationDetail[]
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
  creator: IPublicUser
  incidentType: IIncidentType
  incidentStatus: IIncidentStatus
  incidentSeverity: IIncidentSeverity
  incidentRoleAssignments: Array<IIncidentRoleAssignment>
  timestampValues: Array<ITimestampValue>
}

export interface ITimestampValue extends IModel {
  value: string
  timestamp: ITimestamp
}

export interface ITimestamp extends IModel {
  label: string
  description: string
  kind: string
  rules: Array<ITimestampRule>
  rank: number
  canDelete: boolean
}

export interface ITimestampRule {
  first: boolean
  last: boolean
  onEvent: string
}

export interface IIncidentType extends IModel {
  name: string
  description: string
  isEditable: boolean
  isDeletable: boolean
  fields: Array<IField>
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
  description: string
  guide: string
  slackReference: string
  isEditable: boolean
  isDeletable: boolean
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
  label: string
  description: string | null
  position: number
  isRequired: boolean
  isDeletable: boolean
  defaultValue: string | null
  field: IField
}

export interface IField extends IModel {
  label: string
  description: string | null
  kind: FieldKind
  interfaceKind: FieldInterfaceKind
  availableOptions: Array<string> | null
  isEditable: boolean
  isDeletable: boolean
  isSystem: boolean
}

export interface IForm extends IModel {
  name: string
  isPublished: boolean
  template: string | null
  type: FormType
  formFields: IFormField[]
}

export interface IInvite extends IModel {
  createdAt: string
  emailAddress: string
}

export interface ITeam extends IModel {
  name: string
}

export interface ISettings extends IModel {
  slackChannelNameFormat: string
  incidentReferenceFormat: string
  slackAnnouncementChannelName: string
}
