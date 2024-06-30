import { Form, Formik, FormikHelpers } from 'formik'
import * as Yup from 'yup'

import spinner from '@/assets/icons/spinner.svg'
import Field from '@/components/Form/Field'
import GeneralError from '@/components/Form/GeneralError'
import Icon from '@/components/Icon/Icon'
import { StyledButton } from '@/components/Theme/Styles'
import { ITimestamp } from '@/types/models'

export type FormValues = {
  label: string
  description: string
}

interface Props {
  timestamp?: ITimestamp
  onSubmit: (values: FormValues, helpers: FormikHelpers<FormValues>) => void | Promise<void>
}

const validationSchema = Yup.object().shape({
  label: Yup.string().required(),
  description: Yup.string().required()
})

const TimestampForm: React.FC<Props> = ({ onSubmit, timestamp }) => {
  const defaultValues: FormValues = {
    label: timestamp ? timestamp.label : '',
    description: timestamp ? timestamp.description : ''
  }

  return (
    <Formik validationSchema={validationSchema} onSubmit={onSubmit} initialValues={defaultValues}>
      {({ isSubmitting }) => (
        <Form className="space-y-2">
          <GeneralError />
          <div>
            <label>Label</label>
            <Field type="text" name="label" />
          </div>
          <div>
            <label>Description</label>
            <Field name="description" as={'textarea'} />
          </div>
          <div>
            <StyledButton $primary={true} type="submit" disabled={isSubmitting}>
              {isSubmitting && <Icon spin={true} icon={spinner} />} {timestamp ? 'Update' : 'Create'}
            </StyledButton>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default TimestampForm
