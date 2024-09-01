import { Form, Formik, FormikHelpers } from 'formik'

import spinner from '@/assets/icons/spinner.svg'
import GeneralError from '@/components/Form/GeneralError'
import Icon from '@/components/Icon/Icon'
import { StyledButton } from '@/components/Theme/Styles'
import { RequirementType } from '@/types/enums'
import { IFormField, IIncidentSeverity, IIncidentStatus, IIncidentType } from '@/types/models'

import { DefaultValueSection, DescriptionSection, RequiredOrOptionalSection } from './FormFieldSettingsSections'

export type FormValues = {
  requirementType: RequirementType
  defaultValue: string | undefined
  description: string | undefined
}

interface Props {
  statusList: Array<IIncidentStatus>
  severityList: Array<IIncidentSeverity>
  incidentTypes: Array<IIncidentType>
  formField: IFormField
  onSubmit: (values: FormValues, helpers: FormikHelpers<FormValues>) => void | Promise<void>
}

const FormFieldSettingsForm: React.FC<Props> = ({ onSubmit, formField, statusList, severityList, incidentTypes }) => {
  const defaultValues: FormValues = {
    requirementType: formField.requirementType,
    defaultValue: formField.defaultValue ? formField.defaultValue : undefined,
    description: formField.description
      ? formField.description
      : formField.field.description
        ? formField.field.description
        : undefined
  }

  return (
    <Formik onSubmit={onSubmit} initialValues={defaultValues}>
      {({ isSubmitting }) => (
        <Form className="space-y-2">
          <GeneralError />
          <div>
            <label>When is this field required</label>
            <RequiredOrOptionalSection formField={formField} />
          </div>
          <div>
            <label>Default value</label>
            <DefaultValueSection
              formField={formField}
              statusList={statusList}
              severityList={severityList}
              incidentTypes={incidentTypes}
            />
          </div>
          <div>
            <label>Description</label>
            <DescriptionSection formField={formField} />
          </div>
          <div>
            <StyledButton $primary={true} type="submit" disabled={isSubmitting}>
              {isSubmitting && <Icon spin={true} icon={spinner} />} Update
            </StyledButton>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default FormFieldSettingsForm
