import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
  DragStartEvent,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  UniqueIdentifier,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import styled from 'styled-components'

import deleteIcon from '@/assets/icons/trash.svg'
import Button from '@/components/Button/Button'
import ConfirmDelete from '@/components/Button/ConfirmDelete'
import Icon from '@/components/Icon/Icon'
import useApiService from '@/hooks/useApi'
import { APIError } from '@/services/transport'
import { IStatusPage, ModelID } from '@/types/models'

import CreateComponentModal from '../modals/CreateComponentModal'
import CreateStatusPageGroupModal from '../modals/CreateGroupModal'
import EditComponentModal from '../modals/EditComponentModal'
import EditGroupModal from '../modals/EditGroupModal'
import { FlattenedItem, ItemType, SensorContext, TreeItem, TreeItems } from '../types'
import {
  buildTree,
  flattenTree,
  fromServerSideItems,
  getProjection,
  removeChildrenOf,
  toServerSideItems
} from '../utils'
import ItemRow from './ItemRow'
import SortableRow from './SortableRow'

const Container = styled.div``
const ListContainer = styled.div`
  display: grid;
  grid-template-columns: 1;
`
const FormActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`
const FieldRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`
const Controls = styled.div`
  flex: 1;
  display: flex;
  justify-content: right;
  align-self: flex-start;

  display: flex;
  gap: 0.5rem;
`
const ListRow = styled.div`
  &:hover {
    background-color: var(--color-slate-100);
  }
`

type IndentedDiv = {
  $depth: number
  $identWidth: number
}
const IndentedDiv = styled.div<IndentedDiv>`
  margin-left: ${(props) => props.$depth * props.$identWidth}px;
`

const measuring = {
  droppable: {
    strategy: MeasuringStrategy.Always
  }
}

interface Props {
  statusPage: IStatusPage
}

const indentationWidth = 20

