import { FormikHelpers } from 'formik'
import React from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'

import logo from '@/assets/mark_noborder.png'
import { Box } from '@/components/Theme/Styles'
import SendCodeForm, { SendCodeFormValues } from '@/components/Verify/SendCode'
import useApiService from '@/hooks/useApi'
import { APIError } from '@/services/transport'
import { apiErrorsToFormikErrors } from '@/utils/form'

import { Content, FooterMessage, Logo, Root } from './styles'

const VerifySendCode: React.FC = () => {
  const { apiService } = useApiService()
  const handleSubmit = async (values: SendCodeFormValues, { setErrors }: FormikHelpers<SendCodeFormValues>) => {
    try {
      await apiService.sendVerificationCode(values.emailAddress)
      toast('New verification code has been sent, please check your email account', { type: 'success' })
    } catch (e) {
      if (e instanceof APIError) {
        setErrors(apiErrorsToFormikErrors(e))
      }
    }
  }

  return (
    <Root>
      <Logo src={logo} />
      <h2>Send verification code</h2>
      <Box>
        <Content data-testid="login-page">
          <SendCodeForm onSubmit={handleSubmit} />
        </Content>
      </Box>
      <FooterMessage>
        <Link to={'/register'}>Create a new account</Link>
        <Link to={`/login`}>Login to your account</Link>
      </FooterMessage>
    </Root>
  )
}

export default VerifySendCode
