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
import { Form, Formik } from 'formik'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'

import deleteIcon from '@/assets/icons/trash.svg'
import Button from '@/components/Button/Button'
import ConfirmDelete from '@/components/Button/ConfirmDelete'
import Icon from '@/components/Icon/Icon'
import FormField from '@/components/Incident/FormField'
import { Box, Content, ContentMain, Header, Title } from '@/components/Theme/Styles'
import useApiService from '@/hooks/useApi'
import useGlobal from '@/hooks/useGlobal'
import { FieldKind } from '@/types/enums'
import { IFormField, IIncidentType, ModelID } from '@/types/models'

import SortableItem from './SortableItem'

const FieldRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`
const Field = styled.div`
  flex: 1;
`
const Description = styled.div`
  margin-top: 0.5rem;
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

  const fieldsQuery = useQuery({
    queryKey: ['form-fields', id],
    queryFn: () => apiService.getFormFields(formQuery.data!),
    enabled: formQuery.isSuccess
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

  // on load copy over the form fields to local state
  useEffect(() => {
    if (!fieldsQuery.isSuccess || localOrderingInitialized) {
      return
    }

    setLocalOrdering(fieldsQuery.data.items.map((it) => it.id))
    setLocalOrderingInitialized(true)
  }, [fieldsQuery, localOrderingInitialized])

  // update rank when local ordering changes
  useEffect(() => {
    if (!localOrderingInitialized || !rankingUpdated) {
      return
    }
    updateFormFieldsRankMutation.mutate(localOrdering as Array<ModelID>)

    // adding the mutation causes an infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localOrdering, localOrderingInitialized, rankingUpdated])

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

  const createEditHandler = (formField: IFormField) => {
    return (evt: React.MouseEvent<HTMLButtonElement>) => {
      evt.preventDefault()
      console.log(formField)
    }
  }

  const createDeleteHandler = (formField: IFormField) => {
    return () => {
      console.log(formField)
    }
  }

  const isReady =
    fieldsQuery.isSuccess && incidentStatusQuery.isSuccess && severitiesQuery.isSuccess && incidentTypesQuery.isSuccess

  // sort fields based on localOrdering
  const sortedFields = useMemo(
    () => localOrdering.map((it) => fieldsQuery.data?.items.find((f) => f.id === it) as IFormField),
    [localOrdering, fieldsQuery]
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
                  initialValues={createDefaultValues(fieldsQuery.data.items, incidentTypesQuery.data.items)}
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
                            <SortableItem key={it.id} id={it.id}>
                              <FieldRow>
                                <Field>
                                  <FormField
                                    formField={it}
                                    statusList={incidentStatusQuery.data.items}
                                    severityList={severitiesQuery.data.items}
                                    incidentTypes={incidentTypesQuery.data.items}
                                  />
                                  <Description>{it.description}</Description>
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
                            </SortableItem>
                          ))}
                        </ListContainer>
                      </SortableContext>
                    </DndContext>
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
