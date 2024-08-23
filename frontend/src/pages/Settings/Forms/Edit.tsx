import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useQuery } from '@tanstack/react-query'
import { Form, Formik } from 'formik'
import { useCallback, useEffect, useState } from 'react'
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
import { IFormField, IIncidentType } from '@/types/models'

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
  position: relative;
  display: flex;
  flex-direction: column;
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
  const { id } = useParams<UrlParams>()
  const [items, setItems] = useState<IFormField[]>([])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const formQuery = useQuery({
    queryKey: ['form', id],
    queryFn: () => (id ? apiService.getForm(id) : null)
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

  useEffect(() => {
    if (fieldsQuery.isSuccess && items.length == 0) {
      setItems(fieldsQuery.data.items)
    }
  }, [fieldsQuery, items])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((it) => it.id === active.id)
        const newIndex = items.findIndex((it) => it.id === over.id)
        const newItems = arrayMove(items, oldIndex, newIndex)
        return newItems
      })
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
                  initialValues={createDefaultValues(items, incidentTypesQuery.data.items)}
                  onSubmit={dummySubmit}
                >
                  <Form>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={items} strategy={verticalListSortingStrategy}>
                        <ListContainer>
                          {items.map((it) => (
                            <SortableItem key={it.id} id={it.id}>
                              <FieldRow key={it.id}>
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
