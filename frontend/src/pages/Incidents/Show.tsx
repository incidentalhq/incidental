import {
  Box,
  Button,
  Content,
  ContentMain,
  ContentSidebar,
  Header,
  Title,
} from "@/components/Theme/Styles";
import styled from "styled-components";
import useApiService from "@/hooks/useApi";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import Loading from "@/components/Loading/Loading";
import IncidentUpdate from "./components/IncidentUpdate/IncidentUpdate";

type UrlParams = {
  id: string;
};

const ShowIncident = () => {
  const { apiService } = useApiService();
  const { id } = useParams<UrlParams>() as UrlParams;

  const query = useQuery({
    queryKey: ["incident", id],
    queryFn: () => apiService.getIncident(id),
  });

  const incidentUpdatesQuery = useQuery({
    queryKey: ["incident-updates", id],
    queryFn: () => apiService.getIncidentUpdates(id),
  });

  return (
    <>
      <Box>
        {query.isLoading && <Loading />}
        {query.isSuccess ? (
          <>
            <Header>
              <Title>{query.data.name}</Title>
            </Header>
            <Content $padding={false}>
              <ContentMain>
                <p>{query.data.description}</p>

                <h2>Updates</h2>
                {incidentUpdatesQuery.isSuccess ? (
                  <>
                    {incidentUpdatesQuery.data.items.map((it) => (
                      <IncidentUpdate key={it.id} incidentUpdate={it} />
                    ))}
                  </>
                ) : (
                  <p>There was an issue </p>
                )}
              </ContentMain>
              <ContentSidebar>
                <div>
                  <span>Status</span>
                  <span>{query.data.incidentStatus.name}</span>
                </div>
              </ContentSidebar>
            </Content>
          </>
        ) : null}
      </Box>
    </>
  );
};

export default ShowIncident;
