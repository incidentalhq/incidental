import { ErrorMessage, FieldArray, Form, Formik, FormikHelpers } from 'formik'
import * as Yup from 'yup'

import spinner from '@/assets/icons/spinner.svg'
import Field from '@/components/Form/Field'
import GeneralError from '@/components/Form/GeneralError'
import OptionsArrayField from '@/components/Form/OptionsArrayField'
import SelectField from '@/components/Form/SelectField'
import Icon from '@/components/Icon/Icon'
import { StyledButton } from '@/components/Theme/Styles'
import { FieldInterfaceKind } from '@/types/enums'
import { IField } from '@/types/models'

export type FormValues = {
  label: string
  description: string
  interfaceKind: FieldInterfaceKind
  availableOptions: Array<string>
}

interface Props {
  field?: IField
  onSubmit: (values: FormValues, helpers: FormikHelpers<FormValues>) => void | Promise<void>
}

Yup.addMethod(Yup.array, 'unique', function (message, _mapper = (a: unknown) => a) {
  return this.test('unique', message, function <T>(this: Yup.TestContext, list: Array<T> | undefined) {
    const seen = new Set()
    if (!list) {
      return
    }
    list.forEach((item, index) => {
      if (!seen.has(item)) {
        seen.add(item)
      } else {
        throw this.createError({
          path: `${this.path}.${index}`,
          message: message
        })
      }
    })

    return true
  })
})

const validationSchema = Yup.object().shape({
  label: Yup.string().required(),
  description: Yup.string(),
  interfaceKind: Yup.string().required('This field is required'),
  availableOptions: Yup.array().when('interfaceKind', {
    is: (value: string) =>
      [FieldInterfaceKind.MULTI_SELECT, FieldInterfaceKind.SINGLE_SELECT].includes(value as FieldInterfaceKind),
    then: (schema) =>
      schema
        .min(1, 'Please add at least one option')
        .of(Yup.string().min(2, 'An option must be at least 2 characters').required())
        .unique('Options must be unique'),
    otherwise: (schema) => schema.notRequired()
  })
})

// only show options field when it's a select type field
const shouldShowOptionsField = (values: FormValues) =>
  [FieldInterfaceKind.MULTI_SELECT, FieldInterfaceKind.SINGLE_SELECT].includes(
    values.interfaceKind as FieldInterfaceKind
  )

// available interface options
const interfaceOptions = [
  {
    label: 'Text',
    value: FieldInterfaceKind.TEXT
  },
  {
    label: 'Textarea',
    value: FieldInterfaceKind.TEXTAREA
  },
  {
    label: 'Single select',
    value: FieldInterfaceKind.SINGLE_SELECT
  },
  {
    label: 'Multi select',
    value: FieldInterfaceKind.MULTI_SELECT
  }
]

const FieldForm: React.FC<Props> = ({ onSubmit, field }) => {
  const defaultValues: FormValues = {
    label: field ? field.label : '',
    description: field ? field.description ?? '' : '',
    interfaceKind: field?.interfaceKind ?? FieldInterfaceKind.TEXT,
    availableOptions: field?.availableOptions ? field.availableOptions : ['']
  }

  return (
    <Formik validationSchema={validationSchema} onSubmit={onSubmit} initialValues={defaultValues}>
      {({ isSubmitting, values }) => (
        <Form className="space-y-2">
          <GeneralError />
          <div>
            <label>Label</label>
            <Field type="text" name="label" help="A short descriptive name for the field" />
          </div>
          <div>
            <label>Description</label>
            <Field name="description" as={'textarea'} help="What information should this field convey?" />
          </div>
          <div>
            <label>Interface</label>
            <SelectField
              name="interfaceKind"
              options={interfaceOptions}
              help="How should we present the field in the interface?"
            />
          </div>
          {shouldShowOptionsField(values) ? (
            <div>
              <label>Options</label>
              <p>Add options for this field below, each must be unique</p>
              <FieldArray
                name="availableOptions"
                render={(helpers) => <OptionsArrayField {...helpers} placeholder="Option name" />}
              />
              <ErrorMessage name="availableOptions" component="div" className="error-help" />
            </div>
          ) : null}
          <div>
            <StyledButton $primary={true} type="submit" disabled={isSubmitting}>
              {isSubmitting && <Icon spin={true} icon={spinner} />} {field ? 'Update' : 'Create'}
            </StyledButton>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default FieldForm
