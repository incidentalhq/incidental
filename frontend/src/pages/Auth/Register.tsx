import { FormikHelpers } from 'formik'
import { Link, useNavigate } from 'react-router-dom'

import logo from '@/assets/mark_noborder.png'
import RegisterForm, { RegisterFormValues } from '@/components/RegisterForm/RegisterForm'
import useApiService from '@/hooks/useApi'
import { RoutePaths } from '@/routes'
import { APIError } from '@/services/transport'
import { apiErrorsToFormikErrors } from '@/utils/form'

import { Content, FooterMessage, Logo, Root } from './styles'

const Register: React.FC = () => {
  const navigate = useNavigate()
  const { apiService } = useApiService()

  const handleSubmit = async (values: RegisterFormValues, { setErrors }: FormikHelpers<RegisterFormValues>) => {
    try {
      await apiService.createUser(values)
      navigate(RoutePaths.REGISTER_SUCCESS)
    } catch (e) {
      if (e instanceof APIError) {
        setErrors(apiErrorsToFormikErrors(e))
      }
      console.error(e)
    }
  }

  return (
    <Root>
      <Logo src={logo} />
      <h2>Create new account</h2>
      <Content>
        <RegisterForm onSubmit={handleSubmit} />
      </Content>
      <FooterMessage>
        Already have an account? <Link to={RoutePaths.EMAIL_LOGIN}>Login here</Link>
      </FooterMessage>
    </Root>
  )
}

export default Register
