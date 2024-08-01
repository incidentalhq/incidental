import styled from 'styled-components'

import useGlobal from '@/hooks/useGlobal'

const Root = styled.div`
  position: absolute;
  left: 0;
  bottom: 0;
  padding: 1rem;
  background-color: var(--color-red-100);
`

const Debug = () => {
  const { organisation } = useGlobal()

  if (import.meta.env.MODE !== 'development') {
    return null
  }

  return <Root>{organisation?.id}</Root>
}

export default Debug
