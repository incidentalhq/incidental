import type { Metadata } from "next";
import { headers } from "next/headers";

import "@/styles/reset.css";
import "@/styles/index.css";
import "@/styles/variables.css";

import StyledComponentsRegistry from "@/lib/registry";
import Layout from "@/components/Layout";
import StatusPageProvider from "./StatusPageProvider";
import { getStatusPage } from "@/lib/api";
import { IStatusPageResponse } from "@/types/models";

export const metadata: Metadata = {
  title: "",
  description: "",
};

async function getDomain() {
  const requestHeaders = await headers();
  return requestHeaders.get("x-forwarded-host");
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let statusPageResponse: IStatusPageResponse | null = null;
  const domain = await getDomain();

  if (!domain) {
    return <p>Domain not found</p>;
  }

  try {
    statusPageResponse = await getStatusPage({ domain });
  } catch (error) {
    console.error(error);
  }

  if (!statusPageResponse) {
    return <p>Domain not found</p>;
  }

  return (
    <html lang="en">
      <body>
        <StyledComponentsRegistry>
          <StatusPageProvider statusPage={statusPageResponse.statusPage}>
            <Layout>{children}</Layout>
          </StatusPageProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
