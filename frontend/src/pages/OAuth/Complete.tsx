import styled from "styled-components";
import { Box, Content } from "@/components/Theme/Styles";

import useAuth from "@/hooks/useAuth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCallback, useEffect } from "react";
import useApiService from "@/hooks/useApi";
import { RoutePaths } from "@/routes";

const Root = styled.div`
  width: 30rem;
  margin: 10rem auto;

  > h2 {
    margin-bottom: 1rem;
  }
`;

type State = {
  mode: "login" | "installation";
};

const OAuthComplete: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { slackLogin } = useAuth();
  const { apiService } = useApiService();
  const navigate = useNavigate();

  const processOauth = useCallback(
    async (code: string, state: string) => {
      const stateDecoded = JSON.parse(atob(state)) as State;
      if (stateDecoded.mode == "login") {
        await slackLogin(code);
      } else {
        await apiService.slackInstallation(code);
      }
      navigate(RoutePaths.DASHBOARD);
    },
    [slackLogin, apiService, navigate]
  );

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    if (!code) {
      console.error("Unable to find code");
      return;
    }
    if (!state) {
      console.error("Unable to find state");
      return;
    }

    processOauth(code, state);
  }, [searchParams, slackLogin, processOauth]);

  return (
    <Root>
      <Box>
        <Content>Logging in...</Content>
      </Box>
    </Root>
  );
};

export default OAuthComplete;
