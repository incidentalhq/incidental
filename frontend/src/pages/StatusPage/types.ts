import { UniqueIdentifier } from '@dnd-kit/core'
import { MutableRefObject } from 'react'

import { ModelID } from '@/types/models'

export enum ItemType {
  GROUP = 'GROUP',
  COMPONENT = 'COMPONENT'
}

export interface TreeItem {
  id: string
  data?: GroupValue | ComponentValue
  children: TreeItem[]
  collapsed?: boolean
}

export type TreeItems = TreeItem[]

export interface ComponentValue {
  id: ModelID
  name: string
  itemType: ItemType.COMPONENT
}

export interface GroupValue {
  id: ModelID
  name: string
  itemType: ItemType.GROUP
}

export interface FlattenedItem extends TreeItem {
  parentId: UniqueIdentifier | null
  depth: number
  index: number
}

export type SensorContext = MutableRefObject<{
  items: FlattenedItem[]
  offset: number
}>
