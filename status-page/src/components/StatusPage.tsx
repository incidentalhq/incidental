"use client";

import NoCurrentIncident from "@/components/NoCurrentIncident";
import styled from "styled-components";
import SystemStatus from "@/components/SystemStatus";
import { useState } from "react";
import { subDays, startOfDay, endOfDay } from "date-fns";
import { IStatusPageResponse } from "@/types/models";
import CurrentIncidentsHero from "./CurrentIncidentsHero";
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

interface Props {
  statusPageResponse: IStatusPageResponse;
}

export default function StatusPage({ statusPageResponse }: Props) {
  const [today, setToday] = useState(new Date());
  const thirtyDaysAgo = subDays(today, 90);

  const hasActiveIncident = statusPageResponse.incidents.some(
    (it) => it.status !== StatusPageIncidentStatus.RESOLVED
  );

  return (
    <Root>
      <Content>
        <Section>
          <Header>
            <h1>{statusPageResponse.statusPage.name}</h1>
          </Header>
        </Section>
        <Section>
          {hasActiveIncident ? (
            <CurrentIncidentsHero statusPageResponse={statusPageResponse} />
          ) : (
            <NoCurrentIncident />
          )}
        </Section>
        <Section>
          <SystemStatus
            statusPageResponse={statusPageResponse}
            start={startOfDay(thirtyDaysAgo)}
            end={endOfDay(today)}
          />
        </Section>
      </Content>
    </Root>
  );
}
