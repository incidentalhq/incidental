import {
  Box,
  Content,
  Header,
  PrimaryLinkButton,
  Title,
} from "@/components/Theme/Styles";

const Dashboard = () => {
  return (
    <>
      <Box>
        <Header>
          <Title>Dashboard</Title>
          <div></div>
        </Header>
        <Content $padding={false}></Content>
      </Box>
    </>
  );
};

export default Dashboard;
