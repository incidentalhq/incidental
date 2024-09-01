import Field from '@/components/Form/Field'
import SelectField from '@/components/Form/SelectField'
import { FieldInterfaceKind, FieldKind, IncidentStatusCategory } from '@/types/enums'
import { IFormField, IIncidentSeverity, IIncidentStatus, IIncidentType } from '@/types/models'

export const getFormFieldComponent = (
  name: string,
  formField: IFormField,
  statusList: Array<IIncidentStatus>,
  severityList: Array<IIncidentSeverity>,
  incidentTypes: Array<IIncidentType>
) => {
  switch (formField.field.interfaceKind) {
    case FieldInterfaceKind.TEXTAREA:
      return <Field as={'textarea'} name={name} type="text" />
    case FieldInterfaceKind.TEXT:
      return <Field name={name} type="text" />
    case FieldInterfaceKind.SINGLE_SELECT: {
      switch (formField.field.kind) {
        case FieldKind.INCIDENT_STATUS: {
          const options = statusList.map((it) => ({
            label: it.name,
            value: it.id
          }))
          return <SelectField name={name} options={options} />
        }
        case FieldKind.INCIDENT_SEVERITY: {
          const options = severityList.map((it) => ({
            label: it.name,
            value: it.id
          }))
          return <SelectField name={name} options={options} />
        }
        case FieldKind.INCIDENT_TYPE: {
          const options = incidentTypes.map((it) => ({
            label: it.name,
            value: it.id
          }))
          return <SelectField name={name} options={options} />
        }
        case FieldKind.INCIDENT_INITIAL_STATUS: {
          const triage = statusList.find((it) => it.category === IncidentStatusCategory.TRIAGE)
          const active = statusList.find((it) => it.category == IncidentStatusCategory.ACTIVE)
          if (!triage || !active) {
            console.log('Could not find triage or active categories')
            break
          }
          const options = [
            {
              label: 'Triage',
              value: triage.id
            },
            {
              label: 'Active',
              value: active.id
            }
          ]

          return <SelectField name={name} options={options} />
        }
        case FieldKind.USER_DEFINED: {
          const options =
            formField.field.availableOptions?.map((it) => ({
              label: it,
              value: it
            })) ?? []

          return <SelectField name={name} options={options} />
        }
      }
    }
  }
}

export default getFormFieldComponent
