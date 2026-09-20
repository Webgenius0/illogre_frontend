import { useApiMutation, useApiQuery } from "./mutation/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

/**
 * FETCH NOTIFICATIONS
 */
export const useNotifications = () => {
  return useApiQuery({
    key: "notifications-list",
    endpoint: "/notifications",
    isPrivate: true,
    options: {
      refetchInterval: 30000,
    },
  });
};

/**
 * MARK NOTIFICATIONS AS READ
 */
export const useMarkNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useApiMutation({
    key: "mark-notifications-read",
    method: "post",
    endpoint: "/notifications/mark-as-read",
    isPrivate: true,
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["notifications-list"] });
      },
    },
  });
};
