import { UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";

export type ApiMethod = "get" | "post" | "put" | "delete" | "patch";

export interface BaseApiOptions {
  endpoint: string;
  isPrivate?: boolean;
  key: string | any[];
  headers?: Record<string, string>;
}

export interface QueryOptions<TData, TError> extends BaseApiOptions {
  params?: Record<string, any>;
  enabled?: boolean;
  options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">;
  refreshInterval?: number;
}

export interface MutationOptions<
  TData,
  TError,
  TVariables,
> extends BaseApiOptions {
  method?: Exclude<ApiMethod, "get">;
  options?: Omit<
    UseMutationOptions<TData, TError, TVariables>,
    "mutationKey" | "mutationFn"
  >;
}
