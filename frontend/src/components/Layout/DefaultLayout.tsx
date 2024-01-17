import styled from "styled-components";

import useAuth from "@/hooks/useAuth";

import Header from "../Sections/Header";
import SideBar from "../Sections/Sidebar";

const Container = styled.div`
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
`;

const Content = styled.div``;

const RightColumn = styled.div`
  background: #fff;
  flex: 1;
  padding: 1rem;
`;

const LeftColumn = styled.div`
  margin: 1rem;
  width: 10rem;
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
