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
