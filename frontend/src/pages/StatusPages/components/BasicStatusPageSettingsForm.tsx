import { Form, Formik, FormikHelpers } from 'formik'
import React from 'react'
import styled from 'styled-components'
import * as Yup from 'yup'

import Button from '@/components/Button/Button'
import Field from '@/components/Form/Field'
import FieldWithSuffix from '@/components/Form/FieldWithSuffix'
import { IStatusPage } from '@/types/models'

const FormSectionTitle = styled.h3`
  margin-top: 2rem;
`

interface Props {
  statusPage: IStatusPage
  onSubmit: (values: FormValues, helpers: FormikHelpers<FormValues>) => void
}

export interface FormValues {
  name: string
  slug: string
  supportUrl: string
  supportLabel: string
  privacyPolicyUrl: string
  termsOfServiceUrl: string
}

const validationSchema = Yup.object({
  name: Yup.string().required('Title is required'),
  slug: Yup.string().required('Required'),
  supportUrl: Yup.string().url('Invalid URL'),
  supportLabel: Yup.string().required('Required'),
  privacyPolicyUrl: Yup.string().url('Invalid URL'),
  termsOfServiceUrl: Yup.string().url('Invalid URL')
})

const BasicStatusPageSettingsForm: React.FC<Props> = ({ onSubmit, statusPage }) => {
  const initialValues = {
    name: statusPage.name,
    slug: statusPage.slug,
    supportUrl: statusPage.supportUrl,
    supportLabel: statusPage.supportLabel,
    privacyPolicyUrl: statusPage.privacyPolicyUrl,
    termsOfServiceUrl: statusPage.termsOfServiceUrl
  }

  return (
    <div>
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
        <Form className="space-y-2">
          <h3>Basic settings</h3>
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
          <FormSectionTitle>Customisation</FormSectionTitle>
          <div>
            <label>Support url</label>
            <Field
              type="text"
              id="support-url"
              name="supportUrl"
              help="Where customers can find support information."
              placeholder="https://support.example.com"
            />
          </div>
          <div>
            <label>Support label</label>
            <Field
              type="text"
              id="support-label"
              name="supportLabel"
              help="The text for the support link."
              placeholder="Support"
            />
          </div>
          <div>
            <label>Privacy policy</label>
            <Field
              type="text"
              id="privacy-policy-url"
              name="privacyPolicyUrl"
              help="Your company's privacy policy page"
              placeholder="https://example.com/privacy"
            />
          </div>
          <div>
            <label>Terms of service</label>
            <Field
              type="text"
              id="terms-of-service-url"
              name="termsOfServiceUrl"
              help="Your company's terms of service page"
              placeholder="https://example.com/terms"
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
