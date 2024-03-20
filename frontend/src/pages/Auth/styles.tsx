import styled from 'styled-components'

export const Root = styled.div`
  width: 30rem;
  margin: 10rem auto;
  text-align: center;

  > h2 {
    margin-bottom: 1rem;
  }
`
export const Content = styled.div`
  padding: 1rem;
  border: 1px solid var(--color-gray-200);
  background-color: #fff;
  margin-top: 1rem;
  text-align: left;
`

export const FooterMessage = styled.div`
  font-size: 12px;
  margin-top: 1rem;
  text-align: center;
`
export const Logo = styled.img`
  width: 32px;
  height: 32px;
  display: inline-block;
  border-radius: 16px;
`
