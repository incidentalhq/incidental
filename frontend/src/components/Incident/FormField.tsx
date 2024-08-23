import { ReactElement } from 'react'
import styled from 'styled-components'

import Field from '@/components/Form/Field'
import { FieldInterfaceKind, FieldKind, IncidentStatusCategory } from '@/types/enums'
import { IFormField, IIncidentSeverity, IIncidentStatus, IIncidentType } from '@/types/models'

import SelectField from '../Form/SelectField'

const Optional = styled.span`
  color: var(--color-gray-400);
`

interface FormFieldProps {
  formField: IFormField
  severityList: IIncidentSeverity[]
  statusList: IIncidentStatus[]
  incidentTypes: IIncidentType[]
}

const FormField: React.FC<FormFieldProps> = ({ formField, statusList, severityList, incidentTypes }) => {
  let inputComponent: ReactElement | null = null

  switch (formField.field.interfaceKind) {
    case FieldInterfaceKind.TEXTAREA:
      inputComponent = <Field as={'textarea'} name={formField.id} type="text" />
      break
    case FieldInterfaceKind.TEXT:
      inputComponent = <Field name={formField.id} type="text" />
      break
    case FieldInterfaceKind.SINGLE_SELECT: {
      switch (formField.field.kind) {
        case FieldKind.INCIDENT_STATUS: {
          const options = statusList.map((it) => ({
            label: it.name,
            value: it.id
          }))
          inputComponent = <SelectField name={formField.id} options={options} />
          break
        }
        case FieldKind.INCIDENT_SEVERITY: {
          const options = severityList.map((it) => ({
            label: it.name,
            value: it.id
          }))
          inputComponent = <SelectField name={formField.id} options={options} />
          break
        }
        case FieldKind.INCIDENT_TYPE: {
          const options = incidentTypes.map((it) => ({
            label: it.name,
            value: it.id
          }))
          inputComponent = <SelectField name={formField.id} options={options} />
          break
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

          inputComponent = <SelectField name={formField.id} options={options} />
          break
        }
      }
      break
    }
  }

  return (
    <div key={formField.id}>
      <label>
        {formField.label} {!formField.isRequired ? <Optional>optional</Optional> : ''}
      </label>
      {inputComponent}
    </div>
  )
}

export default FormField
