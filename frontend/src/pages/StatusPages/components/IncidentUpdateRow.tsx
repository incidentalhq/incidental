import { format } from 'date-fns'
import styled from 'styled-components'

import warningTriangleRed from '@/assets/icons/warning-triangle-red.svg'
import warningTriangle from '@/assets/icons/warning-triangle.svg'
import Icon from '@/components/Icon/Icon'
import { Pill } from '@/components/Theme/Styles'
import MiniAvatar from '@/components/User/MiniAvatar'
import { ComponentStatus } from '@/types/enums'
import { IStatusPageIncidentUpdate } from '@/types/models'

import { mapComponentStatusToStyleProps, statusToTitleCase } from '../utils'

const Root = styled.div`
  margin-left: 1rem;
`
const Status = styled.div``
const Reporter = styled.div`
  margin-left: auto;
`
const ReportedDate = styled.div`
  margin-left: 1rem;
`
const Message = styled.div`
  margin-bottom: 1rem;
`
const AffectedComponents = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`
const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`

interface Props {
  statusPageIncidentUpdate: IStatusPageIncidentUpdate
}

const StatusPageIncidentUpdateRow: React.FC<Props> = ({ statusPageIncidentUpdate }) => {
  const date = format(statusPageIncidentUpdate.createdAt, 'd MMM')

  return (
    <Root>
      <Header>
        <Status>{statusToTitleCase(statusPageIncidentUpdate.status)}</Status>
        <Reporter title="Reporter">
          <MiniAvatar user={statusPageIncidentUpdate.creator} />
        </Reporter>
        <ReportedDate>{date}</ReportedDate>
      </Header>
      <Message>{statusPageIncidentUpdate.message}</Message>
      <AffectedComponents>
        {statusPageIncidentUpdate.componentUpdates
          .filter((it) => it.status !== ComponentStatus.OPERATIONAL)
          .map((it) => (
            <Pill key={it.id} {...mapComponentStatusToStyleProps(it.status)}>
              <Icon icon={it.status === ComponentStatus.FULL_OUTAGE ? warningTriangleRed : warningTriangle} /> &nbsp;
              {it.statusPageComponent.name}
            </Pill>
          ))}
      </AffectedComponents>
    </Root>
  )
}

export default StatusPageIncidentUpdateRow
