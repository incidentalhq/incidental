import StatusPage from "@/components/StatusPage";
import { getStatusPage } from "@/lib/api";
import { headers } from "next/headers";

async function getDomain() {
  const requestHeaders = await headers();
  return requestHeaders.get("x-forwarded-host");
}

export async function generateMetadata() {
  const domain = await getDomain();
  if (!domain) {
    return {};
  }

  try {
    const statusPageResponse = await getStatusPage({ domain });
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
  try {
    const statusPage = await getStatusPage({ domain });
    return <StatusPage statusPageResponse={statusPage} />;
  } catch {
    return <p>This domain does not seem to be setup</p>;
  }
}
