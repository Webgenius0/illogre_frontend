import { useQuery } from "@tanstack/react-query";
import axiosPrivate from "./axios/useAxiosPrivate";

export const useGetAnalytics = (range: string = "7days") => {
  return useQuery({
    queryKey: ["analytics", range],
    queryFn: async () => {
      const response = await axiosPrivate.get(`/owner/analytics?range=${range}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
