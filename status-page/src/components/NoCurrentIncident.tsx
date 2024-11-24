"use client";

import styled from "styled-components";
import Image from "next/image";

const Root = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 4rem;
  margin-top: 4rem;
`;
const Header = styled.div`
  font-size: 1.6rem;

  h2 {
    font-weight: 600;
  }
`;
const Message = styled.div``;

import check from "@/app/assets/check.svg";

const NoCurrentIncident = () => {
  return (
    <Root>
      <Image src={check} alt="All services are online" width={48} />
      <Header>
        <h2>All services are online</h2>
      </Header>
      <Message>Everything is running smoothly.</Message>
    </Root>
  );
};

export default NoCurrentIncident;
