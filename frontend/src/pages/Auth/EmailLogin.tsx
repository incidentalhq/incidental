import { FormikHelpers } from 'formik'
import { Link } from 'react-router-dom'

import logo from '@/assets/mark_noborder.png'
import LoginForm, { LoginFormValues } from '@/components/LoginForm/LoginForm'
import useAuth from '@/hooks/useAuth'
import { RoutePaths } from '@/routes'
import { APIError } from '@/services/transport'
import { apiErrorsToFormikErrors } from '@/utils/form'

import { Content, FooterMessage, Logo, Root } from './styles'

const Login: React.FC = () => {
  const { login } = useAuth()

  const handleSubmit = async (values: LoginFormValues, { setErrors }: FormikHelpers<LoginFormValues>) => {
    try {
      await login(values.emailAddress, values.password)
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
      <h2>Login</h2>
      <Content>
        <LoginForm onSubmit={handleSubmit} />
      </Content>
      <FooterMessage>
        Need a new account? <Link to={RoutePaths.REGISTER}>Register here</Link>
      </FooterMessage>
    </Root>
  )
}

export default Login
