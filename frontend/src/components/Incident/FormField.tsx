import styled from 'styled-components'

import { RequirementType } from '@/types/enums'
import { IFormField, IIncidentSeverity, IIncidentStatus, IIncidentType } from '@/types/models'

import { getFormFieldComponent } from './Field/getFieldComponent'

const Optional = styled.span`
  color: var(--color-gray-400);
`
const Description = styled.div`
  color: var(--color-gray-600);
  margin-top: 0.25rem;
`

interface FormFieldProps {
  formField: IFormField
  severityList: IIncidentSeverity[]
  statusList: IIncidentStatus[]
  incidentTypes: IIncidentType[]
}

const FormField: React.FC<FormFieldProps> = ({ formField, statusList, severityList, incidentTypes }) => {
  const inputComponent = getFormFieldComponent(formField.id, formField, statusList, severityList, incidentTypes)
  const description = formField.description
    ? formField.description
    : formField.field.description
      ? formField.field.description
      : undefined

  return (
    <div key={formField.id}>
      <label>
        {formField.label} {formField.requirementType === RequirementType.OPTIONAL ? <Optional>optional</Optional> : ''}
      </label>
      {inputComponent}
      {description && <Description>{description}</Description>}
    </div>
  )
}

export default FormField
