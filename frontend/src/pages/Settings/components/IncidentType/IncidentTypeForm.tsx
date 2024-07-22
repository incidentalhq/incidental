import { Form, Formik, FormikHelpers } from 'formik'
import * as Yup from 'yup'

import spinner from '@/assets/icons/spinner.svg'
import Field from '@/components/Form/Field'
import GeneralError from '@/components/Form/GeneralError'
import SelectListField, { type OptionItem as SelectItem } from '@/components/Form/SelectList'
import Icon from '@/components/Icon/Icon'
import { StyledButton } from '@/components/Theme/Styles'
import { IField, IIncidentType } from '@/types/models'

export type FormValues = {
  name: string
  description: string
  fields: Array<SelectItem>
}

interface Props {
  incidentType?: IIncidentType
  fields: IField[]
  onSubmit: (values: FormValues, helpers: FormikHelpers<FormValues>) => void | Promise<void>
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required(),
  description: Yup.string()
})

const toSelectListItems = (fields: IField[]) => fields.map((it) => ({ value: it.id, label: it.label }))

const IncidentTypeForm: React.FC<Props> = ({ onSubmit, incidentType, fields }) => {
  const defaultValues: FormValues = {
    name: incidentType ? incidentType.name : '',
    description: incidentType ? incidentType.description ?? '' : '',
    fields: incidentType ? toSelectListItems(incidentType.fields) : []
  }

  return (
    <Formik validationSchema={validationSchema} onSubmit={onSubmit} initialValues={defaultValues}>
      {({ isSubmitting }) => (
        <Form className="space-y-2">
          <GeneralError />
          <div>
            <label>Name</label>
            <Field type="text" name="name" help="A short descriptive name for this incident type" />
          </div>
          <div>
            <label>Description</label>
            <Field name="description" as={'textarea'} help="Provide better information about this incident type" />
          </div>
          <div>
            <label>Fields</label>
            <p>Select the custom fields which will be available for this incident type</p>
            <SelectListField name="fields" items={toSelectListItems(fields)} />
          </div>
          <div>
            <StyledButton $primary={true} type="submit" disabled={isSubmitting}>
              {isSubmitting && <Icon spin={true} icon={spinner} />} {incidentType ? 'Update' : 'Create'}
            </StyledButton>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default IncidentTypeForm
