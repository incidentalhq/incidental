import * as Yup from 'yup'

import { OptionItem } from '@/components/Form/SelectList'
import { FieldInterfaceKind } from '@/types/enums'
import { IField, IIncidentFieldValue } from '@/types/models'

const toOptions = (values: string[]) => values.map((it) => ({ value: it, label: it }))

export const createCustomDefaultFieldValue = (field: IField, value: IIncidentFieldValue | null) => {
  const defaultFieldValue: Record<string, string | OptionItem[] | undefined> = {}
  switch (field.interfaceKind) {
    case FieldInterfaceKind.MULTI_SELECT:
      defaultFieldValue[field.id] = value ? toOptions(value.valueMultiSelect) : []
      break
    case FieldInterfaceKind.SINGLE_SELECT:
      defaultFieldValue[field.id] = value ? value.valueSingleSelect : ''
      break
    case FieldInterfaceKind.TEXT:
      defaultFieldValue[field.id] = value ? value.valueText : ''
      break
    case FieldInterfaceKind.TEXTAREA:
      defaultFieldValue[field.id] = value ? value.valueText : ''
      break
  }

  return defaultFieldValue
}

export const createCustomFieldValidationSchema = (field: IField) => {
  switch (field.interfaceKind) {
    case FieldInterfaceKind.MULTI_SELECT:
      return Yup.array().min(1).required()
    case FieldInterfaceKind.SINGLE_SELECT:
      return Yup.string().required()
    case FieldInterfaceKind.TEXT:
      return Yup.string().required()
    case FieldInterfaceKind.TEXTAREA:
      return Yup.string().required()
  }
}
