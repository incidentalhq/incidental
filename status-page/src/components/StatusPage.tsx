"use client";

import NoCurrentIncident from "@/components/NoCurrentIncident";
import styled from "styled-components";
import ComponentUptime from "@/components/ComponentUptime";
import { useState } from "react";
import { subDays, startOfDay, endOfDay } from "date-fns";
import { IStatusPageResponse } from "@/types/models";
import CurrentIncidentsHero from "./CurrentIncidentsHero";

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
`;
const Section = styled.div`
  margin: 1rem 0;
`;

interface Props {
  statusPageResponse: IStatusPageResponse;
}

export default function StatusPage({ statusPageResponse }: Props) {
  const [today, setToday] = useState(new Date());
  const thirtyDaysAgo = subDays(today, 30);

  return (
    <Root>
      <Content>
        <Section>
          <Header>
            <h1>{statusPageResponse.statusPage.name}</h1>
          </Header>
        </Section>
        <Section>
          {!statusPageResponse.statusPage.hasActiveIncident ? (
            <NoCurrentIncident />
          ) : (
            <CurrentIncidentsHero statusPageResponse={statusPageResponse} />
          )}
        </Section>
        <Section>
          <ComponentUptime
            statusPageResponse={statusPageResponse}
            start={startOfDay(thirtyDaysAgo)}
            end={endOfDay(today)}
          />
        </Section>
      </Content>
    </Root>
  );
}
