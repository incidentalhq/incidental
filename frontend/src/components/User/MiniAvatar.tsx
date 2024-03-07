import styled from 'styled-components'

import { IPublicUser } from '@/types/models'

const Root = styled.div`
  height: 18px;
  width: 18px;
  border-radius: 9px;
  background-color: var(--color-blue-200);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 9px;
  font-weight: 500;
`

interface Props {
  user?: IPublicUser
}

const MiniAvatar: React.FC<Props> = ({ user }) => {
  const initials = user?.name
    .split(' ')
    .map((it) => it[0].toUpperCase())
    .join('')

  return <Root>{initials}</Root>
}

export default MiniAvatar
