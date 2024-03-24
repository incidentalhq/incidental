import { faSpinner } from '@fortawesome/pro-duotone-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Form, Formik, FormikHelpers } from 'formik'
import * as Yup from 'yup'

import Field from '@/components/Form/Field'
import GeneralError from '@/components/Form/GeneralError'
import { Button } from '@/components/Theme/Styles'
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
            <Field type="text" name="name" />
          </div>
          <div>
            <label>Description</label>
            <Field name="description" as={'textarea'} />
          </div>
          <div>
            <label>Rating</label>
            <Field name="rating" type="number" />
          </div>
          <div>
            <Button $primary={true} type="submit" disabled={isSubmitting}>
              {isSubmitting && <FontAwesomeIcon spin icon={faSpinner} />} {severity ? 'Update' : 'Create'}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default SeverityForm
