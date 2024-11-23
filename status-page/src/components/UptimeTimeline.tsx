import React, { useMemo } from "react";
import styled, { CSSProperties } from "styled-components";
import { Tooltip } from "react-tooltip";

import { ComponentStatus } from "@/types/enums";
import { IStatusPageComponentEvent } from "@/types/models";
import { renderToStaticMarkup } from "react-dom/server";
import TooltipContent from "./TooltipContent";
import { getComponentStatusStyle, getMostSevereEvent } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { startOfDay } from "date-fns";

const Root = styled.div``;
const UptimeBar = styled.div`
  display: flex;
  gap: 1px;
  height: 30px;
`;

const UptimeSegment = styled.div<{
  $backgroundColor: CSSProperties["backgroundColor"] | undefined;
}>`
  flex: 1;
  background-color: ${(props) => props.$backgroundColor};
  height: 100%;

  &:hover {
    filter: brightness(0.9);
  }
`;

interface UptimeGraphProps {
  events: IStatusPageComponentEvent[];
  timeRange: { start: Date; end: Date }; // Start and end of the timeline (e.g., 30 days)
  intervals: number; // Number of intervals (e.g., 30 bars for 30 days)
  beginAt: Date;
}

export interface UptimeSegment {
  start: Date;
  end: Date;
  status: ComponentStatus;
  events: IStatusPageComponentEvent[];
  hasData: boolean;
}

const UptimeTimeline: React.FC<UptimeGraphProps> = ({
  events,
  timeRange,
  intervals,
  beginAt,
}) => {
  const pathName = usePathname();
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
      const mostSevereEvent = getMostSevereEvent(segmentEvents);

      // Get the status of the most severe event in the segment or default to OPERATIONAL
      const status = mostSevereEvent?.status || ComponentStatus.OPERATIONAL;

      // Check if the segment has any data
      const hasData = segmentEnd > startOfDay(beginAt);

      return {
        start: segmentStart,
        end: segmentEnd,
        status: status,
        events: segmentEvents,
        hasData: hasData,
      };
    });

    return segments;
  }, [events, start, end, intervals]);

  return (
    <Root>
      <UptimeBar>
        {uptimeData.map((segment, index) => (
          <UptimeSegment
            data-tooltip-html={renderToStaticMarkup(
              <TooltipContent segment={segment} currentPath={pathName} />
            )}
            data-tooltip-place="bottom"
            data-tooltip-id={`segment-tooltip-${
              segment.status === ComponentStatus.OPERATIONAL
                ? "operational"
                : "incidents"
            }`}
            key={index}
            $backgroundColor={
              !segment.hasData
                ? "var(--color-gray-300)"
                : getComponentStatusStyle(segment.status).backgroundColor
            }
          />
        ))}
        <Tooltip
          id="segment-tooltip-incidents"
          style={{
            padding: 0,
          }}
          clickable={true}
        />
        <Tooltip
          id="segment-tooltip-operational"
          style={{
            padding: 0,
          }}
        />
      </UptimeBar>
    </Root>
  );
};

export default UptimeTimeline;
