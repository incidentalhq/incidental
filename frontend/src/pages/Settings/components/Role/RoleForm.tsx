import { Form, Formik, FormikHelpers } from 'formik'
import * as Yup from 'yup'

import spinner from '@/assets/icons/spinner.svg'
import Field from '@/components/Form/Field'
import GeneralError from '@/components/Form/GeneralError'
import Icon from '@/components/Icon/Icon'
import { StyledButton } from '@/components/Theme/Styles'
import { IIncidentRole } from '@/types/models'

export type FormValues = {
  name: string
  description: string
  slackReference: string
  guide: string
}

interface Props {
  role?: IIncidentRole
  onSubmit: (values: FormValues, helpers: FormikHelpers<FormValues>) => void | Promise<void>
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required(),
  description: Yup.string().required(),
  slackReference: Yup.string().required(),
  guide: Yup.string().optional()
})

const RoleForm: React.FC<Props> = ({ onSubmit, role }) => {
  const defaultValues: FormValues = {
    name: role ? role.name : '',
    description: role ? role.description : '',
    slackReference: role ? role.slackReference : '',
    guide: role?.guide ?? ''
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
            <label>Slack reference</label>
            <Field name="slackReference" type="text" />
          </div>
          <div>
            <label>Guide</label>
            <Field name="guide" as={'textarea'} />
          </div>
          <div>
            <StyledButton $primary={true} type="submit" disabled={isSubmitting}>
              {isSubmitting && <Icon spin={true} icon={spinner} />} {role ? 'Update' : 'Create'}
            </StyledButton>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default RoleForm
