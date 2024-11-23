import { Form, Formik } from 'formik'
import React from 'react'
import * as Yup from 'yup'

import Button from '@/components/Button/Button'
import Field from '@/components/Form/Field'
import { IStatusPage } from '@/types/models'

interface Props {
  statusPage: IStatusPage
  onSubmit: (values: FormValues) => void
  onDelete: () => void
}

export interface FormValues {
  customDomain: string
}

const validationSchema = Yup.object({
  customDomain: Yup.string()
})

const DomainSettingsForm: React.FC<Props> = ({ onSubmit, statusPage, onDelete }) => {
  const initialValues = {
    customDomain: statusPage.customDomain ? statusPage.customDomain : ''
  }

  return (
    <div>
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
        {({ isSubmitting }) => (
          <Form className="space-y-2">
            <div>
              <label htmlFor="customDomain">Custom domain</label>
              <Field type="text" id="customDomain" name="customDomain" />
            </div>
            <div>
              <Button disabled={isSubmitting} type="submit">
                Save
              </Button>{' '}
              <a href="#" onClick={onDelete}>
                Delete domain
              </a>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default DomainSettingsForm
