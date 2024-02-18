import styled from 'styled-components'

const Root = styled.div`
  display: flex;
  border: 1px solid var(--color-gray-200);
  border-radius: 0.4rem;
  width: fit-content;
`
const Label = styled.div`
  margin-right: 0.5rem;
  padding: 0.25rem 0.5rem;
`
const Value = styled.div`
  background-color: var(--color-gray-50);
  padding: 0.25rem 0.5rem;
  border-radius: 0 0.4rem 0.4rem 0;
`

interface Props {
  label?: string
  value: string
}

const Pill: React.FC<Props> = ({ label, value }) => {
  return (
    <Root>
      {label && <Label>{label}</Label>}
      <Value>{value}</Value>
    </Root>
  )
}

export default Pill
