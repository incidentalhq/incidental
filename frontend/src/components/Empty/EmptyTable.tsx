import { PropsWithChildren } from 'react'
import styled from 'styled-components'

const Root = styled.div`
  margin: 0 auto;
  padding: 1rem;
`

const EmptyTable: React.FC<PropsWithChildren> = ({ children }) => {
  return <Root>{children}</Root>
}

export default EmptyTable
