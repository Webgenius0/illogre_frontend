import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosRequestConfig } from "axios";
import axiosPrivate from "../axios/useAxiosPrivate";
import { axiosPublic } from "../axios/useAxiosPublic";
import { QueryOptions, ApiMethod, MutationOptions } from "../../types/api";

/**
 * HOOK FOR GET REQUESTS
 */
export function useApiQuery<TData = any, TError = any>({
  endpoint,
  isPrivate = false,
  key,
  params,
  headers,
  enabled = true,
  options,
}: QueryOptions<TData, TError>) {
  const axiosInstance = isPrivate ? axiosPrivate : axiosPublic;

  return useQuery<TData, TError>({
    queryKey: Array.isArray(key) ? [...key, params] : [key, params],
    queryFn: async () => {
      const res = await axiosInstance.get<TData>(endpoint, {
        params,
        headers,
      });
      return res.data;
    },
    enabled: Boolean(enabled),
    staleTime: 10 * 1000,
    ...options,
  });
}

/**
 * HOOK FOR POST, PUT, DELETE, PATCH
 */
export function useApiMutation<TData = any, TError = any, TVariables = any>({
  endpoint,
  method = "post",
  isPrivate = false,
  key,
  headers,
  options,
}: MutationOptions<TData, TError, TVariables>) {
  const axiosInstance = isPrivate ? axiosPrivate : axiosPublic;

  return useMutation<TData, TError, TVariables>({
    mutationKey: Array.isArray(key) ? key : [key],
    mutationFn: async (variables) => {
      const config: AxiosRequestConfig = { headers };

      // Dynamic method call: axiosInstance.post, axiosInstance.put, etc.
      const res = await axiosInstance[method as Exclude<ApiMethod, "get">](
        endpoint,
        variables,
        config,
      );
      return res?.data;
    },
    ...options,
  });
}
