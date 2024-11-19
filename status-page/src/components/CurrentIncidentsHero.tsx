import { IStatusPageResponse } from "@/types/models";
import React from "react";
import styled from "styled-components";
import { formatDistanceToNow } from "date-fns";
import { formatIncidentStatus, mapComponentStatusToColor } from "@/lib/utils";
import { ComponentStatus } from "@/types/enums";

const Root = styled.div`
  border: 1px solid var(--color-orange-200);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow);
`;
const Header = styled.div`
  padding: 1rem;
  background-color: var(--color-orange-50);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
`;
const Body = styled.div`
  padding: 1rem;
`;
const Title = styled.div`
  font-weight: bold;
  margin-bottom: 1rem;
`;
const IncidentWrapper = styled.div`
  padding: 1rem;
  background-color: var(--color-slate-100);
  border-radius: var(--radius-lg);
`;
const IncidentHeader = styled.div`
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const IncidentTitle = styled.div`
  font-weight: bold;
`;
const IncidentMessage = styled.div`
  margin-bottom: 0.5rem;
`;
const IncidentFooter = styled.div`
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const AffectedComponent = styled.div<{ $status: ComponentStatus }>`
  display: inline-block;
  background-color: ${(props) => mapComponentStatusToColor(props.$status)};
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-md);
`;
const Ongoing = styled.div`
  color: var(--color-gray-600);
`;
const IncidentStatus = styled.div`
  color: var(--color-gray-600);
`;
const AffectedComponentsWrapper = styled.div`
  display: flex;
  gap: 0.5rem;
`;

interface Props {
  statusPageResponse: IStatusPageResponse;
}

const CurrentIncidentsHero: React.FC<Props> = ({ statusPageResponse }) => {
  return (
    <Root>
      <Header>
        <div>There are ongoing incidents</div>
      </Header>
      <Body>
        <Title>Active incidents</Title>
        <div>
          {statusPageResponse.incidents.map((incident) => (
            <IncidentWrapper key={incident.id}>
              <IncidentHeader>
                <IncidentTitle>{incident.name}</IncidentTitle>
                <Ongoing>
                  Ongoing for{" "}
                  {formatDistanceToNow(new Date(incident.publishedAt))}
                </Ongoing>
              </IncidentHeader>
              <IncidentMessage>
                {incident.incidentUpdates[0].message}
              </IncidentMessage>
              <IncidentFooter>
                <IncidentStatus>
                  {formatIncidentStatus(incident.status)}
                </IncidentStatus>
                <AffectedComponentsWrapper>
                  {incident.incidentUpdates[0].componentUpdates.map(
                    (component) => (
                      <AffectedComponent
                        key={component.id}
                        $status={component.status}
                      >
                        {component.statusPageComponent.name}
                      </AffectedComponent>
                    )
                  )}
                </AffectedComponentsWrapper>
              </IncidentFooter>
            </IncidentWrapper>
          ))}
        </div>
      </Body>
    </Root>
  );
};

export default CurrentIncidentsHero;
