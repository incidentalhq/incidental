import { Form, Formik, FormikHelpers } from "formik";
import { IUser } from "shared-types/types";
import styled from "styled-components";
import { Button, Field } from "ui";
import * as Yup from "yup";

const NameRowEl = styled.div`
  display: flex;
  > div:first-child {
    margin-right: 0.5rem;
  }

  > div {
    width: 50%;
  }
`;

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Your name is required"),
  emailAddress: Yup.string().email().required("Your email address is required"),
  password: Yup.string().min(
    8,
    "Your password must be at least 8 characters long"
  ),
});

interface Props {
  onSubmit: (
    values: ProfileFormValues,
    helpers: FormikHelpers<ProfileFormValues>
  ) => void;
  user: IUser;
}

export type ProfileFormValues = {
  name: string;
  emailAddress: string;
  password: string;
};

const ProfileForm: React.FC<Props> = ({ user, onSubmit }) => {
  const defaultValues = {
    name: user.name,
    emailAddress: user.emailAddress,
    password: "",
  };
  return (
    <Formik<ProfileFormValues>
      validationSchema={validationSchema}
      initialValues={defaultValues}
      onSubmit={onSubmit}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-2">
          <NameRowEl>
            <div>
              <label>Name</label>
              <Field name="name" type="text" />
            </div>
          </NameRowEl>
          <div>
            <label>Email address</label>
            <Field name="emailAddress" type="text" />
          </div>
          <div>
            <label>Password</label>
            <Field
              name="password"
              type="password"
              placeholder="At least 8 characters"
            />
          </div>
          <div>
            <Button type="submit" disabled={isSubmitting}>
              Update profile
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default ProfileForm;
