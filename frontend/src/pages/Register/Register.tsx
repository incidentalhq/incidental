import { FormikHelpers } from "formik";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Box, Content } from "@/components/Theme/Styles";

import RegisterForm, {
  RegisterFormValues,
} from "@/components/RegisterForm/RegisterForm";
import useApiService from "@/hooks/useApi";
import { RoutePaths } from "@/routes";
import { APIError } from "@/services/transport";
import { apiErrorsToFormikErrors } from "@/utils/form";

const Root = styled.div`
  width: 30rem;
  margin: 10rem auto;

  > h2 {
    margin-bottom: 1rem;
  }
`;
const FooterMessage = styled.div`
  font-size: 0.9rem;
  display: flex;
  justify-content: space-between;
  border: 1px solid var(--color-gray-200);
  padding: 1rem;
  border-radius: 0.4rem;

  > a {
    text-decoration: none;
  }
`;

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { apiService } = useApiService();

  const handleSubmit = async (
    values: RegisterFormValues,
    { setErrors }: FormikHelpers<RegisterFormValues>
  ) => {
    try {
      await apiService.createUser(values);
      navigate(RoutePaths.REGISTER_SUCCESS);
    } catch (e) {
      if (e instanceof APIError) {
        setErrors(apiErrorsToFormikErrors(e));
      }
      console.error(e);
    }
  };

  return (
    <Root>
      <h2>Create new account</h2>
      <Box>
        <Content>
          <RegisterForm onSubmit={handleSubmit} />
        </Content>
      </Box>
      <FooterMessage>
        Already have an account? <Link to={"/login"}>Login here</Link>
      </FooterMessage>
    </Root>
  );
};

export default Register;
