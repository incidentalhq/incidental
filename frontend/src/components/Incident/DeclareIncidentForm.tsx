import { Form, Formik, FormikHelpers } from 'formik'
import { ReactElement } from 'react'
import * as Yup from 'yup'

import Field from '@/components/Form/Field'
import GeneralError from '@/components/Form/GeneralError'
import { Button } from '@/components/Theme/Styles'
import useGlobal from '@/hooks/useGlobal'
import { FormFieldKind } from '@/types/enums'
import { IForm, IFormField, IIncidentSeverity, IIncidentStatus, IIncidentType } from '@/types/models'

import SelectField from '../Form/SelectField'

const validationSchema = Yup.object().shape({
  name: Yup.string().required('A name is required')
})

export type FormValues = Yup.InferType<typeof validationSchema>

interface Props {
  form: IForm
  onSubmit: (values: FormValues, helpers: FormikHelpers<FormValues>) => void | Promise<void>
}

const renderField = (
  formField: IFormField,
  statusList: IIncidentStatus[],
  severityList: IIncidentSeverity[],
  incidentTypes: IIncidentType[]
) => {
  const inputComponent: ReactElement | null = null

  switch (formField.kind) {
    case FormFieldKind.TEXTAREA:
      return (
        <div>
          <label>{formField.label}</label>
          <Field as={'textarea'} key={formField.id} name={formField.name} type="textarea" />
          {formField.description}
        </div>
      )
    case FormFieldKind.TEXT:
      return (
        <div>
          <label>{formField.label}</label>
          <Field key={formField.id} name={formField.name} type="text" />
          {formField.description}
        </div>
      )
    case FormFieldKind.INCIDENT_STATUS: {
      const options = statusList.map((it) => ({
        label: it.name,
        value: it.id
      }))
      return (
        <div>
          <label>{formField.label}</label>
          <SelectField key={formField.id} name={formField.name} options={options} />
          {formField.description}
        </div>
      )
    }
    case FormFieldKind.SEVERITY_TYPE: {
      const options = severityList.map((it) => ({
        label: it.name,
        value: it.id
      }))
      return (
        <div>
          <label>{formField.label}</label>
          <SelectField key={formField.id} name={formField.name} options={options} />
          {formField.description}
        </div>
      )
    }
    case FormFieldKind.INCIDENT_TYPE: {
      const options = incidentTypes.map((it) => ({
        label: it.name,
        value: it.id
      }))
      return (
        <div>
          <label>{formField.label}</label>
          <SelectField key={formField.id} name={formField.name} options={options} />
          {formField.description}
        </div>
      )
    }
  }
}

const DeclareIncidentForm: React.FC<Props> = ({ onSubmit, form }) => {
  const { statusList, severityList, incidentTypes } = useGlobal()
  const fields = form.formFields
    .sort((a, b) => (a.position < b.position ? -1 : 1))
    .map((it) => renderField(it, statusList, severityList, incidentTypes))

  return (
    <Formik validationSchema={validationSchema} initialValues={{ name: '' }} onSubmit={onSubmit}>
      {({ isSubmitting }) => (
        <Form className="space-y-2">
          <GeneralError />
          {fields}
          <div>
            <Button $primary={true} type="submit" disabled={isSubmitting}>
              Declare incident
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default DeclareIncidentForm
