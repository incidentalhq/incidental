import IncidentPage from "@/components/IncidentPage";
import { getIncident } from "@/lib/api";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const incident = await getIncident((await params).slug);
  return {
    title: `Incident - ${incident.name}`,
  };
}

export default async function IncidentPageRoute(props: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await props.params).slug;
  const incident = await getIncident(slug);

  return <IncidentPage incident={incident} />;
}
