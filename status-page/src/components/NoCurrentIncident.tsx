"use client";

import styled from "styled-components";

const Root = styled.div`
  border: 1px solid var(--color-green-500);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow);
`;
const Header = styled.div`
  padding: 1rem;
  background-color: var(--color-green-50);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
`;
const Message = styled.div`
  padding: 1rem;
`;

const NoCurrentIncident = () => {
  return (
    <Root>
      <Header>
        <h2>No current incident</h2>
      </Header>
      <Message>Everything is running smoothly.</Message>
    </Root>
  );
};

export default NoCurrentIncident;
