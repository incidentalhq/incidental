import StatusPage from "@/components/StatusPage";
import { getStatusPage, PageNotFoundError } from "@/lib/api";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const slug = (await params).slug;

  try {
    const statusPageResponse = await getStatusPage({ slug });
    return {
      title: statusPageResponse.statusPage.name,
    };
  } catch (error) {
    if (error instanceof PageNotFoundError) {
      return {
        title: "Status Page Not Found",
      };
    }
    return {
      title: "Status Page",
    };
  }
}

export default async function Home(props: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await props.params).slug;
  try {
    const statusPage = await getStatusPage({ slug });
    return <StatusPage statusPageResponse={statusPage} />;
  } catch (error) {
    if (error instanceof PageNotFoundError) {
      return <p>This domain does not seem to be setup</p>;
    }
    return <p>Something went wrong</p>;
  }
}
