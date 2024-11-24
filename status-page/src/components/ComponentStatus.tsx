import styled from "styled-components";
import UptimeTimeline from "./UptimeTimeline";
import type {
  IStatusPageComponent,
  IStatusPageComponentEvent,
} from "@/types/models";
import ComponentStatusIcon from "./ComponentStatusIcon";
import { ComponentStatus as ComponentStatusEnum } from "@/types/enums";

const Root = styled.div``;
const Name = styled.div`
  font-weight: 500;
`;

const UptimeGraphHeader = styled.div`
  display: flex;
  margin-bottom: 0.5rem;
  gap: 0.5rem;
  align-items: center;
`;
const UptimeGraphFooter = styled.div`
  display: flex;
  justify-content: space-between;
  color: var(--color-gray-500);
  margin-top: 0.5rem;
  align-items: center;
`;
const UptimePercentage = styled.div`
  font-size: 0.9rem;
  color: var(--color-green-800);
  margin-left: auto;
`;

interface Props {
  beginAt: Date;
  component: IStatusPageComponent;
  uptimes: Record<string, number>;
  events: IStatusPageComponentEvent[];
  start: Date;
  end: Date;
}
const ComponentStatus: React.FC<Props> = ({
  component,
  uptimes,
  start,
  end,
  events,
  beginAt,
}) => {
  const componentEvents = events.filter(
    (event) => event.statusPageComponent.id === component.id
  );
  const now = new Date();
  const ongoingEvent = componentEvents.find(
    (it) => new Date(it.startedAt) < now && !it.endedAt
  );
  return (
    <Root>
      <UptimeGraphHeader>
        <ComponentStatusIcon
          status={
            ongoingEvent ? ongoingEvent.status : ComponentStatusEnum.OPERATIONAL
          }
        />
        <Name>{component.name}</Name>
        <UptimePercentage>
          {(uptimes[component.id] * 100).toFixed(4)}%
        </UptimePercentage>
      </UptimeGraphHeader>
      <UptimeTimeline
        beginAt={beginAt}
        events={componentEvents}
        timeRange={{ start, end }}
        intervals={90}
      />
      <UptimeGraphFooter>
        <div>90 days ago</div>
        <div>Today</div>
      </UptimeGraphFooter>
    </Root>
  );
};

export default ComponentStatus;
