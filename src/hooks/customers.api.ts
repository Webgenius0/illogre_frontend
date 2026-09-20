import { useApiMutation, useApiQuery } from "./mutation/useApiMutation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSelector } from "react-redux";

/**
 * Hook to fetch all customers for the owner
 */
export const useCustomers = (params?: { search?: string, page?: number, per_page?: string | number }) => {
  const { user } = useSelector((state: any) => state.auth);
  const prefix = user?.role === "Support Manager" ? "/manager" : user?.role === "Support Agent" ? "/agent" : "/owner";

  return useApiQuery({
    key: ["owner-customers", params],
    endpoint: `${prefix}/customers`,
    isPrivate: true,
    params,
  });
};

/**
 * Hook to fetch specific customer details
 */
export const useCustomerDetails = (id: string | number | null) => {
  const { user } = useSelector((state: any) => state.auth);
  const prefix = user?.role === "Support Manager" ? "/manager" : user?.role === "Support Agent" ? "/agent" : "/owner";

  return useApiQuery({
    key: ["customer-details", id],
    endpoint: `${prefix}/customers/${id}`,
    isPrivate: true,
    enabled: !!id,
  });
};

/**
 * Hook to create a new customer
 */
export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  const { user } = useSelector((state: any) => state.auth);
  const prefix = user?.role === "Support Manager" ? "/manager" : "/owner";

  return useApiMutation({
    key: "create-customer",
    method: "post",
    endpoint: `${prefix}/customers`,
    isPrivate: true,
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["owner-customers"] });
      },
      onError: (error: AxiosError<any>) => {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to create customer.";
        toast.error(errorMessage);
      },
    },
  });
};

/**
 * Hook to update an existing customer
 */
export const useUpdateCustomer = (id: string | number | null) => {
  const queryClient = useQueryClient();
  const { user } = useSelector((state: any) => state.auth);
  const prefix = user?.role === "Support Manager" ? "/manager" : "/owner";

  return useApiMutation({
    key: ["update-customer", id],
    method: "patch",
    endpoint: `${prefix}/customers/${id}`,
    isPrivate: true,
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["owner-customers"] });
        if (id) {
          queryClient.invalidateQueries({ queryKey: ["customer-details", id] });
        }
      },
      onError: (error: AxiosError<any>) => {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to update customer.";
        toast.error(errorMessage);
      },
    },
  });
};

/**
 * Hook to delete a customer
 */
export const useDeleteCustomer = (id: string | number | null) => {
  const queryClient = useQueryClient();
  const { user } = useSelector((state: any) => state.auth);
  const prefix = user?.role === "Support Manager" ? "/manager" : "/owner";

  return useApiMutation({
    key: ["delete-customer", id],
    method: "delete",
    endpoint: `${prefix}/customers/${id}`,
    isPrivate: true,
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["owner-customers"] });
      },
      onError: (error: AxiosError<any>) => {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to delete customer.";
        toast.error(errorMessage);
      },
    },
  });
};
