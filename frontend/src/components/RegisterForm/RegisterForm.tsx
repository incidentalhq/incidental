import { Form, Formik, FormikHelpers } from "formik";
import { Button } from "@/components/Theme/Styles";
import GeneralError from "@/components/Form/GeneralError";
import Field from "@/components/Form/Field";
import * as Yup from "yup";

interface Props {
  onSubmit: (
    values: RegisterFormValues,
    helpers: FormikHelpers<RegisterFormValues>
  ) => void;
}

export interface RegisterFormValues {
  name: string;
  password: string;
  emailAddress: string;
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Please enter your name"),
  emailAddress: Yup.string()
    .email("This does not look like an email address")
    .required("An email address is required"),
  password: Yup.string()
    .required("A password is required")
    .min(6, "Must be at least 8 characters"),
});

const defaultValues = {
  name: "",
  password: "",
  emailAddress: "",
};

const RegisterForm: React.FC<Props> = ({ onSubmit }) => {
  return (
    <Formik<RegisterFormValues>
      validationSchema={validationSchema}
      initialValues={defaultValues}
      onSubmit={onSubmit}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-2">
          <GeneralError />
          <div>
            <label className="block">Your name</label>
            <Field
              name="name"
              type="text"
              className="w-full"
              help="Hey stranger, tell us your name so we can get to know you"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block">Email address</label>
            <Field
              name="emailAddress"
              type="text"
              className="w-full"
              help="What you'll use to login"
            />
          </div>
          <div>
            <label className="block">Password</label>
            <Field
              name="password"
              type="password"
              placeholder="At least 8 characters"
              className="w-full"
              help="Make it memorable, but hard to guess"
            />
          </div>
          <div>
            <Button type="submit" disabled={isSubmitting}>
              Create account
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default RegisterForm;
