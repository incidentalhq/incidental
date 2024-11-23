import { Form, Formik, FormikHelpers } from 'formik'
import React from 'react'
import * as Yup from 'yup'

import Button from '@/components/Button/Button'
import Field from '@/components/Form/Field'
import FieldWithSuffix from '@/components/Form/FieldWithSuffix'
import { IStatusPage } from '@/types/models'

interface Props {
  statusPage: IStatusPage
  onSubmit: (values: FormValues, helpers: FormikHelpers<FormValues>) => void
}

export interface FormValues {
  name: string
  slug: string
}

const validationSchema = Yup.object({
  name: Yup.string().required('Title is required'),
  slug: Yup.string().required('Required')
})

const BasicStatusPageSettingsForm: React.FC<Props> = ({ onSubmit, statusPage }) => {
  const initialValues = {
    name: statusPage.name,
    slug: statusPage.slug
  }

  return (
    <div>
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
        <Form className="space-y-2">
          <div>
            <label htmlFor="title">Name</label>
            <Field type="text" id="name" name="name" />
          </div>
          <div>
            <label htmlFor="slug">Url</label>
            <FieldWithSuffix
              suffix={`.${import.meta.env.VITE_STATUS_PAGE_DOMAIN}`}
              name="slug"
              placeholder="Subdomain"
            />
          </div>
          <div>
            <Button type="submit">Save</Button>
          </div>
        </Form>
      </Formik>
    </div>
  )
}

export default BasicStatusPageSettingsForm
