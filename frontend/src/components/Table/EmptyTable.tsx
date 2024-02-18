import styled from 'styled-components'

import Empty from 'ui/components/Empty/Empty'

const Root = styled.div`
  margin: 0 auto;
  padding: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-slate-200);
  width: 600px;
`

interface Props {
  message: string
  actionLabel?: string
  actionUrl?: string
}

const EmptyTable: React.FC<Props> = (props) => {
  return (
    <Root>
      <Empty {...props} />
    </Root>
  )
}

export default EmptyTable
