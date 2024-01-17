import { Form, Formik, FormikHelpers } from "formik";
import { ITeam } from "shared-types/models";
import Field from "ui/components/Form/Field";
import GeneralError from "ui/components/Form/GeneralError";
import { Button } from "ui/components/Theme/Styles";
import * as Yup from "yup";

interface Props {
  team?: ITeam;
  onSubmit: (
    values: TeamFormValues,
    helpers: FormikHelpers<TeamFormValues>
  ) => void;
}

export type TeamFormValues = {
  name: string;
};

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Enter a name of this team"),
});

const TeamForm: React.FC<Props> = ({ onSubmit, team }) => {
  const defaultValues = {
    name: team ? team.name : "",
  };

  return (
    <Formik<TeamFormValues>
      validationSchema={validationSchema}
      initialValues={defaultValues}
      onSubmit={onSubmit}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-2">
          <GeneralError />
          <div>
            <label className="block">Name</label>
            <Field
              name="name"
              type="text"
              className="w-full"
              help="A name for this team"
            />
          </div>
          <div>
            <Button type="submit" disabled={isSubmitting}>
              {team ? "Update team" : "Create team"}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default TeamForm;
