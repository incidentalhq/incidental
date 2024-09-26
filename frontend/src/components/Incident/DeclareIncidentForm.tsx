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
import { IForm, IFormField, IIncidentType } from '@/types/models'

import Loading from '../Loading/Loading'
import FormField from './FormField'

export type FormValues = Record<string, string>

interface Props {
  form: IForm
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
