"use client";

import styled from "styled-components";
import { IStatusPageIncident } from "@/types/models";
import Timeline from "./Timeline";
import { format, formatDistanceToNow } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { formatIncidentStatusName } from "@/lib/utils";
import { CSSProperties } from "react";
import { StatusPageIncidentStatus } from "@/types/enums";

const Root = styled.div`
  display: flex;
  justify-content: center;
`;

const Content = styled.div`
  margin: 0 auto;
  width: 100%;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-slate-200);
  padding-bottom: 1rem;

  h1 {
    font-size: 1.8rem;
    font-weight: 600;
    margin: 0;
  }
`;
const Section = styled.div`
  margin: 1rem 0;
`;
const StatusUpdate = styled.div`
  border: 1px solid var(--color-slate-200);
  border-radius: var(--radius-md);
  padding: 1rem;
  background: white;
`;
const StatusUpdateHeader = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;
const Pill = styled.div<{
  $color?: CSSProperties["color"];
  $backgroundColor?: CSSProperties["backgroundColor"];
}>`
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-md);
  background: ${(props) => props.$backgroundColor};
`;
const StatusDate = styled.div`
  color: var(--color-slate-500);
`;
const Status = styled.div`
  font-weight: 600;
`;
const AffectedComponents = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;
const IncidentTime = styled.div`
  color: var(--color-slate-500);
`;
const IncidentName = styled.h2`
  font-weight: 800;
`;
const UpdatesSection = styled.div`
  background: var(--color-gray-100);
`;
const MainContent = styled.div`
  margin-top: 1rem;
  border: 1px solid var(--color-slate-200);
  border-radius: var(--radius-md);

  ${Section} {
    padding: 1rem;
  }
`;

interface Props {
  incident: IStatusPageIncident;
}

export default function IncidentPage({ incident }: Props) {
  const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const formattedDate = format(
    toZonedTime(incident.createdAt, localTimeZone),
    "MMM dd yyy hh:mm a OOOO"
  );
  const onGoingFor = formatDistanceToNow(
    toZonedTime(incident.createdAt, localTimeZone),
    {
      addSuffix: true,
    }
  );

  return (
    <Root>
      <Content>
        <Section>
          <Header>
            <h1>{incident.statusPage.name}</h1>
          </Header>
        </Section>
        <MainContent>
          <Section>
            <IncidentName>{incident.name}</IncidentName>
            <IncidentTime>
              {formattedDate}.{" "}
              {incident.status !== StatusPageIncidentStatus.RESOLVED
                ? `Ongoing for ${onGoingFor}`
                : ""}{" "}
            </IncidentTime>
          </Section>
          <Section>
            <AffectedComponents>
              <div>Affected components</div>
              {incident.componentsAffected.map((component) => (
                <Pill
                  key={component.id}
                  $backgroundColor="var(--color-slate-100)"
                  $color="var(--color-slate-800)"
                >
                  {component.statusPageComponent.name}
                </Pill>
              ))}
            </AffectedComponents>
          </Section>
          <UpdatesSection>
            <Section>
              <h2>Updates</h2>
              <Timeline
                updates={incident.incidentUpdates}
                render={(prop) => (
                  <StatusUpdate key={prop.id}>
                    <StatusUpdateHeader>
                      <Status>{formatIncidentStatusName(prop.status)}</Status>
                      <StatusDate>
                        {format(prop.createdAt, "MMM dd yyy")} at{" "}
                        {format(prop.createdAt, "hh:mm a")}
                      </StatusDate>
                    </StatusUpdateHeader>
                    <p>{prop.message}</p>
                  </StatusUpdate>
                )}
              />
            </Section>
          </UpdatesSection>
        </MainContent>
      </Content>
    </Root>
  );
}
