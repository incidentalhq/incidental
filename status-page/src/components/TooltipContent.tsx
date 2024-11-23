import { format } from "date-fns";
import Image from "next/image";
import { UptimeSegment } from "./UptimeTimeline";
import Link from "next/link";
import styled from "styled-components";

import check from "@/app/assets/check.svg";
import {
  IRelatedStatusPageIncident,
  IStatusPageComponentEvent,
  ModelID,
} from "@/types/models";
import { getMostSevereEvent } from "@/lib/utils";
import ComponentStatusIcon from "./ComponentStatusIcon";

const Root = styled.div`
  color: #fff;
`;
const Date = styled.div`
  padding: 1rem;
  background-color: var(--color-slate-900);
  border-radius: 0.5rem 0.5rem 0 0;
`;
const Content = styled.div``;
const Status = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem;
`;
const Incident = styled.div`
  padding: 1rem;
  display: flex;
  gap: 1rem;
  align-items: center;

  a {
    text-decoration: none;
    color: #fff;
  }
`;

interface Props {
  segment: UptimeSegment;
  currentPath: string;
}

const TooltipContent: React.FC<Props> = ({ segment, currentPath }) => {
  const incidentsToEvents = segment.events.reduce(
    (acc, event) => {
      if (acc[event.statusPageIncident.id]) {
        acc[event.statusPageIncident.id] = {
          incident: event.statusPageIncident,
          events: [...acc[event.statusPageIncident.id].events, event],
        };
      } else {
        acc[event.statusPageIncident.id] = {
          incident: event.statusPageIncident,
          events: [event],
        };
      }
      return acc;
    },
    {} as Record<
      ModelID,
      {
        incident: IRelatedStatusPageIncident;
        events: IStatusPageComponentEvent[];
      }
    >
  );

  return (
    <Root>
      <Date>{format(segment.start, "MMM d, yyyy")}</Date>
      {segment.events.length == 0 ? (
        <Content>
          <Status>
            <Image src={check} width={16} alt="Operational checkmark" />
            <div>Operational</div>
          </Status>
        </Content>
      ) : (
        <Content>
          {Object.entries(incidentsToEvents).map(([, item]) => (
            <Incident key={item.incident.id}>
              <ComponentStatusIcon
                status={getMostSevereEvent(item.events).status}
              />{" "}
              <Link
                href={`${currentPath == "/" ? "" : currentPath}/incident/${
                  item.incident.id
                }`}
              >
                {item.incident.name}
              </Link>
            </Incident>
          ))}
        </Content>
      )}
    </Root>
  );
};

export default TooltipContent;
