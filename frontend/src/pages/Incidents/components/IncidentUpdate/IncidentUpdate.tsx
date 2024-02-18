import styled from 'styled-components'

import { IIncidentUpdate } from '@/types/models'

const Root = styled.div`
  padding: 0rem 20px;
  cursor: pointer;
`
const Creator = styled.div`
  display: flex;
  gap: 8px;
`
const FieldChange = styled.div``

interface Props {
  incidentUpdate: IIncidentUpdate
}

const IncidentUpdate: React.FC<Props> = ({ incidentUpdate }) => {
  return (
    <Root>
      <div>
        <Creator>
          <dt>{incidentUpdate.creator.name}</dt> posted a new update
        </Creator>
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
