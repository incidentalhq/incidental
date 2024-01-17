export type ILoggedInUser = Required<IUser>;

export interface IErrorItem {
  loc: string[];
  type: string;
  msg: string;
}

export interface IResponseError {
  detail: string;
  errors: IErrorItem[];
  code: string;
}

export interface PaginatedResults<T> {
  total: number;
  page: number;
  size: number;
  items: Array<T>;
}

export interface IOrganisation {
  id: string;
}

export interface IWorld {
  user: IUser;
  organisation: IOrganisation;
}

export interface IUser {
  publicId: string;
  authToken?: string;
  name: string;
  emailAddress: string;
  isSuperAdmin?: boolean;
}

export type IPublicUser = Pick<IUser, "publicId" | "emailAddress" | "name">;
