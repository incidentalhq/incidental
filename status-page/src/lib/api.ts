import { IStatusPageIncident, IStatusPageResponse } from "@/types/models";

export class PageNotFoundError extends Error {}

export async function getStatusPage({
  domain,
  slug,
}: {
  domain?: string;
  slug?: string;
}): Promise<IStatusPageResponse> {
  const url = new URLSearchParams();
  if (domain) {
    url.append("domain", domain);
  }
  if (slug) {
    url.append("slug", slug);
  }
  const response = await fetch(
    process.env.API_BASE_URL + `/status-pages/public-status?${url}`
  );
  if (!response.ok) {
    if (response.status === 404) {
      throw new PageNotFoundError();
    }
    throw new Error("Failed to fetch status page");
  }

  return await response.json();
}

export const getIncident = async (id: string): Promise<IStatusPageIncident> => {
  const res = await fetch(
    `${process.env.API_BASE_URL}/status-pages/public-incident/${id}`
  );
  if (!res.ok) {
    if (res.status === 404) {
      throw new PageNotFoundError();
    }
    throw new Error("Failed to fetch incident");
  }
  return await res.json();
};
