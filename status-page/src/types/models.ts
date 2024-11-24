import { ComponentStatus, StatusPageIncidentStatus } from "./enums";

type Brand<K, T> = K & { __brand: T };

export type ModelID = Brand<string, "ModelPK">;

interface IModel {
  id: ModelID;
  createdAt: string;
}

export interface IPublicUser extends IModel {
  name: string;
}

export interface IStatusPage extends IModel {
  name: string;
  pageType: string;
  publicUrl: string;
  slug: string;
  statusPageItems: Array<IStatusPageItem>;
  publishedAt: string;
}

export interface IStatusPageItem extends IModel {
  rank: number;
  statusPageComponent?: IStatusPageComponent;
  statusPageComponentGroup?: IStatusPageComponentGroup;
  statusPageItems?: Array<IStatusPageItem>;
}

export interface IStatusPageComponent extends IModel {
  name: string;
}

export interface IStatusPageComponentGroup extends IModel {
  name: string;
}

export interface IStatusPageIncident extends IModel {
  name: string;
  status: StatusPageIncidentStatus;
  incidentUpdates: Array<IStatusPageIncidentUpdate>;
  statusPage: Pick<IStatusPage, "name" | "id">;
  creator: IPublicUser;
  componentsAffected: Array<IStatusPageComponentAffected>;
  publishedAt: string;
}

export interface IStatusPageComponentAffected extends IModel {
  statusPageComponent: IStatusPageComponent;
  status: ComponentStatus;
}

export interface IStatusPageComponentUpdated extends IModel {
  statusPageComponent: IStatusPageComponent;
  status: ComponentStatus;
}

export interface IStatusPageIncidentUpdate extends IModel {
  status: StatusPageIncidentStatus;
  message: string;
  componentUpdates: Array<IStatusPageComponentUpdated>;
  creator: IPublicUser;
}

export interface IStatusPageComponentUpdate extends IModel {
  statusPageComponent: IStatusPageComponent;
  status: ComponentStatus;
}

export interface IStatusPageComponentEvent extends IModel {
  statusPageComponent: IStatusPageComponent;
  statusPageIncident: IRelatedStatusPageIncident;
  status: ComponentStatus;
  startedAt: string;
  endedAt: string | null;
}

export interface IStatusPageResponse {
  statusPage: IStatusPage;
  events: IStatusPageComponentEvent[];
  incidents: IStatusPageIncident[];
  uptimes: Record<ModelID, number>;
}

export interface IRelatedStatusPageIncident extends IModel {
  name: string;
}
