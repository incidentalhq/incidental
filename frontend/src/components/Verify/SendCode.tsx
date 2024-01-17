import { Form, Formik, FormikHelpers } from "formik";
import Field from "ui/components/Form/Field";
import GeneralError from "ui/components/Form/GeneralError";
import { Button } from "ui/components/Theme/Styles";
import * as Yup from "yup";

interface SendCodeFormProps {
  onSubmit: (
    values: SendCodeFormValues,
    helpers: FormikHelpers<SendCodeFormValues>
  ) => void | Promise<void>;
}

export interface SendCodeFormValues {
  emailAddress: string;
}

const validationSchema = Yup.object().shape({
  emailAddress: Yup.string()
    .required("An email address is required")
    .email("That does not look like an email address"),
});

const SendCodeForm: React.FC<SendCodeFormProps> = ({ onSubmit }) => {
  return (
    <Formik
      validationSchema={validationSchema}
      initialValues={{ emailAddress: "" }}
      onSubmit={onSubmit}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-2">
          <GeneralError />
          <div>
            <label className="block">Email address</label>
            <Field
              className="w-full"
              type="text"
              name="emailAddress"
              help="Where should we send this verification code"
              data-testid="emailAddress"
            />
          </div>
          <div>
            <Button type="submit" disabled={isSubmitting}>
              Send code
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default SendCodeForm;
