import { useQuery } from '@tanstack/react-query'
import { Form, Formik, FormikHelpers } from 'formik'
import { useMemo } from 'react'
import * as Yup from 'yup'

import Field from '@/components/Form/Field'
import { Button } from '@/components/Theme/Styles'
import useApiService from '@/hooks/useApi'
import { IIncident, ITimestamp, ModelID } from '@/types/models'
import { formatForDateTimeInput } from '@/utils/time'

interface Props {
  incident: IIncident
  onSubmit: (values: FormValues, helpers: FormikHelpers<FormValues>) => void
}

export interface FormValues {
  [key: ModelID]: string
}

type GroupedTimestamps = { custom: Array<ITimestamp>; system: Array<ITimestamp> }

const validationSchema = Yup.object().shape({})

const EditTimestampsForm: React.FC<Props> = ({ incident, onSubmit }) => {
  const { apiService } = useApiService()

  // fetch available timestamps for organisation
  const timestampsQuery = useQuery({
    queryKey: ['timestamps'],
    queryFn: () => apiService.getTimestamps()
  })

  // convert to values that can be used by datetime-local <input>
  const defaultValues = incident.timestampValues.reduce(
    (prev, current) => {
      prev[current.timestamp.id] = formatForDateTimeInput(current.value)
      return prev
    },
    {} as Record<ModelID, string>
  )

  // group by custom and system timestamps
  const grouped = useMemo(() => {
    if (!timestampsQuery.data) {
      return { custom: [], system: [] }
    }
    return timestampsQuery.data!.items.reduce(
      (prev, current) => {
        if (current.kind === 'CUSTOM') {
          prev['custom'].push(current)
        } else {
          prev['system'].push(current)
        }
        return prev
      },
      { custom: [], system: [] } as GroupedTimestamps
    )
  }, [timestampsQuery.data])

  return (
    <Formik<FormValues> validationSchema={validationSchema} initialValues={defaultValues} onSubmit={onSubmit}>
      {({ isSubmitting }) => (
        <Form className="space-y-2">
          {timestampsQuery.isSuccess ? (
            <>
              <h3>System timestamps</h3>
              {grouped['system'].map((it) => {
                return (
                  <div key={it.id}>
                    <label>{it.label}</label>
                    <div>
                      <Field name={it.id} type="datetime-local" />
                    </div>
                  </div>
                )
              })}

              <h3>Custom timestamps</h3>
              {grouped['custom'].map((it) => {
                return (
                  <div key={it.id}>
                    <label>{it.label}</label>
                    <div>
                      <Field name={it.id} type="datetime-local" />
                    </div>
                  </div>
                )
              })}
            </>
          ) : (
            <div></div>
          )}
          <div>
            <Button type="submit" disabled={isSubmitting}>
              Update timestamps
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default EditTimestampsForm
