import { formatDistanceToNow } from 'date-fns'
import { useMemo } from 'react'
import styled from 'styled-components'

import { IIncidentUpdate } from '@/types/models'

const Root = styled.div`
  padding: 0rem 20px;
  cursor: pointer;
`
const Header = styled.div`
  display: flex;
  gap: 4px;
`
const FieldChange = styled.div``
const Creator = styled.div`
  font-weight: 500;
`
const Ago = styled.div``

interface Props {
  incidentUpdate: IIncidentUpdate
}

const IncidentUpdate: React.FC<Props> = ({ incidentUpdate }) => {
  const date = useMemo(() => formatDistanceToNow(incidentUpdate.createdAt), [incidentUpdate])
  return (
    <Root>
      <div>
        <Header>
          <Creator>{incidentUpdate.creator.name}</Creator>
          <span>posted a new update</span>&#x2022;<Ago>{date} ago</Ago>
        </Header>
        {incidentUpdate.summary ? <div>{incidentUpdate.summary}</div> : null}
        <FieldChange>
          {incidentUpdate.newIncidentSeverity && incidentUpdate.previousIncidentSeverity ? (
            <>
              Severity updated: {incidentUpdate.previousIncidentSeverity?.name} {'->'}{' '}
              {incidentUpdate.newIncidentSeverity.name}
            </>
          ) : null}
        </FieldChange>
        <FieldChange>
          {incidentUpdate.newIncidentStatus && incidentUpdate.previousIncidentStatus ? (
            <>
              Status updated: {incidentUpdate.previousIncidentStatus.name} {'->'}{' '}
              {incidentUpdate.newIncidentStatus?.name}
            </>
          ) : null}
        </FieldChange>
      </div>
    </Root>
  )
}

export default IncidentUpdate
