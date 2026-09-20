import { useApiMutation, useApiQuery } from "./mutation/useApiMutation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const useBillingOverview = () => {
  return useApiQuery({
    key: "billing-overview",
    endpoint: "/owner/billing/overview",
    isPrivate: true,
  });
};

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();
  return useApiMutation({
    key: "cancel-subscription",
    endpoint: "/owner/billing/cancel",
    method: "post",
    isPrivate: true,
    options: {
      onSuccess: () => {
        toast.success("Auto-renewal has been cancelled.");
        queryClient.invalidateQueries({ queryKey: ["billing-overview"] });
      },
      onError: (error: any) => {
        const msg = error?.response?.data?.message || "Failed to cancel subscription.";
        toast.error(msg);
      },
    },
  });
};

export const useResumeSubscription = () => {
  const queryClient = useQueryClient();
  return useApiMutation({
    key: "resume-subscription",
    endpoint: "/owner/billing/resume",
    method: "post",
    isPrivate: true,
    options: {
      onSuccess: () => {
        toast.success("Auto-renewal has been resumed.");
        queryClient.invalidateQueries({ queryKey: ["billing-overview"] });
      },
      onError: (error: any) => {
        const msg = error?.response?.data?.message || "Failed to resume subscription.";
        toast.error(msg);
      },
    },
  });
};

export const useBillingPortal = () => {
  return useApiMutation({
    key: "billing-portal",
    endpoint: "/owner/billing/portal",
    method: "post",
    isPrivate: true,
    options: {
      onSuccess: (data: any) => {
        if (data?.data?.url) {
          window.location.href = data.data.url;
        } else {
          toast.error("Billing portal URL not found.");
        }
      },
      onError: (error: any) => {
        const msg = error?.response?.data?.message || "Failed to open billing portal.";
        toast.error(msg);
      },
    },
  });
};
