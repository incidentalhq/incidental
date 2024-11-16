import { format } from 'date-fns'
import { generatePath, useNavigate } from 'react-router-dom'
import styled, { css } from 'styled-components'

import warningTriangleRed from '@/assets/icons/warning-triangle-red.svg'
import warningTriangle from '@/assets/icons/warning-triangle.svg'
import Icon from '@/components/Icon/Icon'
import { Pill } from '@/components/Theme/Styles'
import MiniAvatar from '@/components/User/MiniAvatar'
import { RoutePaths } from '@/routes'
import { ComponentStatus } from '@/types/enums'
import { IStatusPageIncident } from '@/types/models'

import { mapComponentStatusToStyleProps, statusToTitleCase } from '../utils'

const rowRootCss = css`
  padding: 1rem 20px;
  border-bottom: 1px solid var(--color-gray-200);
  cursor: pointer;

  &:hover {
    background-color: var(--color-slate-50);
  }
`
const blockRootCss = css`
  padding: 1rem 20px;
  border: 1px solid var(--color-gray-200);
  cursor: pointer;
  margin-bottom: 1rem;
  margin-top: 1rem;

  &:hover {
    background-color: var(--color-slate-50);
  }
`
interface RootProps {
  $block?: boolean
}
const Root = styled.div<RootProps>`
  ${(props) => (props.$block ? blockRootCss : rowRootCss)}
`

const Header = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`
const Name = styled.div`
  font-weight: 500;
`
const Status = styled.div`
  width: 120px;
  text-align: right;
`
const Right = styled.div`
  margin-left: auto;
  display: flex;
`
const Reporter = styled.div`
  margin-left: 1rem;
`
const ReportedDate = styled.div`
  margin-left: 1rem;
`
const Message = styled.div`
  flex: 1;
`
const AffectedComponents = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`

interface Props {
  incident: IStatusPageIncident
  isBlock?: boolean
}

const StatusPageIncidentRow: React.FC<Props> = ({ incident, isBlock }) => {
  const navigate = useNavigate()

  const handleClick = (evt: React.MouseEvent<HTMLDivElement>) => {
    evt.preventDefault()
    navigate(
      generatePath(RoutePaths.STATUS_PAGE_SHOW_INCIDENT, { id: incident.statusPage.id, incidentId: incident.id })
    )
  }

  const date = format(incident.createdAt, 'd MMM')

  return (
    <Root onClick={handleClick} $block={isBlock}>
      <Header>
        <div>
          <Name>{incident.name}</Name>
          <Message>{incident.incidentUpdates[0].message}</Message>
        </div>
        <Right></Right>

        <AffectedComponents>
          {incident.incidentUpdates[0].componentUpdates
            .filter((it) => it.status !== ComponentStatus.OPERATIONAL)
            .map((it) => (
              <Pill key={it.id} {...mapComponentStatusToStyleProps(it.status)}>
                <Icon icon={it.status === ComponentStatus.FULL_OUTAGE ? warningTriangleRed : warningTriangle} /> &nbsp;
                {it.statusPageComponent.name}
              </Pill>
            ))}
        </AffectedComponents>
        <Status>{statusToTitleCase(incident.status)}</Status>
        <Reporter title="Reporter">
          <MiniAvatar user={incident.creator} />
        </Reporter>
        <ReportedDate>{date}</ReportedDate>
      </Header>
    </Root>
  )
}

export default StatusPageIncidentRow
