import { useQuery } from '@tanstack/react-query'
import { Form, Formik, FormikHelpers } from 'formik'
import { ReactElement, useMemo } from 'react'
import styled from 'styled-components'
import * as Yup from 'yup'

import spinner from '@/assets/icons/spinner.svg'
import Field from '@/components/Form/Field'
import GeneralError from '@/components/Form/GeneralError'
import Icon from '@/components/Icon/Icon'
import { StyledButton } from '@/components/Theme/Styles'
import useApiService from '@/hooks/useApi'
import useGlobal from '@/hooks/useGlobal'
import { FieldInterfaceKind, FieldKind, IncidentStatusCategory } from '@/types/enums'
import { IForm, IFormField, IIncidentSeverity, IIncidentStatus, IIncidentType } from '@/types/models'

import SelectField from '../Form/SelectField'
import Loading from '../Loading/Loading'

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
  severityList: IIncidentSeverity[]
  statusList: IIncidentStatus[]
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

const createDefaultValues = (formFields: IFormField[], incidentTypes: IIncidentType[]) => {
  const defaultValues: Record<string, string> = {}

  for (const field of formFields) {
    if (field.field.kind === FieldKind.INCIDENT_TYPE) {
      defaultValues[field.id] = incidentTypes.find((it) => it.isDefault)?.id ?? ''
    } else {
      defaultValues[field.id] = field.defaultValue ? field.defaultValue : ''
    }
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

const DeclareIncidentForm: React.FC<Props> = ({ onSubmit, form }) => {
  const { organisation } = useGlobal()
  const { apiService } = useApiService()

  const incidentTypesQuery = useQuery({
    queryKey: ['incident-types', organisation!.id],
    queryFn: () => apiService.getIncidentTypes()
  })

  const formFieldsQuery = useQuery({
    queryKey: ['form-fields', form.id],
    queryFn: () => apiService.getFormFields(form)
  })

  const incidentStatusQuery = useQuery({
    queryKey: ['incident-statuses', organisation!.id],
    queryFn: () => apiService.getIncidentStatuses()
  })

  const severitiesQuery = useQuery({
    queryKey: ['severities', organisation!.id],
    queryFn: () => apiService.getIncidentSeverities()
  })

  const fields = useMemo(() => {
    if (
      !incidentTypesQuery.isSuccess ||
      !formFieldsQuery.isSuccess ||
      !incidentStatusQuery.isSuccess ||
      !severitiesQuery.isSuccess
    ) {
      return []
    }

    return formFieldsQuery.data.items
      .sort((a, b) => (a.position < b.position ? -1 : 1))
      .map((it) => (
        <FormField
          key={it.id}
          formField={it}
          statusList={incidentStatusQuery.data.items}
          severityList={severitiesQuery.data.items}
          incidentTypes={incidentTypesQuery.data.items}
        />
      ))
  }, [incidentTypesQuery, formFieldsQuery, incidentStatusQuery, severitiesQuery])

  const handleSubmit = (values: FormValues, helpers: FormikHelpers<FormValues>) => {
    onSubmit(values, helpers)
  }

  if (!incidentTypesQuery.isSuccess || !formFieldsQuery.isSuccess) {
    return <Loading />
  }

  return (
    <Formik
      validationSchema={createValidationSchema(formFieldsQuery.data.items)}
      onSubmit={handleSubmit}
      initialValues={createDefaultValues(formFieldsQuery.data.items, incidentTypesQuery.data.items)}
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
