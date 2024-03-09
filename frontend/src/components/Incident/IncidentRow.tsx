import { format } from 'date-fns'
import { useMemo } from 'react'
import { generatePath, useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import { RoutePaths } from '@/routes'
import { IncidentRoleKind } from '@/types/enums'
import { IIncident } from '@/types/models'

import MiniAvatar from '../User/MiniAvatar'

const Root = styled.div`
  padding: 1rem 20px;
  border-bottom: 1px solid var(--color-gray-200);
  cursor: pointer;

  &:hover {
    background-color: var(--color-slate-50);
  }
`
const Header = styled.div`
  display: flex;
  gap: 8px;
`
const Reference = styled.div`
  font-weight: 600;
  width: 80px;
`
const Name = styled.div``
const Status = styled.div`
  width: 80px;
`
const Severity = styled.div`
  width: 80px;
`
const Right = styled.div`
  margin-left: auto;
  display: flex;
`
const Reporter = styled.div`
  margin-left: 1rem;
`
const Lead = styled.div``
const NoLeadAvatar = styled.div`
  height: 18px;
  width: 18px;
  border-radius: 9px;
  background-color: var(--color-gray-200);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 9px;
  font-weight: 500;
`
const ReportedDate = styled.div`
  margin-left: 1rem;
`

interface Props {
  incident: IIncident
}

const IncidentRow: React.FC<Props> = ({ incident }) => {
  const navigate = useNavigate()

  const handleClick = (evt: React.MouseEvent<HTMLDivElement>) => {
    evt.preventDefault()
    navigate(generatePath(RoutePaths.SHOW_INCIDENT, { id: incident.id }))
  }

  const reporter = useMemo(
    () => incident.incidentRoleAssignments.find((it) => it.incidentRole.kind === IncidentRoleKind.REPORTER),
    [incident]
  )
  const lead = useMemo(
    () => incident.incidentRoleAssignments.find((it) => it.incidentRole.kind === IncidentRoleKind.LEAD),
    [incident]
  )
  const date = format(incident.createdAt, 'd MMM')

  return (
    <Root onClick={handleClick}>
      <Header>
        <Reference>{incident.reference}</Reference>
        <Status>{incident.incidentStatus.name}</Status>
        <Severity>{incident.incidentSeverity.name}</Severity>
        <Name>{incident.name}</Name>
        <Right>
          <Lead title="Incident lead">{lead ? <MiniAvatar user={lead.user} /> : <NoLeadAvatar />}</Lead>
          {reporter ? (
            <Reporter title="Reporter">
              <MiniAvatar user={reporter.user} />
            </Reporter>
          ) : null}
          <ReportedDate>{date}</ReportedDate>
        </Right>
      </Header>
    </Root>
  )
}

export default IncidentRow
