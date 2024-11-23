import styled from "styled-components";
import UptimeTimeline from "./UptimeTimeline";
import type {
  IStatusPageComponent,
  IStatusPageComponentEvent,
} from "@/types/models";

const Root = styled.div``;
const Name = styled.div`
  font-weight: 500;
`;

const UptimeGraphHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;
const UptimeGraphFooter = styled.div`
  display: flex;
  justify-content: space-between;
  color: var(--color-gray-500);
  margin-top: 0.5rem;
`;
const UptimePercentage = styled.div`
  font-size: 0.9rem;
  color: var(--color-green-800);
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
  return (
    <Root>
      <UptimeGraphHeader>
        <Name>{component.name}</Name>
        <UptimePercentage>
          {(uptimes[component.id] * 100).toFixed(4)}%
        </UptimePercentage>
      </UptimeGraphHeader>
      <UptimeTimeline
        beginAt={beginAt}
        events={events.filter(
          (it) => it.statusPageComponent.id === component.id
        )}
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
