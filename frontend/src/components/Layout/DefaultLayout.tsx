import styled from "styled-components";

import useAuth from "@/hooks/useAuth";

import Header from "../Sections/Header";
import SideBar from "../Sections/Sidebar";

const Container = styled.div`
  display: flex;
  margin: 0 auto;
  width: 100%;
`;

const Content = styled.div``;

const RightColumn = styled.div`
  background: #fff;
  flex: 1;
  padding: 1rem;
`;

const LeftColumn = styled.div`
  padding: 1rem;
  width: 10rem;
  border-right: 1px solid var(--color-gray-200);
  height: 100vh;
`;

type Props = {
  children?: React.ReactNode;
};

const DefaultLayout: React.FC<Props> = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <>User not found</>;
  }

  return (
    <Container>
      <LeftColumn>
        <SideBar user={user} />
      </LeftColumn>
      <RightColumn>
        <Header user={user} />
        <Content>{children}</Content>
      </RightColumn>
    </Container>
  );
};

export default DefaultLayout;
