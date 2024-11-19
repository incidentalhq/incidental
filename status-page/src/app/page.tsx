import StatusPage from "@/components/StatusPage";
import { IStatusPageResponse } from "@/types/models";
import { headers } from "next/headers";

async function getDomain() {
  const requestHeaders = await headers();
  return requestHeaders.get("x-forwarded-host");
}

async function getStatusPage(domain: string): Promise<IStatusPageResponse> {
  const url = new URLSearchParams({ domain });
  const response = await fetch(
    process.env.API_BASE_URL + `/status-pages/status?${url}`
  );

  if (response.status !== 200) {
    throw new Error("Failed to fetch status page");
  }

  return await response.json();
}

export async function generateMetadata() {
  const domain = await getDomain();
  if (!domain) {
    return {};
  }

  try {
    const statusPageResponse = await getStatusPage(domain);
    return {
      title: statusPageResponse.statusPage.name,
    };
  } catch (error) {
    console.error(error);
  }
  return {
    title: "Status Page",
  };
}

export default async function Home() {
  const domain = await getDomain();
  if (!domain) {
    return null;
  }
  console.log(domain);
  try {
    const statusPage = await getStatusPage(domain);
    return <StatusPage statusPageResponse={statusPage} />;
  } catch (error) {
    return <p>This domain does not seem to be setup</p>;
  }
}
