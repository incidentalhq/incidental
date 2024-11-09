import StatusPage from "@/components/StatusPage";
import { IStatusPageResponse } from "@/lib/types";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getStatusPage(slug: string): Promise<IStatusPageResponse> {
  const url = new URLSearchParams({ slug });
  const statusPage = await fetch(
    process.env.API_BASE_URL + `/status-pages/status?${url}`,
    {
      cache: "force-cache",
    }
  );

  return await statusPage.json();
}

export async function generateMetadata({ params }: Props) {
  const statusPage = await getStatusPage((await params).slug);

  return {
    title: statusPage.name,
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const statusPage = await getStatusPage(slug);

  return <StatusPage statusPage={statusPage} />;
}
