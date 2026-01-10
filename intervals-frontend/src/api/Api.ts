/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface DsInterval {
  description?: string;
  id?: number;
  isDelete?: boolean;
  photo?: string;
  title?: string;
  tone?: number;
}

export interface DsIntervalFiltersInfo {
  title?: string;
  tone_max?: number;
  tone_min?: number;
}

export interface DsPaginatedIntervalsResponse {
  data?: DsInterval[];
  filters?: DsIntervalFiltersInfo;
  pagination?: DsPaginationInfo;
  stats?: DsQueryStats;
}

export interface DsPaginationInfo {
  page?: number;
  page_size?: number;
  total?: number;
  total_pages?: number;
}

export interface DsQueryStats {
  execution_time_ms?: number;
  index_used?: boolean;
  query_plan?: string;
}

export interface DsUsers {
  id?: number;
  is_moderator?: boolean;
  login?: string;
}

export interface HandlerAddIntervalToCompositionRequest {
  /** @min 1 */
  amount: number;
  interval_id: number;
}

export interface HandlerCalculationResultRequest {
  api_key: string;
  composition_id: number;
  result: string;
}

export interface HandlerCartInfoResponse {
  composition_id?: number;
  item_count?: number;
}

export interface HandlerCreateIntervalRequest {
  description: string;
  title: string;
  tone: number;
}

export interface HandlerLoginRequest {
  login: string;
  password: string;
}

export interface HandlerRegisterRequest {
  is_moderator?: boolean;
  login: string;
  password: string;
}

export interface HandlerRemoveFromCompositionRequest {
  composition_id: number;
  interval_id: number;
}

export interface HandlerStartCalculationRequest {
  composition_id: number;
}

export interface HandlerUpdateCompositionIntervalRequest {
  /** @min 1 */
  amount: number;
  composition_id: number;
  interval_id: number;
}

export interface HandlerUpdateCompositionRequest {
  belonging?: string;
  title?: string;
}

export interface HandlerUpdateIntervalRequest {
  description?: string;
  title?: string;
  tone?: number;
}

export interface HandlerUpdateProfileRequest {
  login?: string;
  password?: string;
}

export interface CompositionsListParams {
  /** Filter by status */
  status?: string;
  /** Filter by date from (YYYY-MM-DD) */
  date_from?: string;
  /** Filter by date to (YYYY-MM-DD) */
  date_to?: string;
}

export interface CompositionsDetailParams {
  /** Composition ID */
  id: number;
}

export interface CompositionsUpdateParams {
  /** Composition ID */
  id: number;
}

export interface CompositionsDeleteParams {
  /** Composition ID */
  id: number;
}

export interface CompleteUpdateParams {
  /** Composition ID */
  id: number;
}

export interface FormUpdateParams {
  /** Composition ID */
  id: number;
}

export interface RejectUpdateParams {
  /** Composition ID */
  id: number;
}

export interface IntervalsListParams {
  /** Filter by title */
  title?: string;
  /** Filter by minimum tone */
  tone_min?: number;
  /** Filter by maximum tone */
  tone_max?: number;
  /**
   * Page number (default: 1)
   * @min 1
   * @default 1
   */
  page?: number;
  /**
   * Page size (default: 8, maximum: 8)
   * @min 1
   * @max 8
   * @default 8
   */
  page_size?: number;
}

export interface IntervalsDetailParams {
  /** Interval ID */
  id: number;
}

export interface IntervalsUpdateParams {
  /** Interval ID */
  id: number;
}

export interface IntervalsDeleteParams {
  /** Interval ID */
  id: number;
}

export interface ImageCreatePayload {
  /** Interval image */
  image: File;
}

