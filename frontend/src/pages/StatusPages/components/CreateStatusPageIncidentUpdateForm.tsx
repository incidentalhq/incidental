import { Form, Formik } from 'formik'
import React from 'react'
import styled from 'styled-components'
import * as Yup from 'yup'

import Button from '@/components/Button/Button'
import Field from '@/components/Form/Field'
import SelectField from '@/components/Form/SelectField'
import { ComponentStatus, StatusPageIncidentStatus } from '@/types/enums'
import { IStatusPage, IStatusPageIncident, IStatusPageIncidentUpdate } from '@/types/models'

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
  statusPageIncident: IStatusPageIncident
  statusPage: IStatusPage
  onSubmit: (values: FormValues) => void
}

export interface FormValues {
  message: string
  status: string
  affectedComponents: Record<string, ComponentStatus>
}

const validationSchema = Yup.object({
  message: Yup.string().required('Required'),
  status: Yup.string().required('Required'),
  affectedComponents: Yup.object().required('Required')
})

// map status page incident status to options
const statusOptions = Object.values(StatusPageIncidentStatus).map((status) => ({
  value: status,
  label: statusToTitleCase(status)
}))

const componentStatusOptions = Object.values(ComponentStatus).map((status) => ({
  value: status,
  label: statusToTitleCase(status)
}))

const createDefaultValues = (incidentUpdate: IStatusPageIncidentUpdate) => {
  const acc = incidentUpdate.componentUpdates.reduce(
    (acc, item) => {
      acc[item.statusPageComponent.id] = item.status
      return acc
    },
    {} as Record<string, ComponentStatus>
  )

  return acc
}

const CreateStatusPageIncidentUpdateForm: React.FC<Props> = ({ onSubmit, statusPage, statusPageIncident }) => {
  const initialValues = {
    message: '',
    status: statusPageIncident.status,
    affectedComponents: createDefaultValues(statusPageIncident.incidentUpdates[0])
  }

  return (
    <div>
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
        {({ setFieldValue, values }) => (
          <Form className="space-y-2">
            <div>
              <label htmlFor="message">Message</label>
              <Field as={'textarea'} type="text" id="message" name="message" />
            </div>
            <div>
              <label htmlFor="status">Status</label>
              <SelectField
                name="status"
                options={statusOptions}
                onChangeValue={(value: number | string | undefined) => {
                  if (value === StatusPageIncidentStatus.RESOLVED) {
                    Object.keys(initialValues.affectedComponents).forEach((key) => {
                      setFieldValue(`affectedComponents.${key}`, ComponentStatus.OPERATIONAL)
                    })
                  }
                }}
              />
            </div>
            <div>
              <label>Affected components</label>
              {values.status !== StatusPageIncidentStatus.RESOLVED ? (
                <>
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
                </>
              ) : (
                <>
                  <p>
                    When the status of the incident is set to resolved, all components will be marked as operational
                  </p>
                </>
              )}
            </div>
            <div>
              <Button type="submit">Next</Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default CreateStatusPageIncidentUpdateForm
