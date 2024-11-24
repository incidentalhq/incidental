import { Form, Formik } from 'formik'
import React from 'react'
import styled from 'styled-components'
import * as Yup from 'yup'

import Button from '@/components/Button/Button'
import Field from '@/components/Form/Field'
import SelectField from '@/components/Form/SelectField'
import { ComponentStatus, StatusPageIncidentStatus } from '@/types/enums'
import { IStatusPage } from '@/types/models'

import { statusToTitleCase } from '../utils'

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: space-between;
  margin-bottom: 1rem;
`
const Group = styled.div`
  h3 {
    font-size: 1rem;
    margin-bottom: 1rem;
  }

  ${Row} {
    margin-left: 1rem;
  }
`

interface Props {
  statusPage: IStatusPage
  onSubmit: (values: FormValues) => void
}

export interface FormValues {
  name: string
  message: string
  status: string
  affectedComponents: Record<string, ComponentStatus>
}

const validationSchema = Yup.object({
  name: Yup.string().required('Title is required'),
  message: Yup.string().required('Required'),
  status: Yup.string().required('Required'),
  affectedComponents: Yup.object().required('Required')
})

// map status page incident status to options
const statusOptions = Object.values(StatusPageIncidentStatus)
  .map((status) => ({
    value: status,
    label: statusToTitleCase(status)
  }))
  .filter((status) => status.value !== StatusPageIncidentStatus.RESOLVED)

const componentStatusOptions = Object.values(ComponentStatus).map((status) => ({
  value: status,
  label: statusToTitleCase(status)
}))

const createDefaultValues = (statusPage: IStatusPage) => {
  const acc = statusPage.statusPageItems.reduce(
    (acc, item) => {
      if (item.statusPageComponent) {
        acc[item.statusPageComponent.id] = ComponentStatus.OPERATIONAL
      }
      if (item.statusPageComponentGroup) {
        item.statusPageItems?.forEach((subItem) => {
          if (subItem.statusPageComponent) {
            acc[subItem.statusPageComponent.id] = ComponentStatus.OPERATIONAL
          }
        })
      }
      return acc
    },
    {} as Record<string, ComponentStatus>
  )

  return acc
}

const CreateStatusPageIncidentForm: React.FC<Props> = ({ onSubmit, statusPage }) => {
  const initialValues = {
    name: '',
    message: '',
    status: '',
    affectedComponents: createDefaultValues(statusPage)
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
            <label htmlFor="message">Message</label>
            <Field as={'textarea'} type="text" id="message" name="message" />
          </div>
          <div>
            <label htmlFor="status">Status</label>
            <SelectField name="status" options={statusOptions} />
          </div>
          <div>
            <label>Affected components</label>
            <p>Set the status of each component</p>
            {statusPage.statusPageItems.map((item) => {
              if (item.statusPageComponent) {
                return (
                  <Row key={item.id}>
                    <span>{item.statusPageComponent.name}</span>
                    <SelectField
                      name={`affectedComponents.${item.statusPageComponent.id}`}
                      options={componentStatusOptions}
                    />
                  </Row>
                )
              }
              if (item.statusPageComponentGroup) {
                return (
                  <Group key={item.id}>
                    <h3>{item.statusPageComponentGroup.name}</h3>
                    {item.statusPageItems?.map((subItem) => (
                      <Row key={subItem.id}>
                        <span>{subItem.statusPageComponent?.name}</span>
                        <SelectField
                          name={`affectedComponents.${subItem.statusPageComponent?.id}`}
                          options={componentStatusOptions}
                        />
                      </Row>
                    ))}
                  </Group>
                )
              }
            })}
          </div>
          <div>
            <Button type="submit">Next</Button>
          </div>
        </Form>
      </Formik>
    </div>
  )
}

export default CreateStatusPageIncidentForm
