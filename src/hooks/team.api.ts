import { useApiMutation, useApiQuery } from "./mutation/useApiMutation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSelector } from "react-redux";

export const useTeamOverview = () => {
  const user = useSelector((state: any) => state.auth.user);

  return useApiQuery({
    key: "team-overview",
    endpoint: user?.role === "owner" ? "/owner/team" : "/manager/agents",
    isPrivate: true,
  });
};

export const useInviteTeamMember = () => {
  const queryClient = useQueryClient();
  const user = useSelector((state: any) => state.auth.user);
  return useApiMutation({
    key: "invite-team-member",
    method: "post",
    endpoint: user?.role === "owner" ? "/owner/team/invite" : "/manager/agents",
    isPrivate: true,
    options: {
      onSuccess: () => {
        toast.success("Team member invited successfully!");
        queryClient.invalidateQueries({ queryKey: ["team-overview"] });
      },
      onError: (error) => {
        // 'error' is now typed as AxiosError
        if (error?.code === "ERR_NETWORK") {
          toast.error("Please check your network connection");
        } else {
          const errorMessage =
            error?.response?.data?.message ||
            error?.message ||
            "Something went wrong!";
          toast.error(errorMessage);
        }
        console.error("Login error:", error?.response);
      },
    },
  });
};

export const useUpdateTeamRole = (memberId: number | null) => {
  const queryClient = useQueryClient();
  const user = useSelector((state: any) => state.auth.user);
  return useApiMutation({
    key: ["update-team-role", memberId],
    method: "patch",
    endpoint:
      user?.role === "owner"
        ? `/owner/team/${memberId}`
        : `/manager/agents/${memberId}`,
    isPrivate: true,
    options: {
      onSuccess: () => {
        toast.success("Team member role updated successfully!");
        queryClient.invalidateQueries({ queryKey: ["team-overview"] });
      },
      onError: (error: AxiosError<any>) => {
        if (error?.code === "ERR_NETWORK") {
          toast.error("Please check your network connection");
        } else {
          const errorMessage =
            error?.response?.data?.message ||
            error?.message ||
            "Failed to update team member role.";
          toast.error(errorMessage);
        }
      },
    },
  });
};

export const useRemoveTeamMember = (memberId: number | null) => {
  const queryClient = useQueryClient();
  const user = useSelector((state: any) => state.auth.user);
  return useApiMutation({
    key: ["remove-team-member", memberId],
    method: "delete",
    endpoint:
      user?.role === "owner"
        ? `/owner/team/${memberId}`
        : `/manager/agents/${memberId}`,
    isPrivate: true,
    options: {
      onSuccess: () => {
        toast.success("Team member removed successfully!");
        queryClient.invalidateQueries({ queryKey: ["team-overview"] });
      },
      onError: (error: AxiosError<any>) => {
        if (error?.code === "ERR_NETWORK") {
          toast.error("Please check your network connection");
        } else {
          const errorMessage =
            error?.response?.data?.message ||
            error?.message ||
            "Failed to remove team member.";
          toast.error(errorMessage);
        }
      },
    },
  });
};
