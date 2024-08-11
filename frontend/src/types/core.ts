export enum ErrorCodes {
  OVER_QUOTA = 'OVER_QUOTA',
  MODEL_NOT_FOUND = 'MODEL_NOT_FOUND',
  NOT_ALLOWED = 'NOT_ALLOWED',
  EXCEEDED_MAX_LOGIN_ATTEMPTS = 'EXCEEDED_MAX_LOGIN_ATTEMPTS',
  ACCOUNT_NOT_VERIFIED = 'ACCOUNT_NOT_VERIFIED',
  INCORRECT_CODE = 'INCORRECT_CODE',
  SLACK_API_ERROR = 'SLACK_API_ERROR',
  INVALID_AUTH_TOKEN = 'INVALID_AUTH_TOKEN',
  UNKNOWN = 'UNKNOWN',

  // client side codes
  NETWORK = 'NETWORK'
}

export interface IErrorItem {
  loc: string[]
  type: string
  msg: string
}

export interface IResponseError {
  detail: string
  errors: IErrorItem[]
  code: ErrorCodes
}

export interface PaginatedResults<T> {
  total: number
  page: number
  size: number
  items: Array<T>
}
