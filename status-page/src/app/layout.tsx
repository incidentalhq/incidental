import type { Metadata } from "next";

import "@/styles/reset.css";
import "@/styles/index.css";
import "@/styles/variables.css";

import StyledComponentsRegistry from "@/lib/registry";
import Layout from "@/components/Layout";

export const metadata: Metadata = {
  title: "",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <StyledComponentsRegistry>
          <Layout>{children}</Layout>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
