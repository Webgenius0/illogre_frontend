import axios from "axios";

const API_HOST =
  process.env.NEXT_PUBLIC_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://api.tixolve.com"
    : "http://localhost:8000");
const BASE_URL = `${API_HOST}/api`;

export const axiosPublic = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(process.env.NEXT_PUBLIC_ENABLE_NGROK_WARNING_SKIP === "true"
      ? { "ngrok-skip-browser-warning": "true" }
      : {}),
  },
  withCredentials: true,
});

axiosPublic.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error?.response) {
      const networkError = new Error(
        "Network error. Please check your connection.",
      );
      return Promise.reject(
        Object.assign(networkError, {
          status: 0,
          message: "Network error. Please check your connection.",
          code: error?.code || "ERR_NETWORK",
        }),
      );
    }

    const { status, data } = error.response;

    let message = data?.message || "Something went wrong. Please try again.";
    if (status === 422 && data?.errors && typeof data.errors === "object") {
      const firstErrorMsg = Object.values(data.errors)
        .flat()
        .find((msg) => typeof msg === "string");
      if (firstErrorMsg) {
        message = firstErrorMsg as string;
      }
    }

    // Preserve Axios error response, status, message, and Laravel 422 field-level errors
    error.status = status;
    error.message = message;
    error.errors = data?.errors;

    return Promise.reject(error);
  },
);
