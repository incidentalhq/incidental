import { ErrorMessage, Field as FormikField, useField } from "formik";
import styled from "styled-components";

const HelpEl = styled.div`
  font-size: 0.9rem;
  color: var(--color-gray-500);
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Field = (props: any) => {
  const [field, meta] = useField(props);
  let klass = props.className;

  if (meta.error && meta.touched) {
    klass = `${klass} error`;
  }

  return (
    <>
      <FormikField {...props} className={klass} />
      {props.help && !(meta.error && meta.touched) ? (
        <HelpEl>{props.help}</HelpEl>
      ) : null}
      <ErrorMessage name={field.name} component="div" className="error-help" />
    </>
  );
};

export default Field;
