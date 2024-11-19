import StatusPage from "@/components/StatusPage";
import { IStatusPageResponse } from "@/types/models";
import { headers } from "next/headers";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getStatusPage(slug: string): Promise<IStatusPageResponse> {
  const url = new URLSearchParams({ slug });
  const statusPage = await fetch(
    process.env.API_BASE_URL + `/status-pages/status?${url}`
  );

  return await statusPage.json();
}

export async function generateMetadata({ params }: Props) {
  const statusPageResponse = await getStatusPage((await params).slug);

  return {
    title: statusPageResponse.statusPage.name,
  };
}

export default async function Home(props: {
  params: Promise<{ slug: string }>;
}) {
  const header = await headers();
  console.log(header.get("x-forwarded-host"));
  const slug = (await props.params).slug;
  const statusPage = await getStatusPage(slug);

  return <StatusPage statusPageResponse={statusPage} />;
}
