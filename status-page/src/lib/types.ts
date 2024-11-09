export interface IStatusPageComponent {
  id: string;
  createdAt: string;
  name: string;
}

export interface IStatusPageItem {
  id: string;
  createdAt: string;
  rank: number;
  statusPageComponent?: IStatusPageComponent;
  statusPageComponentGroup?: IStatusPageComponentGroup;
  statusPageItems?: IStatusPageItem[];
}

export interface IStatusPageComponentGroup {
  id: string;
  createdAt: string;
  name: string;
}

export interface IStatusPageResponse {
  id: string;
  createdAt: string;
  organisationId: string;
  name: string;
  pageType: string;
  publicUrl: string;
  slug: string;
  hasActiveIncident: boolean;
  statusPageItems: IStatusPageItem[];
}
