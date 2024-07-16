import { Form, Formik, FormikHelpers } from 'formik'
import { ReactElement } from 'react'
import styled from 'styled-components'
import * as Yup from 'yup'

import spinner from '@/assets/icons/spinner.svg'
import Field from '@/components/Form/Field'
import GeneralError from '@/components/Form/GeneralError'
import Icon from '@/components/Icon/Icon'
import { StyledButton } from '@/components/Theme/Styles'
import useGlobal from '@/hooks/useGlobal'
import { FieldInterfaceKind, FieldKind } from '@/types/enums'
import { IForm, IFormField, IIncidentSeverity, IIncidentStatus, IIncidentType } from '@/types/models'

import SelectField from '../Form/SelectField'

const Optional = styled.span`
  color: var(--color-gray-400);
`

export type FormValues = Record<string, string>

interface Props {
  form: IForm
  onSubmit: (values: FormValues, helpers: FormikHelpers<FormValues>) => void | Promise<void>
}

interface FormFieldProps {
  formField: IFormField
  statusList: IIncidentStatus[]
  severityList: IIncidentSeverity[]
  incidentTypes: IIncidentType[]
}

const createValidationSchema = (formFields: IFormField[]) => {
  const fieldsShape: Record<string, Yup.StringSchema> = {}

  for (const field of formFields) {
    if (field.isRequired) {
      fieldsShape[field.id] = Yup.string().required('This field is required')
    }
  }

  return Yup.object().shape(fieldsShape)
}

const createDefaultValues = (formFields: IFormField[]) => {
  const defaultValues: Record<string, string> = {}

  for (const field of formFields) {
    defaultValues[field.id] = ''
  }

  return defaultValues
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

const DeclareIncidentForm: React.FC<Props> = ({ onSubmit, form }) => {
  const { statusList, severityList, incidentTypes } = useGlobal()
  const fields = form.formFields
    .sort((a, b) => (a.position < b.position ? -1 : 1))
    .map((it) => (
      <FormField
        key={it.id}
        formField={it}
        statusList={statusList}
        severityList={severityList}
        incidentTypes={incidentTypes}
      />
    ))

  const handleSubmit = (values: FormValues, helpers: FormikHelpers<FormValues>) => {
    onSubmit(values, helpers)
  }

  return (
    <Formik
      validationSchema={createValidationSchema(form.formFields)}
      onSubmit={handleSubmit}
      initialValues={createDefaultValues(form.formFields)}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-2">
          <GeneralError />
          {fields}
          <div>
            <StyledButton $primary={true} type="submit" disabled={isSubmitting}>
              {isSubmitting && <Icon icon={spinner} spin={true} />} Declare incident
            </StyledButton>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default DeclareIncidentForm
