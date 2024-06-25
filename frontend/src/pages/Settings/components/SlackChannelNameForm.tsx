import { Form, Formik, FormikHelpers } from 'formik'
import * as Yup from 'yup'

import spinner from '@/assets/icons/spinner.svg'
import Field from '@/components/Form/Field'
import GeneralError from '@/components/Form/GeneralError'
import Icon from '@/components/Icon/Icon'
import { Button } from '@/components/Theme/Styles'
import { ISettings } from '@/types/models'

export type FormValues = {
  slackChannelNameFormat: string
  incidentReferenceFormat: string
  slackAnnouncementChannelName: string
}

interface Props {
  settings: ISettings
  onSubmit: (values: FormValues, helpers: FormikHelpers<FormValues>) => void | Promise<void>
}

const validationSchema = Yup.object<FormValues>().shape({
  slackAnnouncementChannelName: Yup.string().required(),
  incidentReferenceFormat: Yup.string().required(),
  slackChannelNameFormat: Yup.string().required()
})

const SlackChannelNameForm: React.FC<Props> = ({ onSubmit, settings }) => {
  const defaultValues: FormValues = {
    slackChannelNameFormat: settings.slackChannelNameFormat,
    incidentReferenceFormat: settings.incidentReferenceFormat,
    slackAnnouncementChannelName: settings.slackAnnouncementChannelName
  }

  return (
    <Formik validationSchema={validationSchema} onSubmit={onSubmit} initialValues={defaultValues}>
      {({ isSubmitting }) => (
        <Form className="space-y-2">
          <GeneralError />

          <div>
            <label>Incident reference format</label>
            <Field name="incidentReferenceFormat" type="text" />
          </div>

          <div>
            <label>Slack channel announcements channel</label>
            <Field name="slackAnnouncementChannelName" type="text" />
          </div>
          <div>
            <label>Slack channel name format</label>
            <Field name="slackChannelNameFormat" type="text" />
          </div>

          <div>
            <Button $primary={true} type="submit" disabled={isSubmitting}>
              {isSubmitting && <Icon spin={true} icon={spinner} />} Update
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default SlackChannelNameForm
