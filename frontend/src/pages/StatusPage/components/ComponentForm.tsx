import { Form, Formik } from 'formik'
import React from 'react'
import * as Yup from 'yup'

import Button from '@/components/Button/Button'
import Field from '@/components/Form/Field'

import { ComponentValue } from '../types'

interface Props {
  component?: ComponentValue
  onSubmit: (values: FormValues) => void
}

export interface FormValues {
  name: string
}

const validationSchema = Yup.object({
  name: Yup.string().required('Component name is required')
})

const ComponentForm: React.FC<Props> = ({ component, onSubmit }) => {
  const initialValues = {
    name: component ? component.name : ''
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
            <Button type="submit">Save</Button>
          </div>
        </Form>
      </Formik>
    </div>
  )
}

export default ComponentForm
