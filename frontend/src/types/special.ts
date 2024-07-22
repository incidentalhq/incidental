import { IField, IIncidentFieldValue } from './models'

export interface ICombinedFieldAndValue {
  field: IField
  value: IIncidentFieldValue | null
}
