import React, { useMemo } from "react";
import styled from "styled-components";

import { ComponentStatus } from "@/types/enums";
import { IStatusPageComponentEvent } from "@/types/models";

// Styled components for the uptime bar
const Root = styled.div``;

const UptimeBar = styled.div`
  display: flex;
  gap: 1px;
  height: 10px;
`;

const UptimeSegment = styled.div<{ $backgroundColor: string }>`
  flex: 1;
  background-color: ${(props) => props.$backgroundColor};
  height: 100%;
`;

const UptimePercentage = styled.div`
  font-size: 0.9rem;
  color: var(--color-gray-700);
  margin-top: 0.5rem;
`;

interface UptimeGraphProps {
  events: IStatusPageComponentEvent[];
  timeRange: { start: Date; end: Date }; // Start and end of the timeline (e.g., 30 days)
  intervals: number; // Number of intervals (e.g., 30 bars for 30 days)
}

interface UptimeSegment {
  start: Date;
  end: Date;
  status: ComponentStatus;
}

const getComponentStatusRank = (status: ComponentStatus) => {
  switch (status) {
    case ComponentStatus.OPERATIONAL:
      return 0;
    case ComponentStatus.DEGRADED_PERFORMANCE:
      return 1;
    case ComponentStatus.PARTIAL_OUTAGE:
      return 2;
    case ComponentStatus.FULL_OUTAGE:
      return 3;
  }
};

const getComponentStatusStyle = (status: ComponentStatus) => {
  switch (status) {
    case ComponentStatus.OPERATIONAL:
      return { backgroundColor: "var(--color-green-400)" };
    case ComponentStatus.DEGRADED_PERFORMANCE:
      return { backgroundColor: "var(--color-yellow-400)" };
    case ComponentStatus.PARTIAL_OUTAGE:
      return { backgroundColor: "var(--color-orange-400)" };
    case ComponentStatus.FULL_OUTAGE:
      return { backgroundColor: "var(--color-red-400)" };
  }
};

const UptimeGraph: React.FC<UptimeGraphProps> = ({
  events,
  timeRange,
  intervals,
}) => {
  const { start, end } = timeRange;

  // Generate interval statuses
  const uptimeData: UptimeSegment[] = useMemo(() => {
    const totalDuration = end.getTime() - start.getTime();
    const intervalDuration = totalDuration / intervals;
    // Generate segments for each interval in the timeline and calculate the status of each segment
    const segments = Array.from({ length: intervals }, (_, index) => {
      const segmentStart = new Date(start.getTime() + index * intervalDuration);
      const segmentEnd = new Date(segmentStart.getTime() + intervalDuration);

      const segmentEvents = events.filter((event) => {
        const eventStart = new Date(event.startedAt);
        const eventEnd = event.endedAt ? new Date(event.endedAt) : end;
        return eventEnd > segmentStart && eventStart < segmentEnd;
      });

      // Get the most severe event in the segment
      const mostSevereEvent =
        segmentEvents.length > 1
          ? segmentEvents.reduce(
              (
                prev: IStatusPageComponentEvent,
                current: IStatusPageComponentEvent
              ) => {
                const prevRank = getComponentStatusRank(prev.status);
                const currentRank = getComponentStatusRank(current.status);
                return currentRank > prevRank ? current : prev;
              },
              segmentEvents[0]
            )
          : segmentEvents[0];

      // Get the status of the most severe event in the segment or default to OPERATIONAL
      const status = mostSevereEvent?.status || ComponentStatus.OPERATIONAL;

      return {
        start: segmentStart,
        end: segmentEnd,
        status: status,
      };
    });

    return segments;
  }, [events, start, end, intervals]);

  // Calculate uptime percentage by looking at the actual start/end dates of the events
  const uptimePercentage = useMemo(() => {
    const totalDuration = end.getTime() - start.getTime();
    const downtimeDuration = events.reduce((acc, event) => {
      const eventStart = new Date(event.startedAt);
      const eventEnd = event.endedAt ? new Date(event.endedAt) : end;
      return acc + (eventEnd.getTime() - eventStart.getTime());
    }, 0);

    return ((totalDuration - downtimeDuration) / totalDuration) * 100;
  }, [events, start, end]);

  return (
    <Root>
      <UptimeBar>
        {uptimeData.map((segment, index) => (
          <UptimeSegment
            key={index}
            $backgroundColor={
              getComponentStatusStyle(segment.status).backgroundColor
            }
            title=""
          />
        ))}
      </UptimeBar>
      <UptimePercentage>{uptimePercentage.toFixed(4)}% uptime</UptimePercentage>
    </Root>
  );
};

export default UptimeGraph;
