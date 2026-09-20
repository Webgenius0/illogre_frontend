import { useApiQuery, useApiMutation } from "./mutation/useApiMutation";

/**
 * Hook to fetch all tickets for the shared dashboard
 */
export const useTickets = (params: any = {}) => {
  // Filter out empty params
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== "" && v !== "all")
  );
  const queryParams = new URLSearchParams(cleanParams as Record<string, string>).toString();
  
  return useApiQuery<any>({
    key: ["shared-tickets", params],
    endpoint: `/shared/tickets${queryParams ? `?${queryParams}` : ''}`,
    isPrivate: true,
    refreshInterval: 1000,
  });
};

/**
 * Hook to fetch details of a specific ticket
 */
export const useTicketDetails = (id: string | number | null) => {
  return useApiQuery<any>({
    key: ["ticket-details", id],
    endpoint: `/shared/tickets/${id}`,
    isPrivate: true,
    enabled: !!id,
    refreshInterval: 5000,
  });
};

/**
 * Hook to send a reply for a ticket
 */
export const useSendTicketReply = (id: string | number | null) => {
  return useApiMutation<any, any, { reply_text: string; is_internal: boolean }>({
    key: "send-ticket-reply",
    endpoint: `/shared/tickets/${id}/reply`,
    method: "post",
    isPrivate: true,
  });
};

/**
 * Hook to add an internal note under a ticket
 */
export const useAddInternalNote = (id: string | number | null) => {
  return useApiMutation<any, any, { note?: string; reply_text?: string }>({
    key: "add-internal-note",
    endpoint: `/shared/tickets/${id}/internal-notes`,
    method: "post",
    isPrivate: true,
  });
};

/**
 * Hook to update status of a ticket (Open, Pending, Resolved, Closed)
 */
export const useUpdateTicketStatus = (id: string | number | null) => {
  return useApiMutation<any, any, { status: string }>({
    key: "update-ticket-status",
    endpoint: `/shared/tickets/${id}/status`,
    method: "patch",
    isPrivate: true,
  });
};
