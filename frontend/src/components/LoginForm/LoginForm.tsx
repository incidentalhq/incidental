import { Form, Formik, FormikHelpers } from "formik";
import { Button } from "@/components/Theme/Styles";
import GeneralError from "@/components/Form/GeneralError";
import Field from "@/components/Form/Field";
import * as Yup from "yup";

interface LoginFormProps {
  onSubmit: (
    values: LoginFormValues,
    helpers: FormikHelpers<LoginFormValues>
  ) => void | Promise<void>;
}

export interface LoginFormValues {
  emailAddress: string;
  password: string;
}

const names = [
  "Bruce Wayne",
  "Peter Parker",
  "Tony Stark",
  "Steve Rogers",
  "Bruce Banner",
  "Clark Kent",
];

function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const validationSchema = Yup.object().shape({
  emailAddress: Yup.string()
    .required("An email address is required")
    .email("That does not look like an email address"),
  password: Yup.string()
    .required("A password is required")
    .min(8, "Your password must be at least 8 characters long"),
});
const placeholder =
  names[getRandomInt(1, names.length - 1)].toLowerCase().replace(" ", ".") +
  "@gmail.com";

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  return (
    <Formik
      validationSchema={validationSchema}
      initialValues={{ emailAddress: "", password: "" }}
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
              placeholder={placeholder}
              help="Who are you again?"
              data-testid="emailAddress"
            />
          </div>
          <div>
            <label className="block">Password</label>
            <Field
              className="w-full"
              type="password"
              name="password"
              help="Your super secret password, hope you didn't forget it"
              data-testid="password"
            />
          </div>
          <div>
            <Button type="submit" disabled={isSubmitting}>
              Login
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default LoginForm;
