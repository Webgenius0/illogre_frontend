import { useApiMutation, useApiQuery } from "./mutation/useApiMutation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setAuth } from "@/store/slices/authSlice";

/**
 * FETCH SETTINGS DATA
 */
export const useSettings = () => {
  const user = useSelector((state: any) => state.auth.user);
  return useApiQuery({
    key: "settings",
    endpoint: "/owner/settings",
    isPrivate: true,
    enabled: user?.role === "owner",
  });
};

/**
 * GENERAL SETTINGS
 */
export const useUpdateGeneralSettings = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const currentAuth = useSelector((state: any) => state.auth);
  return useApiMutation({
    key: "update-general-settings",
    method: "post",
    endpoint: "/owner/settings/general",
    isPrivate: true,
    headers: { "content-type": "multipart/form-data" },
    options: {
      onSuccess: (data) => {
        dispatch(
          setAuth({
            ...currentAuth,
            user: {
              ...currentAuth.user,
              ...data?.data,
            },
          }),
        );

        toast.success("General settings updated successfully!");
        queryClient.invalidateQueries({ queryKey: ["settings"] });
      },
      onError: (error: AxiosError<any>) => {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to update general settings";
        toast.error(errorMessage);
      },
    },
  });
};

/**
 * WORKSPACE SETTINGS
 */
export const useUpdateWorkspaceSettings = () => {
  const queryClient = useQueryClient();
  return useApiMutation({
    key: "update-workspace-settings",
    method: "post",
    endpoint: "/owner/settings/workspace",
    isPrivate: true,
    headers: { "content-type": "multipart/form-data" },
    options: {
      onSuccess: (data) => {
        console.log(data);

        toast.success("Workspace settings updated successfully!");
        queryClient.invalidateQueries({ queryKey: ["owner-settings"] });
      },
      onError: (error: AxiosError<any>) => {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to update workspace settings";
        toast.error(errorMessage);
      },
    },
  });
};

/**
 * AI SETTINGS
 */
export const useUpdateAiSettings = () => {
  const queryClient = useQueryClient();
  return useApiMutation({
    key: "update-ai-settings",
    method: "patch",
    endpoint: "/owner/settings/ai",
    isPrivate: true,
    options: {
      onSuccess: () => {
        toast.success("AI settings updated successfully!");
        queryClient.invalidateQueries({ queryKey: ["owner-settings"] });
      },
      onError: (error: AxiosError<any>) => {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to update AI settings";
        toast.error(errorMessage);
      },
    },
  });
};

/**
 * NOTIFICATION SETTINGS
 */
export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient();
  return useApiMutation({
    key: "update-notification-settings",
    method: "patch",
    endpoint: "/owner/settings/notifications",
    isPrivate: true,
    options: {
      onSuccess: () => {
        toast.success("Notification settings updated successfully!");
        queryClient.invalidateQueries({ queryKey: ["settings"] });
      },
      onError: (error: AxiosError<any>) => {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to update notification settings";
        toast.error(errorMessage);
      },
    },
  });
};

/**
 * SECURITY SETTINGS
 */
export const useUpdateSecuritySettings = () => {
  const queryClient = useQueryClient();
  return useApiMutation({
    key: "update-security-settings",
    method: "patch",
    endpoint: "/owner/settings/security",
    isPrivate: true,
    options: {
      onSuccess: () => {
        toast.success("Password updated successfully!");
        queryClient.invalidateQueries({ queryKey: ["settings"] });
      },
      onError: (error: AxiosError<any>) => {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to update security settings";
        toast.error(errorMessage);
      },
    },
  });
};

/**
 * GOOGLE AUTH SETTINGS
 */
export const useGoogleAuthSettings = () => {
  const user = useSelector((state: any) => state.auth.user);
  return useApiQuery({
    key: "google-auth-settings",
    endpoint: "/owner/settings/google-auth",
    isPrivate: true,
    enabled: !!user,
  });
};

export const useUpdateGoogleAuthSettings = () => {
  const queryClient = useQueryClient();
  return useApiMutation({
    key: "update-google-auth-settings",
    method: "post",
    endpoint: "/owner/settings/google-auth",
    isPrivate: true,
    options: {
      onSuccess: () => {
        toast.success("Google Authentication settings updated successfully!");
        queryClient.invalidateQueries({ queryKey: ["google-auth-settings"] });
      },
      onError: (error: AxiosError<any>) => {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to update Google Authentication settings";
        toast.error(errorMessage);
      },
    },
  });
};
