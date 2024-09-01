import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  UniqueIdentifier,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Form, Formik, FormikHelpers } from 'formik'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import styled from 'styled-components'

import deleteIcon from '@/assets/icons/trash.svg'
import Button from '@/components/Button/Button'
import ConfirmDelete from '@/components/Button/ConfirmDelete'
import Icon from '@/components/Icon/Icon'
import FormField from '@/components/Incident/FormField'
import { useModal } from '@/components/Modal/useModal'
import { Box, Content, ContentMain, Header, Title } from '@/components/Theme/Styles'
import useApiService from '@/hooks/useApi'
import useGlobal from '@/hooks/useGlobal'
import { APIError } from '@/services/transport'
import { FieldKind } from '@/types/enums'
import { IFormField, IIncidentType, ModelID } from '@/types/models'
import { apiErrorsToFormikErrors } from '@/utils/form'

import AddFormFieldForm, { FormValues as CreateFormFieldValues } from './components/AddFormFieldForm'
import FormFieldSettingsForm, { FormValues as FormFieldSettingsFormValue } from './components/FormFieldSettingsForm'
import SortableFormFieldRow from './components/SortableFormFieldRow'

const FieldRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`
const Field = styled.div`
  flex: 1;
`

const Controls = styled.div`
  flex: 1;
  display: flex;
  justify-content: right;
  align-self: flex-start;

  display: flex;
  gap: 0.5rem;
`
const ListContainer = styled.div`
  display: grid;
  grid-template-columns: 1;
`
const ModalContainer = styled.div`
  padding: 1rem;
  width: 400px;
`
const FormActions = styled.div`
  padding: 1rem 20px;
