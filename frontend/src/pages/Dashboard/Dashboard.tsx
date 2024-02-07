import { Box, Button, Content, Header, Title } from "@/components/Theme/Styles";
import useApiService from "@/hooks/useApi";
import { useQuery } from "@tanstack/react-query";

const Dashboard = () => {
  const { apiService } = useApiService();

  const query = useQuery({
    queryKey: ["incidents"],
    queryFn: () => apiService.searchIncidents(""),
  });

  const handleDeclare = (evt: React.MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault();
  };

  return (
    <>
      <Box>
        <Header>
          <Title>Dashboard</Title>
          <div>
            <Button $primary={true} onClick={handleDeclare}>
              Declare incident
            </Button>
          </div>
        </Header>
        <Content $padding={false}></Content>
      </Box>
    </>
  );
};

export default Dashboard;
