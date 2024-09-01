import styled from 'styled-components'

import Field from '@/components/Form/Field'
import getFormFieldComponent from '@/components/Incident/getFieldComponent'
import { IFormField, IIncidentSeverity, IIncidentStatus, IIncidentType } from '@/types/models'

const RadioOptionsList = styled.div``
const RadioOptionRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`

export const RequiredOrOptionalSection = ({ formField }: { formField: IFormField }) => {
  if (!formField.canChangeRequirementType) {
    return (
      <>
        <div>This field is always required</div>
      </>
    )
  }

  return (
    <RadioOptionsList>
      <RadioOptionRow>
        <Field type="radio" name="requirementType" value={'REQUIRED'} />
        <div>
          <label htmlFor="required">Required</label>
        </div>
      </RadioOptionRow>
      <RadioOptionRow>
        <Field type="radio" name="requirementType" value={'OPTIONAL'} />
        <div>
          <label htmlFor="optional">Optional</label>
        </div>
      </RadioOptionRow>
    </RadioOptionsList>
  )
}

export const DefaultValueSection = ({
  formField,
  severityList,
  statusList,
  incidentTypes
}: {
  formField: IFormField
  severityList: Array<IIncidentSeverity>
  statusList: Array<IIncidentStatus>
  incidentTypes: Array<IIncidentType>
}) => {
  if (!formField.canHaveDefaultValue) {
    return <div>A default value cannot be set for this field</div>
  }

  const formFieldComponent = getFormFieldComponent('defaultValue', formField, statusList, severityList, incidentTypes)

  return <div>{formFieldComponent}</div>
}

export const DescriptionSection = ({ formField }: { formField: IFormField }) => {
  if (!formField.canHaveDescription) {
    return <div>You cannot set a custom description for this field</div>
  }

  return (
    <div>
      <Field type="textarea" name="description" as={'textarea'} />
    </div>
  )
}