`

const createDefaultValues = (formFields: IFormField[], incidentTypes: IIncidentType[]) => {
  const defaultValues: Record<string, string> = {}

  for (const field of formFields) {
    if (field.field.kind === FieldKind.INCIDENT_TYPE) {
      defaultValues[field.id] = incidentTypes.find((it) => it.isDefault)?.id ?? ''
    } else {
      defaultValues[field.id] = field.defaultValue ? field.defaultValue : ''
    }
  }

  return defaultValues
}

type UrlParams = {
  id: string
}

const SettingsFormsEdit = () => {
  const { apiService } = useApiService()
  const { organisation } = useGlobal()
  const { id } = useParams<UrlParams>() as UrlParams
  const { setModal, closeModal } = useModal()

  // https://github.com/clauderic/dnd-kit/issues/921
  const [localOrdering, setLocalOrdering] = useState<Array<UniqueIdentifier>>([])
  const [localOrderingInitialized, setLocalOrderingInitialized] = useState(false)
  const [rankingUpdated, setRankingUpdated] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const formQuery = useQuery({
    queryKey: ['form', id],
    queryFn: () => apiService.getForm(id)
  })

  const formFieldsQuery = useQuery({
    queryKey: ['form-fields', id],
    queryFn: () => apiService.getFormFields(formQuery.data!),
    enabled: formQuery.isSuccess
  })

  const fieldsQuery = useQuery({
    queryKey: ['fields', id],
    queryFn: () => apiService.getFields()
  })

  const incidentTypesQuery = useQuery({
    queryKey: ['incident-types', organisation!.id],
    queryFn: () => apiService.getIncidentTypes()
  })

  const incidentStatusQuery = useQuery({
    queryKey: ['incident-statuses', organisation!.id],
    queryFn: () => apiService.getIncidentStatuses()
  })

  const severitiesQuery = useQuery({
    queryKey: ['severities', organisation!.id],
    queryFn: () => apiService.getIncidentSeverities()
  })

  const updateFormFieldsRankMutation = useMutation({
    mutationFn: (ranks: Array<ModelID>) => {
      const patch = ranks.map((id, index) => ({
        id,
        rank: index
      }))
      return apiService.patchFormFieldValues(id!, patch)
    }
  })

  const updateFormFieldMutation = useMutation({
    mutationFn: (value: Pick<IFormField, 'id'> & Partial<IFormField>) => apiService.patchFormField(value.id, value),
    onSuccess: () => formFieldsQuery.refetch()
  })

  const createFormFieldMutation = useMutation({
    mutationFn: (value: CreateFormFieldValues) => apiService.createFormField(id, value),
    onSuccess: async () => {
      await formFieldsQuery.refetch()
      setLocalOrderingInitialized(false)
    }
  })

  const deleteFormFieldMutation = useMutation({
    mutationFn: (id: string) => apiService.deleteFormField(id),
    onSuccess: async () => {
      await formFieldsQuery.refetch()
      setLocalOrderingInitialized(false)
    }
  })

  // on load copy over the form fields to local state
  useEffect(() => {
    if (!formFieldsQuery.isSuccess || localOrderingInitialized) {
      return
    }

    setLocalOrdering(formFieldsQuery.data.items.map((it) => it.id))
    setLocalOrderingInitialized(true)
  }, [formFieldsQuery, localOrderingInitialized])

  // update rank when local ordering changes
  useEffect(() => {
    if (!localOrderingInitialized || !rankingUpdated) {
      return
    }
    updateFormFieldsRankMutation.mutate(localOrdering as Array<ModelID>)

    // adding the mutation causes an infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localOrdering, localOrderingInitialized, rankingUpdated])

  // these are fields that can be added to this form
  const availableFields = useMemo(() => {
    if (!fieldsQuery.isSuccess) {
      return []
    }

    return fieldsQuery.data.items.filter((it) => {
      // can't add a system field
      if (it.isSystem) {
        return false
      }
      // cant' add a field that is already present in the form
      if (formFieldsQuery.data?.items.find((it) => it.field.id === it.id)) {
        return false
      }
      return true
    })
  }, [fieldsQuery, formFieldsQuery])

  // when drag finishes for sortable list
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setLocalOrdering((fieldIds) => {
        const oldIndex = fieldIds.indexOf(active.id)
        const newIndex = fieldIds.indexOf(over.id)
        return arrayMove(fieldIds, oldIndex, newIndex)
      })
      setRankingUpdated(true)
    }
  }

  const dummySubmit = useCallback(() => {}, [])

  const createFormFieldUpdateHandler = (formField: IFormField) => {
    return async (values: Partial<IFormField>, helpers: FormikHelpers<FormFieldSettingsFormValue>) => {
      const newValues = {
        id: formField.id,
        ...values
      }
      try {
        await updateFormFieldMutation.mutateAsync(newValues)
        toast('Form field updated', { type: 'success' })
        closeModal()
      } catch (e) {
        if (e instanceof APIError) {
          helpers.setErrors(apiErrorsToFormikErrors(e))
          toast(e.message, { type: 'error' })
        }
        console.error(e)
      }
    }
  }

  const createEditHandler = (formField: IFormField) => {
    return (evt: React.MouseEvent<HTMLButtonElement>) => {
      evt.preventDefault()

      if (!incidentStatusQuery.isSuccess || !severitiesQuery.isSuccess || !incidentTypesQuery.isSuccess) {
        return
      }

      setModal(
        <ModalContainer>
          <h2>Update form field</h2>
          <FormFieldSettingsForm
            formField={formField}
            onSubmit={createFormFieldUpdateHandler(formField)}
            statusList={incidentStatusQuery.data.items}
            severityList={severitiesQuery.data.items}
            incidentTypes={incidentTypesQuery.data.items}
          />
        </ModalContainer>
      )
    }
  }

  const createDeleteHandler = (formField: IFormField) => {
    return async () => {
      try {
        await deleteFormFieldMutation.mutateAsync(formField.id)
        toast('Form field deleted', { type: 'success' })
      } catch (e) {
        toast('Error trying to delete this form field', { type: 'error' })
      }
    }
  }

  const handleCreateFieldForm = async (
    values: CreateFormFieldValues,
    helpers: FormikHelpers<CreateFormFieldValues>
  ) => {
    try {
      await createFormFieldMutation.mutateAsync(values)
      closeModal()
    } catch (e) {
      if (e instanceof APIError) {
        helpers.setErrors(apiErrorsToFormikErrors(e))
      }
    }
  }

  const handleShowAddFieldFormModal = (evt: React.MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault()

    setModal(
      <ModalContainer>
        <h2>Add a new field to this form</h2>
        <p>Use the dropdown to add a new field </p>
        <AddFormFieldForm onSubmit={handleCreateFieldForm} fields={availableFields} />
      </ModalContainer>
    )
  }

  const isReady =
    formFieldsQuery.isSuccess &&
    incidentStatusQuery.isSuccess &&
    severitiesQuery.isSuccess &&
    incidentTypesQuery.isSuccess

  // sort fields based on localOrdering
  const sortedFields = useMemo(
    () =>
      localOrdering.map((it) => formFieldsQuery.data?.items.find((f) => f.id === it)).filter((it) => it !== undefined),
    [localOrdering, formFieldsQuery]
  )

  return (
    <>
      <Box>
        <Header>
          <Title>{formQuery.data?.name}</Title>
        </Header>
        <Content>
          <ContentMain $padding={false}>
            {isReady && (
              <>
                <Formik
                  initialValues={createDefaultValues(formFieldsQuery.data.items, incidentTypesQuery.data.items)}
                  onSubmit={dummySubmit}
                >
                  <Form>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                      autoScroll={{ layoutShiftCompensation: false }}
                    >
                      <SortableContext items={localOrdering} strategy={verticalListSortingStrategy}>
                        <ListContainer>
                          {sortedFields.map((it) => (
                            <SortableFormFieldRow key={it.id} id={it.id}>
                              <FieldRow>
                                <Field>
                                  <FormField
                                    formField={it}
                                    statusList={incidentStatusQuery.data.items}
                                    severityList={severitiesQuery.data.items}
                                    incidentTypes={incidentTypesQuery.data.items}
                                  />
                                </Field>
                                <Controls>
                                  <Button type="button" onClick={createEditHandler(it)}>
                                    Edit
                                  </Button>
                                  <ConfirmDelete
                                    disabled={!it.isDeletable}
                                    whyDisabledText="This field cannot be deleted"
                                    onConfirm={createDeleteHandler(it)}
                                  >
                                    <Icon icon={deleteIcon} />
                                  </ConfirmDelete>
                                </Controls>
                              </FieldRow>
                            </SortableFormFieldRow>
                          ))}
                        </ListContainer>
                      </SortableContext>
                    </DndContext>
                    <FormActions>
                      {availableFields.length > 0 ? (
                        <Button $primary type="button" onClick={handleShowAddFieldFormModal}>
                          Add field
                        </Button>
                      ) : null}
                    </FormActions>
                  </Form>
                </Formik>
              </>
            )}
          </ContentMain>
        </Content>
      </Box>
    </>
  )
}

export default SettingsFormsEdit
