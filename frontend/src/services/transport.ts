import axios, { Method, RawAxiosRequestConfig } from "axios";
import { IErrorItem, IResponseError, IUser } from "shared-types/types";

export const getBaseUrl = (): string => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  if (!baseUrl) {
    throw new Error("BASE_URL not defined");
  }
  return baseUrl;
};

export const createAuthHeader = (authToken: string) => ({
  Authorization: `Bearer ${authToken}`,
});

export class APIError extends Error {
  errors?: IErrorItem[];
  detail: string;
  statusCode: number;
  code: string;
  constructor(
    statusCode: number,
    detail: string,
    code: string,
    errors?: IErrorItem[]
  ) {
    super(detail);
    this.detail = detail;
    this.errors = errors;
    this.statusCode = statusCode;
    this.code = code;
  }
}

interface CallConfig extends RawAxiosRequestConfig {
  user?: Required<Pick<IUser, "authToken">>;
}

export const callApi = async <T>(
  method: Method = "GET",
  url: string,
  config?: CallConfig
): Promise<T> => {
  let baseConfig: RawAxiosRequestConfig = {
    url: url,
    method: method,
    baseURL: getBaseUrl(),
  };

  // convert user object to headers
  if (config && config.user !== undefined) {
    baseConfig.headers = createAuthHeader(config.user.authToken);
    delete config.user;
  }

  baseConfig = {
    ...baseConfig,
    ...config,
  };

  try {
    const response = await axios.request<T>(baseConfig);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // 5xx errors
      if (error.response === undefined) {
        throw new APIError(
          500,
          "There was a problem contacting the server",
          "generic_error"
        );
      }
      // 4xx errors, data will be present in the response
      const applicationError = error.response.data as IResponseError;
      if (applicationError.detail || applicationError.errors) {
        throw new APIError(
          error.response.status,
          applicationError.detail,
          applicationError.code,
          applicationError.errors
        );
      }
    }

    // Unknown
    throw new APIError(
      500,
      "There was an unknown problem contacting the server",
      "generic_error"
    );
  }
};
