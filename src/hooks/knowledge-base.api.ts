import { useApiMutation, useApiQuery } from "./mutation/useApiMutation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSelector } from "react-redux";

/**
 * KNOWLEDGE BASE LIST
 */
export const useKnowledgeBaseList = () => {
  const { user } = useSelector((state: any) => state.auth);
  const prefix = user?.role === "Support Manager" ? "/manager" : "/owner";

  return useApiQuery({
    key: "knowledge-base-list",
    endpoint: `${prefix}/knowledge-base`,
    isPrivate: true,
  });
};

/**
 * KNOWLEDGE BASE DETAILS
 */
export const useKnowledgeBaseDetails = (id: string | number | null) => {
  const { user } = useSelector((state: any) => state.auth);
  const prefix = user?.role === "Support Manager" ? "/manager" : "/owner";

  return useApiQuery({
    key: ["knowledge-base-details", id],
    endpoint: `${prefix}/knowledge-base/${id}`,
    isPrivate: true,
    enabled: !!id,
  });
};

/**
 * ADD KNOWLEDGE SOURCE
 */
export const useAddKnowledgeSource = () => {
  const queryClient = useQueryClient();
  const { user } = useSelector((state: any) => state.auth);
  const prefix = user?.role === "Support Manager" ? "/manager" : "/owner";

  return useApiMutation({
    key: "add-knowledge-source",
    method: "post",
    endpoint: `${prefix}/knowledge-base`,
    isPrivate: true,
    headers: { "content-type": "multipart/form-data" },
    options: {
      onSuccess: () => {
        toast.success("Knowledge source added successfully!");
        queryClient.invalidateQueries({ queryKey: ["knowledge-base-list"] });
      },
      onError: (error: AxiosError<any>) => {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to add knowledge source";
        toast.error(errorMessage);
      },
    },
  });
};

/**
 * UPDATE KNOWLEDGE SOURCE
 */
export const useUpdateKnowledgeSource = (id: number | string | null) => {
  const queryClient = useQueryClient();
  const { user } = useSelector((state: any) => state.auth);
  const prefix = user?.role === "Support Manager" ? "/manager" : "/owner";

  return useApiMutation({
    key: ["update-knowledge-source", id],
    method: "post", // Using post with _method: PATCH for potential file uploads
    endpoint: `${prefix}/knowledge-base/${id}`,
    isPrivate: true,
    options: {
      onSuccess: () => {
        toast.success("Knowledge source updated successfully!");
        queryClient.invalidateQueries({ queryKey: ["knowledge-base-list"] });
        queryClient.invalidateQueries({ queryKey: ["knowledge-base-details"] });
      },
      onError: (error: AxiosError<any>) => {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to update knowledge source";
        toast.error(errorMessage);
      },
    },
  });
};

/**
 * DELETE KNOWLEDGE SOURCE
 */
export const useDeleteKnowledgeSource = (id?: number | string) => {
  const queryClient = useQueryClient();
  const { user } = useSelector((state: any) => state.auth);
  const prefix = user?.role === "Support Manager" ? "/manager" : "/owner";
  const endpoint = id
    ? `${prefix}/knowledge-base/${id}`
    : `${prefix}/knowledge-base`;

  return useApiMutation({
    key: ["delete-knowledge-source", id],
    method: "delete",
    endpoint,
    isPrivate: true,
    options: {
      onSuccess: () => {
        toast.success("Knowledge source deleted successfully!");
        queryClient.invalidateQueries({ queryKey: ["knowledge-base-list"] });
        queryClient.invalidateQueries({ queryKey: ["knowledge-base-details"] });
      },
      onError: (error: AxiosError<any>) => {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to delete knowledge source";
        toast.error(errorMessage);
      },
    },
  });
};

/**
 * REINDEX KNOWLEDGE SOURCE
 */
export const useReindexKnowledgeSource = (id: number | string | null) => {
  const queryClient = useQueryClient();
  const { user } = useSelector((state: any) => state.auth);
  const prefix = user?.role === "Support Manager" ? "/manager" : "/owner";

  return useApiMutation({
    key: ["reindex-knowledge-source", id],
    method: "post",
    endpoint: `${prefix}/knowledge-base/${id}/reindex`,
    isPrivate: true,
    options: {
      onSuccess: () => {
        toast.success("Knowledge source re-indexing started!");
        queryClient.invalidateQueries({ queryKey: ["knowledge-base-list"] });
        queryClient.invalidateQueries({ queryKey: ["knowledge-base-details"] });
      },
      onError: (error: AxiosError<any>) => {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to re-index knowledge source";
        toast.error(errorMessage);
      },
    },
  });
};

/**
 * TEST KNOWLEDGE QUERY
 */
export const useTestKnowledgeQuery = (
  id: number | string | null,
  options?: any,
) => {
  const { user } = useSelector((state: any) => state.auth);

  console.log(user);

  const prefix = user?.role === "owner" ? "/owner" : "/manager";

  return useApiMutation({
    key: ["test-knowledge-query", id],
    method: "post",
    endpoint: `${prefix}/knowledge-base/${id}/test-query`,
    isPrivate: true,
    options,
  });
};
