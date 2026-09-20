import { useApiMutation, useApiQuery } from "./mutation/useApiMutation";

export const useOwnerOverview = () => {
  return useApiQuery({
    key: "owner-overview",
    endpoint: "/owner/dashboard/overview",
    isPrivate: true,
  });
};

export const useConnectShopify = () => {
  return useApiMutation<
    {
      message: string;
      url: string;
    },
    any,
    { shop: string; api_key?: string; api_secret?: string }
  >({
    key: "connect-shopify",
    endpoint: "/owner/shopify/install",
    method: "post",
    isPrivate: true,
  });
};

export const useIntegrations = () => {
  return useApiQuery<{ success: boolean; data: any[]; message: string }>({
    key: "integrations",
    endpoint: "/owner/integrations",
    isPrivate: true,
  });
};

export const useConnectIntegration = () => {
  return useApiMutation<{ message: string }, any, any>({
    key: "connect-integration",
    endpoint: "/owner/integrations/connect",
    method: "post",
    isPrivate: true,
  });
};

import { useMutation } from "@tanstack/react-query";
import axiosPrivate from "./axios/useAxiosPrivate";

export const useDisconnectIntegration = () => {
  return useMutation<{ message: string }, any, string>({
    mutationFn: async (id: string) => {
      const res = await axiosPrivate.delete(`/owner/integrations/${id}`);
      return res.data;
    },
  });
};

export const useFetchEmails = () => {
  return useApiMutation<{ message: string; queued: boolean }, any, void>({
    key: "fetch-emails",
    endpoint: "/owner/integrations/email/fetch",
    method: "post",
    isPrivate: true,
  });
};
