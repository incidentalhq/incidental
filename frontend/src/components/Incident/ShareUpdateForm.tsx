import { useQuery } from '@tanstack/react-query'
import { Form, Formik, FormikHelpers } from 'formik'
import { useMemo } from 'react'
import * as Yup from 'yup'

import spinner from '@/assets/icons/spinner.svg'
import GeneralError from '@/components/Form/GeneralError'
import Icon from '@/components/Icon/Icon'
import { StyledButton } from '@/components/Theme/Styles'
import useApiService from '@/hooks/useApi'
import useGlobal from '@/hooks/useGlobal'
import { FieldInterfaceKind, FieldKind, RequirementType } from '@/types/enums'
import { IField, IForm, IFormField, IIncident, IIncidentType } from '@/types/models'
import { ICombinedFieldAndValue } from '@/types/special'

import Loading from '../Loading/Loading'
import { createCustomDefaultFieldValue } from './Field/utils'
import FormField from './FormField'

export type FormValues = Record<string, string | string[]>

interface Props {
  incident: IIncident
  form: IForm
  fieldValues: ICombinedFieldAndValue[]
  onSubmit: (values: FormValues, helpers: FormikHelpers<FormValues>) => void | Promise<void>
}

const createValidationSchema = (formFields: IFormField[]) => {
  const fieldsShape: Record<string, Yup.Schema> = {}

  for (const field of formFields) {
    if (field.requirementType === RequirementType.REQUIRED) {
      if (field.field.interfaceKind === FieldInterfaceKind.MULTI_SELECT) {
        fieldsShape[field.id] = Yup.array(Yup.string()).required('This field is required')
      } else {
        fieldsShape[field.id] = Yup.string().required('This field is required')
      }
    }
  }

  return Yup.object().shape(fieldsShape)
}

const getFieldDefaultValue = (field: IField, incident: IIncident, fieldValues: ICombinedFieldAndValue[]) => {
  switch (field.kind) {
    case FieldKind.INCIDENT_SEVERITY:
      return incident.incidentSeverity.id
    case FieldKind.INCIDENT_STATUS:
      return incident.incidentStatus.id
    case FieldKind.USER_DEFINED: {
      const customField = fieldValues.find((it) => it.field.id === field.id)
      if (customField && customField.value) {
        const defaultValueKv = createCustomDefaultFieldValue(customField.field, customField.value)
        return defaultValueKv[customField.field.id]
      }
    }
  }
}

const createDefaultValues = (
  formFields: IFormField[],
  incidentTypes: IIncidentType[],
  incident: IIncident,
  fieldValues: ICombinedFieldAndValue[]
) => {
  const defaultValues: Record<string, string | string[]> = {}

  for (const formField of formFields) {
    const value = getFieldDefaultValue(formField.field, incident, fieldValues)
    if (value) {
      defaultValues[formField.id] = value
    } else {
      defaultValues[formField.id] = formField.defaultValue ? formField.defaultValue : ''
    }
  }

  return defaultValues
}

const ShareUpdateForm: React.FC<Props> = ({ onSubmit, form, incident, fieldValues }) => {
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
      .sort((a, b) => (a.rank < b.rank ? -1 : 1))
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
      initialValues={createDefaultValues(
        formFieldsQuery.data.items,
        incidentTypesQuery.data.items,
        incident,
        fieldValues
      )}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-2">
          <GeneralError />
          {fields}
          <div>
            <StyledButton $primary={true} type="submit" disabled={isSubmitting}>
              {isSubmitting && <Icon icon={spinner} spin={true} />} Share update
            </StyledButton>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default ShareUpdateForm
