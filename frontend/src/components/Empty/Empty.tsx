import { FC } from 'react'
import styled from 'styled-components'

import emptyImage from '@/assets/empty.png'
import { LinkButton } from '@/components/Theme/Styles'

const Root = styled.div`
  margin: 0 auto;
  padding: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
`
const Inner = styled.div`
  text-align: center;
`

const Message = styled.div`
  padding: 1rem;
  font-size: 1.2rem;
  text-align: center;
  line-height: 2rem;
  color: var(--color-gray-500);
`
const EmptyPic = styled.img`
  width: 200px;
  margin: 0 auto;
`

interface Props {
  message: string
  actionLabel?: string
  actionUrl?: string
}

const Empty: FC<Props> = ({ message, actionUrl, actionLabel }) => {
  return (
    <Root>
      <Inner>
        <EmptyPic src={emptyImage} alt="Empty" />
        <Message>{message}</Message>
        {actionUrl && <LinkButton to={actionUrl}>{actionLabel}</LinkButton>}
      </Inner>
    </Root>
  )
}

export default Empty