const ManageComponentsSection: React.FC<Props> = ({ statusPage }) => {
  const [items, setItems] = useState<TreeItems>([])
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null)
  const [offsetLeft, setOffsetLeft] = useState(0)
  const [, setCurrentPosition] = useState<{
    parentId: UniqueIdentifier | null
    overId: UniqueIdentifier
  } | null>(null)
  const [editModal, setEditModal] = useState<FlattenedItem>()
  const [createModal, setCreateModal] = useState<ItemType>()
  const { apiService } = useApiService()
  const queryClient = useQueryClient()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const updateRankMutation = useMutation({
    mutationFn: (values: Partial<IStatusPage>) => apiService.updateStatusPageComponentsRank(statusPage.id, values)
  })

  const deleteGroupMutation = useMutation({
    mutationFn: (groupId: ModelID) => apiService.deleteStatusPageGroup(statusPage.id, groupId),
    onError: (error) => {
      if (error instanceof APIError) {
        toast(error.detail, { type: 'error' })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-status-page', statusPage.id] })
    }
  })

  const deleteComponentMutation = useMutation({
    mutationFn: (componentId: ModelID) => apiService.deleteStatusPageComponent(statusPage.id, componentId),
    onError: (error) => {
      if (error instanceof APIError) {
        toast(error.detail, { type: 'error' })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-status-page', statusPage.id] })
    }
  })

  const flattenedItems = useMemo(() => {
    const flattenedTree = flattenTree(items)
    const collapsedItems = flattenedTree.reduce<string[]>(
      (acc, { children, collapsed, id }) => (collapsed && children.length ? [...acc, id] : acc),
      []
    )

    return removeChildrenOf(flattenedTree, activeId ? [activeId, ...collapsedItems] : collapsedItems)
  }, [activeId, items])

  const projected =
    activeId && overId ? getProjection(flattenedItems, activeId, overId, offsetLeft, indentationWidth) : null

  const sortedIds = useMemo(() => flattenedItems.map(({ id }) => id), [flattenedItems])

  const sensorContext: SensorContext = useRef({
    items: flattenedItems,
    offset: offsetLeft
  })

  // -- Handlers

  function handleDragStart({ active: { id: activeId } }: DragStartEvent) {
    setActiveId(activeId)
    setOverId(activeId)

    const activeItem = flattenedItems.find(({ id }) => id === activeId)

    if (activeItem) {
      setCurrentPosition({
        parentId: activeItem.parentId,
        overId: activeId
      })
    }

    document.body.style.setProperty('cursor', 'grabbing')
  }

  function handleDragMove({ delta }: DragMoveEvent) {
    setOffsetLeft(delta.x)
  }

  function handleDragOver({ over }: DragOverEvent) {
    setOverId(over?.id ?? null)
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    resetState()

    if (projected && over) {
      const { depth, parentId } = projected
      const clonedItems: FlattenedItem[] = JSON.parse(JSON.stringify(flattenTree(items)))
      const overIndex = clonedItems.findIndex(({ id }) => id === over.id)
      const activeIndex = clonedItems.findIndex(({ id }) => id === active.id)
      const activeTreeItem = clonedItems[activeIndex]

      clonedItems[activeIndex] = { ...activeTreeItem, depth, parentId }

      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex)
      const newItems = buildTree(sortedItems)

      setItems(newItems)

      const payload = toServerSideItems(newItems)
      updateRankMutation.mutateAsync(payload)
    }
  }

  function handleDragCancel() {
    resetState()
  }

  function resetState() {
    setOverId(null)
    setActiveId(null)
    setOffsetLeft(0)
    setCurrentPosition(null)

    document.body.style.setProperty('cursor', '')
  }

  const createEditHandler = (value: FlattenedItem) => {
    return (evt: React.MouseEvent<HTMLButtonElement>) => {
      evt.preventDefault()
      setEditModal(value)
      return null
    }
  }

  const createDeleteHandler = (value: TreeItem) => {
    return () => {
      if (!value.data) {
        return
      }
      if (value.data.itemType === ItemType.GROUP) {
        deleteGroupMutation.mutateAsync(value.data.id)
      } else {
        deleteComponentMutation.mutateAsync(value.data.id)
      }
    }
  }

  // -- Effects

  useEffect(() => {
    sensorContext.current = {
      items: flattenedItems,
      offset: offsetLeft
    }
  }, [flattenedItems, offsetLeft])

  useEffect(() => {
    const items = fromServerSideItems(statusPage)
    setItems(items)
  }, [statusPage])

  return (
    <Container>
      <>
        {editModal && editModal.data?.itemType == ItemType.GROUP ? (
          <EditGroupModal statusPage={statusPage} group={editModal.data!} onClose={() => setEditModal(undefined)} />
        ) : null}
        {editModal && editModal.data?.itemType == ItemType.COMPONENT ? (
          <EditComponentModal
            statusPage={statusPage}
            component={editModal.data}
            onClose={() => setEditModal(undefined)}
          />
        ) : null}
        {createModal === ItemType.COMPONENT && (
          <CreateComponentModal statusPage={statusPage} onClose={() => setCreateModal(undefined)} />
        )}
        {createModal === ItemType.GROUP && (
          <CreateStatusPageGroupModal statusPage={statusPage} onClose={() => setCreateModal(undefined)} />
        )}
        <DndContext
          measuring={measuring}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
          autoScroll={{ layoutShiftCompensation: false }}
        >
          <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
            <ListContainer>
              {flattenedItems.map((it) => (
                <ListRow key={it.id}>
                  <IndentedDiv $depth={it.depth} $identWidth={indentationWidth}>
                    <SortableRow id={it.id} isGroup={it.data?.itemType === ItemType.GROUP}>
                      <FieldRow>
                        <ItemRow item={it} />
                        <Controls>
                          <Button type="button" onClick={createEditHandler(it)}>
                            Edit
                          </Button>
                          <ConfirmDelete onConfirm={createDeleteHandler(it)}>
                            <Icon icon={deleteIcon} />
                          </ConfirmDelete>
                        </Controls>
                      </FieldRow>
                    </SortableRow>
                  </IndentedDiv>
                </ListRow>
              ))}
            </ListContainer>
          </SortableContext>
        </DndContext>
        <FormActions>
          <Button onClick={() => setCreateModal(ItemType.COMPONENT)}>Add component</Button>
          <Button onClick={() => setCreateModal(ItemType.GROUP)}>Add group</Button>
        </FormActions>
      </>
    </Container>
  )
}

export default ManageComponentsSection
