import React, { useMemo } from 'react'
import styled from 'styled-components'

import { getPages } from './getPages'

interface Props {
  page: number
  size: number
  total: number
  onPage: (page: number) => void
}

const Root = styled.div`
  display: flex;
  gap: 0.5rem;
`

const Page = styled.a<{ selected: boolean }>`
  padding: 0 1rem;
  color: ${(props) => (props.selected ? 'var(--color-blue-600)' : 'var(--color-gray-500)')};
  font-weight: ${(props) => (props.selected ? '800' : '400')};
  display: block;
  text-decoration: none;
`

const PaginationList = styled.ul`
  display: flex;
  list-style: none;

  li:first-child ${Page} {
    padding-left: 0;
  }

  li:last-child ${Page} {
    padding-right: 0;
  }
`

interface NextPreviousLinkProps {
  page: number
  onClick: (page: number) => void
  totalPages?: number
}

interface PageLinkProps {
  currentPage: number
  pages: Array<number | null>
  onClick: (page: number) => void
}

const createClickHandler = (page: number, onClick: (page: number) => void) => {
  return (evt: React.MouseEvent<HTMLElement>) => {
    evt.preventDefault()
    onClick(page)
  }
}

const PreviousLink: React.FC<NextPreviousLinkProps> = ({ page, onClick }) => {
  if (page === 1) {
    return (
      <Page selected={false} href="#prev" onClick={(evt) => evt.preventDefault()}>
        Previous
      </Page>
    )
  }

  return (
    <a href="#prev" id="prev" onClick={createClickHandler(page - 1, onClick)}>
      Previous
    </a>
  )
}

const NextLink: React.FC<NextPreviousLinkProps> = ({ page, totalPages, onClick }) => {
  if (page === totalPages) {
    return (
      <Page selected={false} href="#next" onClick={(evt) => evt.preventDefault()}>
        Next page
      </Page>
    )
  }

  return (
    <Page selected={false} href="#next" onClick={createClickHandler(page + 1, onClick)}>
      Next page
    </Page>
  )
}

const PageLinks: React.FC<PageLinkProps> = ({ currentPage, pages, onClick }) => {
  const nodes = []
  for (const page of pages) {
    if (page) {
      if (page !== currentPage) {
        nodes.push(
          <li key={page}>
            <Page selected={false} href={`#page-${page}`} onClick={createClickHandler(page, onClick)}>
              {page}
            </Page>
          </li>
        )
      } else {
        nodes.push(
          <li key={page}>
            <Page selected={true} href={`#page-${page}`}>
              {page}
            </Page>
          </li>
        )
      }
    } else {
      nodes.push(
        <li key={`spacer${page ? page - 1 : 0}`}>
          <span>...</span>
        </li>
      )
    }
  }

  return <>{nodes}</>
}

const Pagination: React.FC<Props> = ({ page, size, total, onPage }) => {
  const totalPages = useMemo(() => Math.ceil(total / size), [total, size])
  const pages = useMemo(() => getPages(page, totalPages), [totalPages, page])

  return (
    <Root>
      <PaginationList>
        <li>
          <PreviousLink page={page} onClick={onPage} />
        </li>
        <PageLinks pages={pages} currentPage={page} onClick={onPage} />
        <li>
          <NextLink page={page} totalPages={totalPages} onClick={onPage} />
        </li>
      </PaginationList>
    </Root>
  )
}

export default Pagination
