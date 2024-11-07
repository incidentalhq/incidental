import React from 'react'
import styled from 'styled-components'

import { FlattenedItem } from '../types'

type RootProps = {
  $depth: number
}
const Root = styled.div<RootProps>``

interface Props {
  item: FlattenedItem
}

const ItemRow: React.FC<Props> = ({ item }) => {
  return <Root $depth={item.depth}>{item.data?.name}</Root>
}

export default ItemRow
