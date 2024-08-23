import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import styled from 'styled-components'

import bars from '@/assets/icons/bars.svg'
import Icon from '@/components/Icon/Icon'

type RootProps = {
  $isDragging: boolean
}
const Root = styled.div<RootProps>`
  position: relative;
  padding: 1rem 20px;
  display: flex;
  gap: 1rem;
  align-items: center;
  background-color: #fff;

  border-bottom: ${(props) => (props.$isDragging ? 'none' : '1px solid var(--color-slate-100)')};
  box-shadow: ${(props) => (props.$isDragging ? 'var(--shadow)' : 'none')};
`
const Main = styled.div`
  flex: 1;
`
const Handle = styled.div`
  cursor: move;
`

interface Props extends React.PropsWithChildren {
  id: string | number
}

const SortableItem: React.FC<Props> = (props) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } = useSortable({ id: props.id })
  const style = {
    transform: CSS.Transform.toString({
      x: transform?.x ?? 0,
      y: transform?.y ?? 0,
      scaleX: 1,
      scaleY: 1
    }),
    transition
  }
  return (
    <Root ref={setNodeRef} style={style} {...attributes} $isDragging={isDragging}>
      <Handle {...listeners}>
        <Icon icon={bars} />
      </Handle>
      <Main>{props.children}</Main>
    </Root>
  )
}

export default SortableItem
