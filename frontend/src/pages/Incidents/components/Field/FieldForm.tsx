import { Form, Formik, FormikHelpers } from 'formik'
import { useMemo } from 'react'
import * as Yup from 'yup'

import Field from '@/components/Form/Field'
import SelectField from '@/components/Form/SelectField'
import SelectListField, { OptionItem } from '@/components/Form/SelectList'
import { StyledButton } from '@/components/Theme/Styles'
import { FieldInterfaceKind } from '@/types/enums'
import { IField, IIncident, IIncidentFieldValue } from '@/types/models'

interface Props {
  incident: IIncident
  field: IField
  value: IIncidentFieldValue | null
  onSubmit: (values: FormValues, helpers: FormikHelpers<FormValues>) => void
}

export interface FormValues {
  [x: string]: {
    valueText?: string
    valueMultiSelect?: Array<OptionItem>
    valueSingleSelect?: string
  }
}

const toOptions = (values: string[]) => values.map((it) => ({ value: it, label: it }))

const FieldContainer = ({ field }: { field: IField }) => {
  switch (field.interfaceKind) {
    case FieldInterfaceKind.TEXT:
      return <Field name={`${field.id}.valueText`} type="text" />
    case FieldInterfaceKind.SINGLE_SELECT:
      return <SelectField name={`${field.id}.valueSingleSelect`} options={toOptions(field.availableOptions ?? [])} />
    case FieldInterfaceKind.MULTI_SELECT:
      return <SelectListField name={`${field.id}.valueMultiSelect`} items={toOptions(field.availableOptions ?? [])} />
    default:
      throw Error('field type not supported')
  }
}

const createDefaultFieldValue = (field: IField, value: IIncidentFieldValue | null) => {
  const defaultFieldValue: Record<
    string,
    {
      valueText?: string
      valueSingleSelect?: string
      valueMultiSelect?: Array<OptionItem>
    }
  > = {
    [field.id]: {
      valueText: undefined,
      valueSingleSelect: undefined,
      valueMultiSelect: undefined
    }
  }
  switch (field.interfaceKind) {
    case FieldInterfaceKind.MULTI_SELECT:
      defaultFieldValue[field.id].valueMultiSelect = value ? toOptions(value.valueMultiSelect) : []
      break
    case FieldInterfaceKind.SINGLE_SELECT:
      defaultFieldValue[field.id].valueSingleSelect = value ? value.valueSingleSelect : ''
      break
    case FieldInterfaceKind.TEXT:
      defaultFieldValue[field.id].valueText = value ? value.valueText : ''
      break
    case FieldInterfaceKind.TEXTAREA:
      defaultFieldValue[field.id].valueText = value ? value.valueText : ''
      break
  }

  return defaultFieldValue
}

const createFieldValidationSchema = (field: IField) => {
  switch (field.interfaceKind) {
    case FieldInterfaceKind.MULTI_SELECT:
      return Yup.object().shape({
        valueMultiSelect: Yup.array().min(1).required()
      })
    case FieldInterfaceKind.SINGLE_SELECT:
      return Yup.object().shape({
        valueSingleSelect: Yup.string().required()
      })
    case FieldInterfaceKind.TEXT:
      return Yup.object().shape({
        valueText: Yup.string().required()
      })
    case FieldInterfaceKind.TEXTAREA:
      return Yup.object().shape({
        valueText: Yup.string().required()
      })
  }
}

const FieldForm: React.FC<Props> = ({ value, field, onSubmit }) => {
  const defaultValues = useMemo(() => createDefaultFieldValue(field, value), [field, value])
  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        [field.id]: createFieldValidationSchema(field)
      }),
    [field]
  )

  return (
    <Formik<FormValues> validationSchema={validationSchema} initialValues={defaultValues} onSubmit={onSubmit}>
      {({ isSubmitting }) => (
        <Form className="space-y-2">
          <div>
            <p>{field.description}</p>
          </div>
          <div>
            <label>{field.label}</label>
            <FieldContainer field={field} />
          </div>
          <div>
            <StyledButton type="submit" disabled={isSubmitting}>
              Save
            </StyledButton>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default FieldForm
