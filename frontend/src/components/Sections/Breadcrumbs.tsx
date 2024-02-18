import { Link } from 'react-router-dom'
import styled from 'styled-components'

const Root = styled.div`
  margin: 1rem 0 1rem;
  display: flex;
  padding: 1rem;
  background-color: #fff;
  border: 1px solid var(--color-gray-200);
  color: var(--color-gray-400);
`
const Sep = styled.div`
  padding: 0 0.5rem;
  color: var(--color-gray-200);
`
const CurrentPage = styled.div``

interface Props {
  crumbs: Array<{ name: string; url?: string }>
}

export const crumb = (name: string, url?: string) => {
  return {
    name,
    url
  }
}

const Breadcrumbs: React.FC<Props> = ({ crumbs }) => {
  const nodes: React.ReactNode[] = []

  crumbs.forEach((crumb, index) => {
    if (crumb.url) {
      nodes.push(
        <Link key={crumb.name} to={crumb.url}>
          {crumb.name}
        </Link>
      )
    } else {
      nodes.push(<CurrentPage key={'current-page'}>{crumb.name}</CurrentPage>)
    }
    if (index !== crumbs.length - 1) {
      nodes.push(<Sep key={`${crumb.name}-sep`}>/</Sep>)
    }
  })

  return <Root>{nodes}</Root>
}

export default Breadcrumbs
