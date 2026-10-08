import axios from "axios";
import { toast } from "sonner";
import { AppStore, store } from "@/store/store";
import { logout } from "@/store/slices/authSlice";

let storeInstance: AppStore | null = null;

export const injectStore = (s: AppStore) => {
  storeInstance = s;
};

const API_HOST =
  process.env.NEXT_PUBLIC_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://api.tixolve.com"
    : "http://illogri-issue.test");
const axiosPrivate = axios.create({
  baseURL: `${API_HOST}/api`,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "ngrok-skip-browser-warning": "69420",
  },
  timeout: 30000,
  withCredentials: true,
});

// REQUEST INTERCEPTOR
axiosPrivate.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// RESPONSE INTERCEPTOR
axiosPrivate.interceptors.response.use(
  (response) => response,

  async (error) => {
    const { response } = error;

    // Network Error
    if (!response) {
      toast.error("Network error — please check your connection.");
      return Promise.reject(error);
    }

    const status = response.status;

    // 401 Unauthorized
    if (status === 401) {
      const hadUser = Boolean(
        (storeInstance?.getState() || store.getState()).auth.user,
      );
      // 1. Clear the local state/user
      (storeInstance?.dispatch || store.dispatch)(logout());
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        const publicRoutes = [
          "/auth/login",
          "/auth/register",
          "/auth/register/email_verification",
        ];
        const isPublicRoute = publicRoutes.includes(currentPath);

        if (!isPublicRoute) {
          if (hadUser) {
            toast.error("Session expired. Please log in again.");
          }

          const searchParams = new URLSearchParams({
            callbackUrl: currentPath,
          });

          window.location.href = `/auth/login?${searchParams.toString()}`;
        } else {
          // If they are on the Home page, maybe just a silent logout
          // or a less intrusive message
          console.warn("Session expired, but user is on a public page.");
        }
      }

      return Promise.reject(error);
    }
    // 403 Forbidden
    if (status === 403) {
      if (response.data?.error_code === "AI_NOT_CONFIGURED") {
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("show-ai-config-modal", {
              detail: { userType: response.data.user_type },
            })
          );
        }
        return new Promise(() => {});
      }

      if (response.data?.message) {
        toast.error(response.data.message);
      }
      return Promise.reject(error);
    }

    // 400 Bad Request
    if (status === 400) {
      if (response.data?.message) {
        toast.error(response.data.message);
      }
      return Promise.reject(error);
    }

    // 422 Unprocessable Entity (Validation Error)
    if (status === 422) {
      const validationErrors = response.data?.errors;
      if (validationErrors && typeof validationErrors === "object") {
        const firstErrorMsg = Object.values(validationErrors)
          .flat()
          .find((msg) => typeof msg === "string");
        toast.error(
          (firstErrorMsg as string) ||
            response.data?.message ||
            "Validation failed."
        );
      } else {
        toast.error(response.data?.message || "Validation failed.");
      }
      return Promise.reject(error);
    }

    // 404 Not Found
    if (status === 404) {
      if (response.data?.message) {
        toast.error(response.data.message);
      }
      return Promise.reject(error);
    }

    // 429 Too Many Requests
    if (status === 429) {
      toast.error("Too many requests — please slow down.");
      return Promise.reject(error);
    }

    // 500+ Server Error
    if (status >= 500) {
      toast.error("Server error — please try again later.");
      return Promise.reject(error);
    }

    // Default
    toast.error(response.data?.message || "Something went wrong.");
    return Promise.reject(error);
  },
);

export default axiosPrivate;
