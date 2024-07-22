import { Form, Formik, FormikHelpers } from 'formik'
import * as Yup from 'yup'

import spinner from '@/assets/icons/spinner.svg'
import Field from '@/components/Form/Field'
import GeneralError from '@/components/Form/GeneralError'
import Icon from '@/components/Icon/Icon'
import { StyledButton } from '@/components/Theme/Styles'
import { IIncidentSeverity } from '@/types/models'

export type FormValues = {
  name: string
  description: string
  rating: number
}

interface Props {
  severity?: IIncidentSeverity
  onSubmit: (values: FormValues, helpers: FormikHelpers<FormValues>) => void | Promise<void>
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required(),
  description: Yup.string().required()
})

const SeverityForm: React.FC<Props> = ({ onSubmit, severity }) => {
  const defaultValues: FormValues = {
    name: severity ? severity.name : '',
    description: severity ? severity.description : '',
    rating: severity ? severity.rating : 0
  }

  return (
    <Formik validationSchema={validationSchema} onSubmit={onSubmit} initialValues={defaultValues}>
      {({ isSubmitting }) => (
        <Form className="space-y-2">
          <GeneralError />
          <div>
            <label>Name</label>
            <Field type="text" name="name" help="The name of the severity" />
          </div>
          <div>
            <label>Description</label>
            <Field name="description" as={'textarea'} help="Provide a more detailed explanation of the severity" />
          </div>
          <div>
            <label>Rank</label>
            <Field name="rating" type="number" help="The lower the rank, the higher the severity" />
          </div>
          <div>
            <StyledButton $primary={true} type="submit" disabled={isSubmitting}>
              {isSubmitting && <Icon spin={true} icon={spinner} />} {severity ? 'Update' : 'Create'}
            </StyledButton>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default SeverityForm
