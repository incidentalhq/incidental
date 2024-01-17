import styled from "styled-components";
import { Box, Content } from "@/components/Theme/Styles";

const Root = styled.div`
  width: 30rem;
  margin: 10rem auto;
`;

const RegisterSuccess: React.FC = () => {
  return (
    <Root>
      <Box>
        <Content>
          <p>
            Registration was successful, please check your email to verify your
            account
          </p>
        </Content>
      </Box>
    </Root>
  );
};

export default RegisterSuccess;
