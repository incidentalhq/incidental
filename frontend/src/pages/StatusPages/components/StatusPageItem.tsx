import React, { useCallback } from 'react'
import styled from 'styled-components'

import greenCheckmark from '@/assets/icons/green-check.svg'
import warningTriangle from '@/assets/icons/warning-triangle.svg'
import Icon from '@/components/Icon/Icon'
import { StatusPageIncidentStatus } from '@/types/enums'
import { IStatusPage } from '@/types/models'

interface Props {
  statusPage: IStatusPage
  onClick: (statusPage: IStatusPage) => void
}

const Root = styled.div`
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: var(--shadow);
  cursor: pointer;
`

const Title = styled.h1`
  margin: 0;
  font-weight: 600;
  font-size: 1rem;
`

const Status = styled.div`
  margin: 0;
  border: 1px solid var(--color-slate-100);
  padding: 0.25rem 0.5rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
`

const PublicUrl = styled.div``
const Row = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  align-items: center;
`

const StatusPageItem: React.FC<Props> = ({ statusPage, onClick }) => {
  const handleClick = useCallback(
    (evt: React.MouseEvent<HTMLDivElement>) => {
      evt.preventDefault()
      onClick(statusPage)
    },
    [onClick, statusPage]
  )
  return (
    <Root onClick={handleClick}>
      <Title>{statusPage.name}</Title>

      <Row>
        <Status>
          {statusPage.hasActiveIncident ? (
            <>
              <Icon icon={warningTriangle} /> Active incident
            </>
          ) : (
            <>
              <Icon icon={greenCheckmark} /> All good
            </>
          )}
        </Status>
        <PublicUrl>
          <a target="_blank" href={statusPage.publicUrl}>
            Public page &raquo;
          </a>
        </PublicUrl>
      </Row>
    </Root>
  )
}

export default StatusPageItem
