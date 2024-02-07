import { Box, Button, Content, Header, Title } from "@/components/Theme/Styles";
import useApiService from "@/hooks/useApi";
import { useQuery } from "@tanstack/react-query";
import IncidentRow from "./components/IncidentRow/IncidentRow";

const IncidentsList = () => {
  const { apiService } = useApiService();

  const query = useQuery({
    queryKey: ["incidents"],
    queryFn: () => apiService.searchIncidents(),
  });

  const handleDeclare = (evt: React.MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault();
  };

  return (
    <>
      <Box>
        <Header>
          <Title>Incidents</Title>
          <div>
            <Button $primary={true} onClick={handleDeclare}>
              Declare incident
            </Button>
          </div>
        </Header>
        <Content $padding={false}>
          {query.data?.items.map((it) => (
            <IncidentRow key={it.id} incident={it} />
          ))}
        </Content>
      </Box>
    </>
  );
};

export default IncidentsList;
