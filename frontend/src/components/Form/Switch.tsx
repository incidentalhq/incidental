import { useField } from "formik";
import styled from "styled-components";

interface ButtonElProps {
  checked: boolean;
}

const Root = styled.div`
  display: inline-block;
  padding: 0.5rem 0;
`;

const LabelEl = styled.label<ButtonElProps>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  width: 50px;
  height: 16px;
  background: ${(props) =>
    props.checked ? "var(--color-green-500)" : "var(--color-gray-300)"};
  border-radius: 50px;
  position: relative;
  transition: background-color 0.2s;
`;

const ButtonEl = styled.span<ButtonElProps>`
  content: "";
  position: absolute;
  width: 24px;
  height: 24px;
  border-radius: 24px;
  transition: 0.2s;
  background: #fff;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-gray-400);

  ${(props) =>
    props.checked ? `right: 24px; transform: translateX(100%);` : `left: 0;`}
`;

interface Props {
  name: string;
  onValue?: string | number | boolean;
  offValue?: string | number | boolean;
}

const Switch: React.FC<Props> = ({
  name,
  onValue = true,
  offValue = false,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [field, _meta, helpers] = useField(name);
  const isChecked = field.value === onValue ? true : false;

  return (
    <Root>
      <LabelEl
        checked={isChecked}
        onClick={() => helpers.setValue(isChecked ? offValue : onValue)}
      >
        <ButtonEl checked={isChecked} />
      </LabelEl>
    </Root>
  );
};

export default Switch;