export interface ImageCreateParams {
  /** Interval ID */
  id: number;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title Composition Service API
 * @version 1.0
 * @license MIT (https://opensource.org/licenses/MIT)
 * @contact API Support <support@composition-service.com> (http://localhost:8080)
 *
 * API for music composition service with JWT authentication and role-based access control
 */
export class Api<SecurityDataType extends unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  compositionIntervals = {
    /**
     * @description Update interval amount in composition (authenticated users only)
     *
     * @tags CompositionIntervals
     * @name CompositionIntervalsUpdate
     * @summary Update interval amount in composition
     * @request PUT:/composition-intervals
     * @secure
     * @response `200` `Record<string,string>` OK
     * @response `400` `Record<string,string>` Bad Request
     * @response `401` `Record<string,string>` Unauthorized
     * @response `500` `Record<string,string>` Internal Server Error
     */
    compositionIntervalsUpdate: (
      request: HandlerUpdateCompositionIntervalRequest,
      params: RequestParams = {},
    ) =>
      this.http.request<Record<string, string>, Record<string, string>>({
        path: `/composition-intervals`,
        method: "PUT",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Remove interval from composition (authenticated users only)
     *
     * @tags CompositionIntervals
     * @name CompositionIntervalsDelete
     * @summary Remove interval from composition
     * @request DELETE:/composition-intervals
     * @secure
     * @response `200` `Record<string,string>` OK
     * @response `400` `Record<string,string>` Bad Request
     * @response `401` `Record<string,string>` Unauthorized
     * @response `500` `Record<string,string>` Internal Server Error
     */
    compositionIntervalsDelete: (
      request: HandlerRemoveFromCompositionRequest,
      params: RequestParams = {},
    ) =>
      this.http.request<Record<string, string>, Record<string, string>>({
        path: `/composition-intervals`,
        method: "DELETE",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  compositions = {
    /**
     * @description Get list of compositions with filtering (authenticated users only)
     *
     * @tags Compositions
     * @name CompositionsList
     * @summary Get compositions list
     * @request GET:/compositions
     * @secure
     * @response `200` `(Record<string,any>)[]` OK
     * @response `401` `Record<string,string>` Unauthorized
     * @response `500` `Record<string,string>` Internal Server Error
     */
    compositionsList: (
      query: CompositionsListParams,
      params: RequestParams = {},
    ) =>
      this.http.request<Record<string, any>[], Record<string, string>>({
        path: `/compositions`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Get user's draft composition with item count
     *
     * @tags Compositions
     * @name CompCartList
     * @summary Get composition cart
     * @request GET:/compositions/comp-cart
     * @secure
     * @response `200` `HandlerCartInfoResponse` OK
     * @response `401` `Record<string,string>` Unauthorized
     * @response `500` `Record<string,string>` Internal Server Error
     */
    compCartList: (params: RequestParams = {}) =>
      this.http.request<HandlerCartInfoResponse, Record<string, string>>({
        path: `/compositions/comp-cart`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Принимает результат расчёта от Django-сервиса
     *
     * @tags Compositions
     * @name ReceiveResultCreate
     * @summary Получить результат расчёта от асинхронного сервиса
     * @request POST:/compositions/receive-result
     * @response `200` `Record<string,string>` OK
     * @response `400` `Record<string,string>` Bad Request
     * @response `401` `Record<string,string>` Unauthorized
     * @response `404` `Record<string,string>` Not Found
     */
    receiveResultCreate: (
      request: HandlerCalculationResultRequest,
      params: RequestParams = {},
    ) =>
      this.http.request<Record<string, string>, Record<string, string>>({
        path: `/compositions/receive-result`,
        method: "POST",
        body: request,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Start async calculation of composition belonging (moderator only)
     *
     * @tags Compositions
     * @name StartCalculationCreate
     * @summary Start async calculation
     * @request POST:/compositions/start-calculation
     * @secure
     * @response `200` `Record<string,string>` OK
     * @response `400` `Record<string,string>` Bad Request
     * @response `401` `Record<string,string>` Unauthorized
     * @response `403` `Record<string,string>` Forbidden
     * @response `404` `Record<string,string>` Not Found
     */
    startCalculationCreate: (
      request: HandlerStartCalculationRequest,
      params: RequestParams = {},
    ) =>
      this.http.request<Record<string, string>, Record<string, string>>({
        path: `/compositions/start-calculation`,
        method: "POST",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Get composition details with intervals
     *
     * @tags Compositions
     * @name CompositionsDetail
     * @summary Get composition details
     * @request GET:/compositions/{id}
     * @secure
     * @response `200` `Record<string,any>` OK
     * @response `400` `Record<string,string>` Bad Request
     * @response `401` `Record<string,string>` Unauthorized
     * @response `403` `Record<string,string>` Forbidden
     * @response `404` `Record<string,string>` Not Found
     */
    compositionsDetail: (
      { id, ...query }: CompositionsDetailParams,
      params: RequestParams = {},
    ) =>
      this.http.request<Record<string, any>, Record<string, string>>({
        path: `/compositions/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Update composition fields
     *
     * @tags Compositions
     * @name CompositionsUpdate
     * @summary Update composition fields
     * @request PUT:/compositions/{id}
     * @secure
     * @response `200` `Record<string,string>` OK
     * @response `400` `Record<string,string>` Bad Request
     * @response `500` `Record<string,string>` Internal Server Error
     */
    compositionsUpdate: (
      { id, ...query }: CompositionsUpdateParams,
      request: HandlerUpdateCompositionRequest,
      params: RequestParams = {},
    ) =>
      this.http.request<Record<string, string>, Record<string, string>>({
        path: `/compositions/${id}`,
        method: "PUT",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Delete composition (creator only)
     *
     * @tags Compositions
     * @name CompositionsDelete
     * @summary Delete composition
     * @request DELETE:/compositions/{id}
     * @secure
     * @response `200` `Record<string,string>` OK
     * @response `400` `Record<string,string>` Bad Request
     * @response `401` `Record<string,string>` Unauthorized
     * @response `500` `Record<string,string>` Internal Server Error
     */
    compositionsDelete: (
      { id, ...query }: CompositionsDeleteParams,
      params: RequestParams = {},
    ) =>
      this.http.request<Record<string, string>, Record<string, string>>({
        path: `/compositions/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * @description Complete composition (moderator only)
     *
     * @tags Compositions
     * @name CompleteUpdate
     * @summary Complete composition
     * @request PUT:/compositions/{id}/complete
     * @secure
     * @response `200` `Record<string,string>` OK
     * @response `400` `Record<string,string>` Bad Request
     * @response `401` `Record<string,string>` Unauthorized
     * @response `403` `Record<string,string>` Forbidden
     */
    completeUpdate: (
      { id, ...query }: CompleteUpdateParams,
      params: RequestParams = {},
    ) =>
      this.http.request<Record<string, string>, Record<string, string>>({
        path: `/compositions/${id}/complete`,
        method: "PUT",
        secure: true,
        ...params,
      }),

    /**
     * @description Form composition from draft status (creator only)
     *
     * @tags Compositions
     * @name FormUpdate
     * @summary Form composition
     * @request PUT:/compositions/{id}/form
     * @secure
     * @response `200` `Record<string,string>` OK
     * @response `400` `Record<string,string>` Bad Request
     * @response `401` `Record<string,string>` Unauthorized
     */
    formUpdate: (
      { id, ...query }: FormUpdateParams,
      params: RequestParams = {},
    ) =>
      this.http.request<Record<string, string>, Record<string, string>>({
        path: `/compositions/${id}/form`,
        method: "PUT",
        secure: true,
        ...params,
      }),

    /**
     * @description Reject composition (moderator only)
     *
     * @tags Compositions
     * @name RejectUpdate
     * @summary Reject composition
     * @request PUT:/compositions/{id}/reject
     * @secure
     * @response `200` `Record<string,string>` OK
     * @response `400` `Record<string,string>` Bad Request
     * @response `401` `Record<string,string>` Unauthorized
     * @response `403` `Record<string,string>` Forbidden
     */
    rejectUpdate: (
      { id, ...query }: RejectUpdateParams,
      params: RequestParams = {},
    ) =>
      this.http.request<Record<string, string>, Record<string, string>>({
        path: `/compositions/${id}/reject`,
        method: "PUT",
        secure: true,
        ...params,
      }),
  };
  intervals = {
    /**
     * @description Get paginated list of intervals with filtering. Always returns paginated response.
     *
     * @tags Intervals
     * @name IntervalsList
     * @summary Get intervals list with pagination
     * @request GET:/intervals
     * @response `200` `DsPaginatedIntervalsResponse` OK
     * @response `400` `Record<string,string>` Bad Request
     * @response `500` `Record<string,string>` Internal Server Error
     */
    intervalsList: (query: IntervalsListParams, params: RequestParams = {}) =>
      this.http.request<DsPaginatedIntervalsResponse, Record<string, string>>({
        path: `/intervals`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Create new interval (moderator only)
     *
     * @tags Intervals
     * @name IntervalsCreate
     * @summary Create interval
     * @request POST:/intervals
     * @secure
     * @response `201` `DsInterval` Created
     * @response `400` `Record<string,string>` Bad Request
     * @response `401` `Record<string,string>` Unauthorized
     * @response `403` `Record<string,string>` Forbidden
     * @response `500` `Record<string,string>` Internal Server Error
     */
    intervalsCreate: (
      request: HandlerCreateIntervalRequest,
      params: RequestParams = {},
    ) =>
      this.http.request<DsInterval, Record<string, string>>({
        path: `/intervals`,
        method: "POST",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Add interval to draft composition
     *
     * @tags Intervals
     * @name AddToCompositionCreate
     * @summary Add interval to composition
     * @request POST:/intervals/add-to-composition
     * @secure
     * @response `200` `Record<string,string>` OK
     * @response `400` `Record<string,string>` Bad Request
     * @response `401` `Record<string,string>` Unauthorized
     * @response `500` `Record<string,string>` Internal Server Error
     */
    addToCompositionCreate: (
      request: HandlerAddIntervalToCompositionRequest,
      params: RequestParams = {},
    ) =>
      this.http.request<Record<string, string>, Record<string, string>>({
        path: `/intervals/add-to-composition`,
        method: "POST",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Get interval details by ID
     *
     * @tags Intervals
     * @name IntervalsDetail
     * @summary Get interval details
     * @request GET:/intervals/{id}
     * @response `200` `DsInterval` OK
     * @response `400` `Record<string,string>` Bad Request
     * @response `404` `Record<string,string>` Not Found
     */
    intervalsDetail: (
      { id, ...query }: IntervalsDetailParams,
      params: RequestParams = {},
    ) =>
      this.http.request<DsInterval, Record<string, string>>({
        path: `/intervals/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Update interval (moderator only)
     *
     * @tags Intervals
     * @name IntervalsUpdate
     * @summary Update interval
     * @request PUT:/intervals/{id}
     * @secure
     * @response `200` `Record<string,string>` OK
     * @response `400` `Record<string,string>` Bad Request
     * @response `401` `Record<string,string>` Unauthorized
     * @response `403` `Record<string,string>` Forbidden
     * @response `500` `Record<string,string>` Internal Server Error
     */
    intervalsUpdate: (
      { id, ...query }: IntervalsUpdateParams,
      request: HandlerUpdateIntervalRequest,
      params: RequestParams = {},
    ) =>
      this.http.request<Record<string, string>, Record<string, string>>({
        path: `/intervals/${id}`,
        method: "PUT",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Delete interval (moderator only)
     *
     * @tags Intervals
     * @name IntervalsDelete
     * @summary Delete interval
     * @request DELETE:/intervals/{id}
     * @secure
     * @response `200` `Record<string,string>` OK
     * @response `400` `Record<string,string>` Bad Request
     * @response `401` `Record<string,string>` Unauthorized
     * @response `403` `Record<string,string>` Forbidden
     * @response `500` `Record<string,string>` Internal Server Error
     */
    intervalsDelete: (
      { id, ...query }: IntervalsDeleteParams,
      params: RequestParams = {},
    ) =>
      this.http.request<Record<string, string>, Record<string, string>>({
        path: `/intervals/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * @description Update interval photo (moderator only)
     *
     * @tags Intervals
     * @name ImageCreate
     * @summary Update interval photo
     * @request POST:/intervals/{id}/image
     * @secure
     * @response `200` `Record<string,string>` OK
     * @response `400` `Record<string,string>` Bad Request
     * @response `401` `Record<string,string>` Unauthorized
     * @response `403` `Record<string,string>` Forbidden
     * @response `500` `Record<string,string>` Internal Server Error
     */
    imageCreate: (
      { id, ...query }: ImageCreateParams,
      data: ImageCreatePayload,
      params: RequestParams = {},
    ) =>
      this.http.request<Record<string, string>, Record<string, string>>({
        path: `/intervals/${id}/image`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),
  };
  users = {
    /**
     * @description Authenticate user and return JWT tokens
     *
     * @tags Users
     * @name LoginCreate
     * @summary User login
     * @request POST:/users/login
     * @response `200` `Record<string,any>` OK
     * @response `400` `Record<string,string>` Bad Request
     * @response `401` `Record<string,string>` Unauthorized
     */
    loginCreate: (request: HandlerLoginRequest, params: RequestParams = {}) =>
      this.http.request<Record<string, any>, Record<string, string>>({
        path: `/users/login`,
        method: "POST",
        body: request,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Invalidate user token
     *
     * @tags Users
     * @name LogoutCreate
     * @summary User logout
     * @request POST:/users/logout
     * @secure
     * @response `200` `Record<string,string>` OK
     * @response `400` `Record<string,string>` Bad Request
     * @response `500` `Record<string,string>` Internal Server Error
     */
    logoutCreate: (params: RequestParams = {}) =>
      this.http.request<Record<string, string>, Record<string, string>>({
        path: `/users/logout`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * @description Get authenticated user's profile information
     *
     * @tags Users
     * @name ProfileList
     * @summary Get user profile
     * @request GET:/users/profile
     * @secure
     * @response `200` `DsUsers` OK
     * @response `401` `Record<string,string>` Unauthorized
     * @response `404` `Record<string,string>` Not Found
     */
    profileList: (params: RequestParams = {}) =>
      this.http.request<DsUsers, Record<string, string>>({
        path: `/users/profile`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Update authenticated user's profile information
     *
     * @tags Users
     * @name ProfileUpdate
     * @summary Update user profile
     * @request PUT:/users/profile
     * @secure
     * @response `200` `Record<string,string>` OK
     * @response `400` `Record<string,string>` Bad Request
     * @response `401` `Record<string,string>` Unauthorized
     */
    profileUpdate: (
      request: HandlerUpdateProfileRequest,
      params: RequestParams = {},
    ) =>
      this.http.request<Record<string, string>, Record<string, string>>({
        path: `/users/profile`,
        method: "PUT",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Create a new user account
     *
     * @tags Users
     * @name RegisterCreate
     * @summary Register new user
     * @request POST:/users/register
     * @response `201` `Record<string,any>` Created
     * @response `400` `Record<string,string>` Bad Request
     * @response `500` `Record<string,string>` Internal Server Error
     */
    registerCreate: (
      request: HandlerRegisterRequest,
      params: RequestParams = {},
    ) =>
      this.http.request<Record<string, any>, Record<string, string>>({
        path: `/users/register`,
        method: "POST",
        body: request,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}
