import { useState } from 'react'
import styled from 'styled-components'

const Root = styled.div`
  padding: 0.5rem;
`

const Panel = styled.div`
  padding: 1rem;
  border-radius: 1rem;
  margin: 1rem 0;
  background-color: var(--color-gray-50);
`

interface Props {
  text: string
}

const ExpandableFields: React.FC<React.PropsWithChildren<Props>> = ({ children, text }) => {
  const [showContent, setShowContent] = useState(false)

  const handleToggle = (evt: React.MouseEvent<HTMLAnchorElement>) => {
    evt.preventDefault()
    setShowContent((prev) => !prev)
  }

  if (showContent) {
    return (
      <Panel>
        {children}
        <a href="" onClick={handleToggle}>
          Hide
        </a>
      </Panel>
    )
  }

  return (
    <Root>
      <a href="" onClick={handleToggle}>
        &raquo; {text}
      </a>
    </Root>
  )
}

export default ExpandableFields
