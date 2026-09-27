import { UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";

export type ApiMethod = "get" | "post" | "put" | "delete" | "patch";

export interface BaseApiOptions {
  endpoint: string;
  isPrivate?: boolean;
  key: string | unknown[];
  headers?: Record<string, string>;
}

export interface QueryOptions<TData = any, TError = any>
  extends BaseApiOptions {
  params?: Record<string, any>;
  enabled?: boolean;
  options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">;
  refreshInterval?: number;
}

export interface MutationOptions<
  TData = any,
  TError = any,
  TVariables = any,
> extends BaseApiOptions {
  method?: Exclude<ApiMethod, "get">;
  options?: Omit<
    UseMutationOptions<TData, TError, TVariables>,
    "mutationKey" | "mutationFn"
  >;
}
