"use client";

import NoCurrentIncident from "@/components/NoCurrentIncident";
import { IStatusPageResponse } from "@/lib/types";
import styled from "styled-components";
import { Button } from "@/components/Button";

const Root = styled.div`
  display: flex;
  justify-content: center;
`;

const Content = styled.div`
  margin: 0 auto;
  max-width: 700px;
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
  statusPage: IStatusPageResponse;
}

export default function StatusPage({ statusPage }: Props) {
  return (
    <Root>
      <Content>
        <Section>
          <Header>
            <h1>{statusPage.name}</h1>
            <div>
              <Button type="button">Subscribe</Button>
            </div>
          </Header>
        </Section>
        <Section>
          {!statusPage.hasActiveIncident ? <NoCurrentIncident /> : null}
        </Section>
      </Content>
    </Root>
  );
}
