import type { UniqueIdentifier } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'

import { IStatusPage } from '@/types/models'

import { type FlattenedItem, ItemType, type TreeItem, type TreeItems } from './types'

function getDragDepth(offset: number, indentationWidth: number) {
  return Math.round(offset / indentationWidth)
}

export function getProjection(
  items: FlattenedItem[],
  activeId: UniqueIdentifier,
  overId: UniqueIdentifier,
  dragOffset: number,
  indentationWidth: number
) {
  const overItemIndex = items.findIndex(({ id }) => id === overId)
  const activeItemIndex = items.findIndex(({ id }) => id === activeId)
  const activeItem = items[activeItemIndex]
  const newItems = arrayMove(items, activeItemIndex, overItemIndex)
  const previousItem = newItems[overItemIndex - 1]
  const nextItem = newItems[overItemIndex + 1]
  const dragDepth = getDragDepth(dragOffset, indentationWidth)
  const projectedDepth = activeItem.depth + dragDepth
  const maxDepth = getMaxDepth({
    previousItem,
    activeItem
  })
  const minDepth = getMinDepth({ nextItem })
  let depth = projectedDepth

  if (projectedDepth >= maxDepth) {
    depth = maxDepth
  } else if (projectedDepth < minDepth) {
    depth = minDepth
  }

  return { depth, maxDepth, minDepth, parentId: getParentId() }

  function getParentId() {
    if (depth === 0 || !previousItem) {
      return null
    }

    if (depth === previousItem.depth) {
      return previousItem.parentId
    }

    if (depth > previousItem.depth) {
      return previousItem.id
    }

    const newParent = newItems
      .slice(0, overItemIndex)
      .reverse()
      .find((item) => item.depth === depth)?.parentId

    return newParent ?? null
  }
}

function getMaxDepth({ previousItem, activeItem }: { previousItem: FlattenedItem; activeItem: FlattenedItem }) {
  // first item
  if (!previousItem) {
    return 0
  }
  // prevent components nesting inside other components
  if (previousItem.data?.itemType == ItemType.COMPONENT && previousItem.depth == 0) {
    return 0
  }
  // groups cannot be nested under other items
  if (activeItem.data?.itemType == ItemType.GROUP) {
    return 0
  }

  return 1
}

function getMinDepth({ nextItem }: { nextItem: FlattenedItem }) {
  if (nextItem) {
    return nextItem.depth
  }

  return 0
}

function flatten(items: TreeItems, parentId: UniqueIdentifier | null = null, depth = 0): FlattenedItem[] {
  return items.reduce<FlattenedItem[]>((acc, item, index) => {
    return [...acc, { ...item, parentId, depth, index }, ...flatten(item.children, item.id, depth + 1)]
  }, [])
}

export function flattenTree(items: TreeItems): FlattenedItem[] {
  return flatten(items)
}

export function buildTree(flattenedItems: FlattenedItem[]): TreeItems {
  const root: TreeItem = { id: 'root', children: [] }
  const nodes: Record<string, TreeItem> = { [root.id]: root }
  const items = flattenedItems.map((item) => ({ ...item, children: [] }))

  for (const item of items) {
    const { id, children } = item
    const parentId = item.parentId ?? root.id
    const parent = nodes[parentId] ?? findItem(items, parentId)

    nodes[id] = { id, children }
    parent.children.push(item)
  }

  return root.children
}

export function findItem(items: TreeItem[], itemId: UniqueIdentifier) {
  return items.find(({ id }) => id === itemId)
}

export function findItemDeep(items: TreeItems, itemId: UniqueIdentifier): TreeItem | undefined {
  for (const item of items) {
    const { id, children } = item

    if (id === itemId) {
      return item
    }

    if (children.length) {
      const child = findItemDeep(children, itemId)

      if (child) {
        return child
      }
    }
  }

  return undefined
}

export function removeItem(items: TreeItems, id: UniqueIdentifier) {
  const newItems = []

  for (const item of items) {
    if (item.id === id) {
      continue
    }

    if (item.children.length) {
      item.children = removeItem(item.children, id)
    }

    newItems.push(item)
  }

  return newItems
}

export function setProperty<T extends keyof TreeItem>(
  items: TreeItems,
  id: UniqueIdentifier,
  property: T,
  setter: (value: TreeItem[T]) => TreeItem[T]
) {
  for (const item of items) {
    if (item.id === id) {
      item[property] = setter(item[property])
      continue
    }

    if (item.children.length) {
      item.children = setProperty(item.children, id, property, setter)
    }
  }

  return [...items]
}

function countChildren(items: TreeItem[], count = 0): number {
  return items.reduce((acc, { children }) => {
    if (children.length) {
      return countChildren(children, acc + 1)
    }

    return acc + 1
  }, count)
}

export function getChildCount(items: TreeItems, id: UniqueIdentifier) {
  const item = findItemDeep(items, id)

  return item ? countChildren(item.children) : 0
}

export function removeChildrenOf(items: FlattenedItem[], ids: UniqueIdentifier[]) {
  const excludeParentIds = [...ids]

  return items.filter((item) => {
    if (item.parentId && excludeParentIds.includes(item.parentId)) {
      if (item.children.length) {
        excludeParentIds.push(item.id)
      }
      return false
    }

    return true
  })
}

export const toServerSideItems = (items: TreeItems): Partial<IStatusPage> => {
  const payload = items.map((it, index) => {
    let item = {}
    if (it.data?.itemType == ItemType.COMPONENT) {
      item = {
        id: it.id,
        rank: index,
        statusPageComponent: {
          id: it.data.id
        }
      }
    }
    if (it.data?.itemType == ItemType.GROUP) {
      item = {
        id: it.id,
        rank: index,
        statusPageComponentGroup: {
          id: it.data.id
        },
        statusPageItems: it.children.map((it, index) => ({
          id: it.id,
          rank: index,
          statusPageComponent: {
            id: it.data?.id
          }
        }))
      }
    }

    return item
  })

  return payload
}

export const fromServerSideItems = (statusPage: IStatusPage) => {
  const items: TreeItems = []
  for (const spItem of statusPage.statusPageItems) {
    if (spItem.statusPageComponent) {
      const item: TreeItem = {
        id: spItem.id,
        data: {
          id: spItem.statusPageComponent.id,
          name: spItem.statusPageComponent.name,
          itemType: ItemType.COMPONENT
        },
        children: []
      }
      items.push(item)
    }
    if (spItem.statusPageComponentGroup) {
      const item: TreeItem = {
        id: spItem.id,
        data: {
          id: spItem.statusPageComponentGroup.id,
          name: spItem.statusPageComponentGroup.name ?? '',
          itemType: ItemType.GROUP
        },
        children:
          spItem.statusPageItems?.map((it) => ({
            id: it.id,
            data: {
              id: it.statusPageComponent?.id ?? ('' as ModelID),
              name: it.statusPageComponent?.name ?? '',
              itemType: ItemType.COMPONENT
            },
            children: []
          })) ?? []
      }
      items.push(item)
    }
  }
  return items
}
