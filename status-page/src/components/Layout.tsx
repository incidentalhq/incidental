"use client";

import Footer from "@/components/Footer";
import styled from "styled-components";
import Header from "./Header";

const Root = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: auto;
  margin-right: auto;
  min-height: 100vh;
  max-width: 700px;
`;
const Main = styled.div`
  flex: 1 1 0%;
`;

export default function Layout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  return (
    <Root>
      <Header />
      <Main>{children}</Main>
      <Footer />
    </Root>
  );
}
