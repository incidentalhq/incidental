import Field from '@/components/Form/Field'
import SelectField from '@/components/Form/SelectField'
import { FieldInterfaceKind, FieldKind, IncidentStatusCategory } from '@/types/enums'
import { IField, IFormField, IIncidentSeverity, IIncidentStatus, IIncidentType } from '@/types/models'

const getIncidentNameField = (name: string) => {
  return <Field name={name} type="text" />
}

const getIncidentSummaryField = (name: string) => {
  return <Field as={'textarea'} name={name} type="text" />
}

const getIncidentStatusField = (name: string, statusList: Array<IIncidentStatus>) => {
  const options = statusList.map((it) => ({
    label: it.name,
    value: it.id
  }))
  return <SelectField name={name} options={options} />
}

const getIncidentSeverityField = (name: string, severityList: Array<IIncidentSeverity>) => {
  const options = severityList.map((it) => ({
    label: it.name,
    value: it.id
  }))
  return <SelectField name={name} options={options} />
}

const getIncidentTypeField = (name: string, incidentTypes: Array<IIncidentType>) => {
  const options = incidentTypes.map((it) => ({
    label: it.name,
    value: it.id
  }))
  return <SelectField name={name} options={options} />
}

const getIncidentInitialStatus = (name: string, statusList: Array<IIncidentStatus>) => {
  const triage = statusList.find((it) => it.category === IncidentStatusCategory.TRIAGE)
  const active = statusList.find((it) => it.category == IncidentStatusCategory.ACTIVE)
  if (!triage || !active) {
    console.log('Could not find triage or active categories')
    return
  }
  const options = [
    {
      label: 'Triage',
      value: triage.id
    },
    {
      label: 'Active',
      value: active.id
    }
  ]

  return <SelectField name={name} options={options} />
}

export const getCustomField = (name: string, field: IField) => {
  switch (field.interfaceKind) {
    case FieldInterfaceKind.TEXTAREA:
      return <Field as={'textarea'} name={name} type="text" />
    case FieldInterfaceKind.TEXT:
      return <Field name={name} type="text" />
    case FieldInterfaceKind.SINGLE_SELECT: {
      const options =
        field.availableOptions?.map((it) => ({
          label: it,
          value: it
        })) ?? []

      return <SelectField name={name} options={options} />
    }
    case FieldInterfaceKind.MULTI_SELECT: {
      return <span>TODO: Multi select is not implemented</span>
    }
  }
}

export const getFormFieldComponent = (
  name: string,
  formField: IFormField,
  statusList: Array<IIncidentStatus>,
  severityList: Array<IIncidentSeverity>,
  incidentTypes: Array<IIncidentType>
) => {
  switch (formField.field.kind) {
    case FieldKind.INCIDENT_STATUS: {
      return getIncidentStatusField(name, statusList)
    }
    case FieldKind.INCIDENT_SEVERITY: {
      return getIncidentSeverityField(name, severityList)
    }
    case FieldKind.INCIDENT_TYPE: {
      return getIncidentTypeField(name, incidentTypes)
    }
    case FieldKind.INCIDENT_INITIAL_STATUS: {
      return getIncidentInitialStatus(name, statusList)
    }
    case FieldKind.INCIDENT_NAME: {
      return getIncidentNameField(name)
    }
    case FieldKind.INCIDENT_SUMMARY: {
      return getIncidentSummaryField(name)
    }
    case FieldKind.USER_DEFINED: {
      return getCustomField(name, formField.field)
    }
  }
}
