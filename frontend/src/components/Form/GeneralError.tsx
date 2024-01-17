import { useField } from "formik";
import styled from "styled-components";

const Error = styled.div`
  background-color: #dc3545;
  color: #fff;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border-radius: 0.4rem;
`;

const GeneralError = () => {
  const [, meta] = useField("general");
  return (
    <>
      {meta.error && typeof meta.error == "string" ? (
        <Error>{meta.error}</Error>
      ) : null}
    </>
  );
};

export default GeneralError;
