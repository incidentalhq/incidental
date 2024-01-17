import { FormikHelpers } from "formik";
import styled from "styled-components";
import { Box, Content } from "@/components/Theme/Styles";

import LoginForm, { LoginFormValues } from "@/components/LoginForm/LoginForm";
import useAuth from "@/hooks/useAuth";
import { APIError } from "@/services/transport";
import { apiErrorsToFormikErrors } from "@/utils/form";

const Root = styled.div`
  width: 30rem;
  margin: 10rem auto;

  > h2 {
    margin-bottom: 1rem;
  }
`;

const Login: React.FC = () => {
  const { login } = useAuth();

  const handleSubmit = async (
    values: LoginFormValues,
    { setErrors }: FormikHelpers<LoginFormValues>
  ) => {
    try {
      await login(values.emailAddress, values.password);
    } catch (e) {
      if (e instanceof APIError) {
        setErrors(apiErrorsToFormikErrors(e));
      }
      console.error(e);
    }
  };

  return (
    <Root>
      <h2>Login</h2>
      <Box>
        <Content data-testid="login-page">
          <LoginForm onSubmit={handleSubmit} />
        </Content>
      </Box>
    </Root>
  );
};

export default Login;
