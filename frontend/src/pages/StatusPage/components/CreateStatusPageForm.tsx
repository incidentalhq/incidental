import { Form, Formik } from 'formik'
import React from 'react'
import * as Yup from 'yup'

import Button from '@/components/Button/Button'
import Field from '@/components/Form/Field'
import FieldWithPrefix from '@/components/Form/FieldWithPrefix'

interface Props {
  onSubmit: (values: FormValues) => void
}

export interface FormValues {
  name: string
  slug: string
}

const validationSchema = Yup.object({
  name: Yup.string().required('Title is required'),
  slug: Yup.string().required('Required')
})

const CreateStatusPageForm: React.FC<Props> = ({ onSubmit }) => {
  const initialValues = {
    name: '',
    slug: ''
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
            <FieldWithPrefix prefix={import.meta.env.VITE_STATUS_PAGE_URL + '/'} name="slug" />
          </div>
          <div>
            <Button type="submit">Next</Button>
          </div>
        </Form>
      </Formik>
    </div>
  )
}

export default CreateStatusPageForm
