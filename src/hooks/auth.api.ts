import { useRouter, useSearchParams } from "next/navigation";
import { useApiMutation, useApiQuery } from "./mutation/useApiMutation";
import { useDispatch } from "react-redux";
import { setAuth, logout, UserState } from "@/store/slices/authSlice";
import { useQueryClient, MutateOptions } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";

interface AuthErrorPayload {
  message?: string;
  errors?: Record<string, string[]>;
}

// current user
export const useCurrentUser = (options?: {
  enabled?: boolean;
  retry?: boolean | number;
}) => {
  return useApiQuery<UserState>({
    key: ["current-user"],
    endpoint: "/user",
    isPrivate: true,
    enabled: options?.enabled ?? true,
    options: {
      retry: options?.retry ?? false,
      staleTime: 5 * 60 * 1000,
      select: (data: unknown) => {
        const payload = data as { data?: UserState } & UserState;
        return payload?.data || payload;
      },
    },
  });
};

// login
export const useLogin = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useApiMutation({
    key: "login-in",
    method: "post",
    endpoint: "/auth/login",
    options: {
      onSuccess: (data) => {
        if (data?.data?.is_subscribed) {
          dispatch(
            setAuth({
              user: data?.data,
              remember: true,
            }),
          );
          queryClient.setQueryData(["current-user"], data?.data);

          const callbackUrl = searchParams.get("callbackUrl");
          if (callbackUrl && callbackUrl.startsWith("/")) {
            router.push(callbackUrl);
            return;
          }

          const aiParam =
            data?.data?.is_ai_configured === false
              ? "?ai_not_configured=true"
              : "";
          if (
            data?.data?.is_verified &&
            (data?.data?.role === "Support Manager" ||
              data?.data?.role === "Support Agent")
          ) {
            router.push(`/tickets${aiParam}`);
          } else if (data?.data?.is_verified && data?.data?.role === "owner") {
            router.push(`/${aiParam}`);
          }
        }
      },
      onError: (error) => {
        if (error?.code === "ERR_NETWORK") {
          toast.error("Please check your network connection");
        } else {
          const errorMessage =
            error?.response?.data?.message ||
            error?.message ||
            "Something went wrong!";
          toast.error(errorMessage);
        }
        console.error("Login error:", error);
      },
    },
  });
};

// social login
export const useSocialLogin = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const apiMutation = useApiMutation<
    { data?: UserState; message?: string },
    AxiosError<AuthErrorPayload>,
    FormData | Record<string, unknown>
  >({
    key: "social-login",
    method: "post",
    endpoint: "/social-login",
    options: {
      onSuccess: (data) => {
        console.log(data);

        if (data?.data?.is_subscribed) {
          dispatch(
            setAuth({
              user: data?.data,
              remember: true,
            }),
          );
          if (
            data?.data?.is_verified &&
            (data?.data?.role === "Support Manager" ||
              data?.data?.role === "Support Agent")
          ) {
            router.push("/tickets");
          } else if (data?.data?.is_verified && data?.data?.role === "owner") {
            router.push("/");
          }
        } else {
          toast.error("Please select a subscription plan to continue");
          dispatch(
            setAuth({
              user: data?.data,
              remember: true,
            }),
          );
          router.push("/auth/register/plans");
        }
      },
      onError: (error) => {
        if (error?.code === "ERR_NETWORK") {
          toast.error("Please check your network connection");
        } else {
          const errorMessage =
            error?.response?.data?.message ||
            error?.message ||
            "Social login failed!";
          toast.error(errorMessage);
        }
        console.error("Social login error:", error);
      },
    },
  });

  const mutate = (
    variables: FormData | Record<string, unknown>,
    options?: MutateOptions<
      { data?: UserState; message?: string },
      AxiosError<AuthErrorPayload>,
      FormData | Record<string, unknown>
    >
  ) => {
    let payload: FormData | Record<string, unknown> = variables;
    if (
      !(variables instanceof FormData) &&
      variables &&
      typeof variables === "object"
    ) {
      const formData = new FormData();
      formData.append("provider", (variables.provider as string) || "google");
      formData.append("token", (variables.token as string) || "");
      payload = formData;
    }
    return apiMutation.mutate(payload, options);
  };

  const mutateAsync = async (
    variables: FormData | Record<string, unknown>,
    options?: MutateOptions<
      { data?: UserState; message?: string },
      AxiosError<AuthErrorPayload>,
      FormData | Record<string, unknown>
    >
  ) => {
    let payload: FormData | Record<string, unknown> = variables;
    if (
      !(variables instanceof FormData) &&
      variables &&
      typeof variables === "object"
    ) {
      const formData = new FormData();
      formData.append("provider", (variables.provider as string) || "google");
      formData.append("token", (variables.token as string) || "");
      payload = formData;
    }
    return apiMutation.mutateAsync(payload, options);
  };

  return {
    ...apiMutation,
    mutate,
    mutateAsync,
  };
};

// register
export const useRegister = () => {
  const router = useRouter();
  return useApiMutation({
    key: "register",
    method: "post",
    endpoint: "/auth/register",
    options: {
      onSuccess: (data, payload) => {
        const message = data?.data?.message || "Registration successful";
        toast.success(message);
        router.push(`/auth/register/email_verification?email=${payload.email}`);
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
        console.error("Registration error:", error);
      },
    },
  });
};

// register email otp verification
export const useRegisterEmailVerification = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  return useApiMutation({
    key: "register-email-verification",
    method: "post",
    endpoint: "/auth/register/verify-otp",
    options: {
      onSuccess: (data) => {
        router.push("/auth/register/email_verification/success");
        dispatch(
          setAuth({
            user: data?.data,
            remember: false,
          }),
        );
      },
      onError: (error: AxiosError<AuthErrorPayload>) => {
        if (error?.response?.status === 429) {
          toast.error(
            error?.response?.data?.message ||
              "Too many incorrect attempts. Please try again later.",
          );
        } else if (error?.code === "ERR_NETWORK") {
          toast.error("Please check your network connection");
        } else {
          const errorMessage =
            error?.response?.data?.message ||
            error?.message ||
            "Something went wrong!";
          toast.error(errorMessage);
        }
        console.error("Registration error:", error);
      },
    },
  });
};

// register resend otp verification
export const useRegisterResendOtp = () => {
  return useApiMutation({
    key: "register-email-resend-otp",
    method: "post",
    endpoint: "/auth/resend-otp",
    options: {
      onSuccess: (data) => {
        const message = data?.message || "OTP code resent successfully";
        toast.success(message);
      },
      onError: (error: AxiosError<AuthErrorPayload>) => {
        if (error?.response?.status === 429) {
          toast.error(
            error?.response?.data?.message ||
              "Too many resend attempts. Please try again later.",
          );
        } else if (error?.code === "ERR_NETWORK") {
          toast.error("Please check your network connection");
        } else {
          const errorMessage =
            error?.response?.data?.message ||
            error?.message ||
            "Something went wrong!";
          toast.error(errorMessage);
        }
        console.error("Resend OTP error:", error);
      },
    },
  });
};

// logout
export const useLogout = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useApiMutation({
    key: "logout",
    method: "post",
    endpoint: "/auth/logout",
    isPrivate: true,
    options: {
      onSuccess: () => {
        queryClient.clear();
        dispatch(logout());
        router.push("/auth/login");
        toast.success("Logged out successfully");
      },
      onError: (error: unknown) => {
        queryClient.clear();
        dispatch(logout());
        router.push("/auth/login");
        console.log("Logout error:", error);
      },
    },
  });
};

// forgot password
export const useForgotPassword = () => {
  return useApiMutation({
    key: "forgot-password",
    method: "post",
    endpoint: "/auth/forgot-password",
    options: {
      onSuccess: (data) => {
        const message = data?.message || "OTP sent to your email";
        toast.success(message);
      },
      onError: (error: AxiosError<AuthErrorPayload>) => {
        if (error?.response?.status === 429) {
          toast.error(
            error?.response?.data?.message ||
              "Too many requests. Please try again later.",
          );
        } else if (error?.code === "ERR_NETWORK") {
          toast.error("Please check your network connection");
        } else {
          const errorMessage =
            error?.response?.data?.message ||
            error?.message ||
            "Something went wrong!";
          toast.error(errorMessage);
        }
      },
    },
  });
};

// verify otp
export const useVerifyOtp = () => {
  return useApiMutation({
    key: "verify-otp",
    method: "post",
    endpoint: "/auth/verify-otp",
    options: {
      onSuccess: (data) => {
        toast.success(data?.message || "OTP verified successfully");
      },
      onError: (error: AxiosError<AuthErrorPayload>) => {
        if (error?.response?.status === 429) {
          toast.error(
            error?.response?.data?.message ||
              "Too many incorrect attempts. Please try again later.",
          );
        } else if (error?.code === "ERR_NETWORK") {
          toast.error("Please check your network connection");
        } else {
          const errorMessage =
            error?.response?.data?.message ||
            error?.message ||
            "Something went wrong!";
          toast.error(errorMessage);
        }
      },
    },
  });
};

// reset password
export const useResetPassword = () => {
  return useApiMutation({
    key: "reset-password",
    method: "post",
    endpoint: "/auth/reset-password",
    options: {
      onSuccess: (data) => {
        toast.success(data?.message || "Password reset successfully");
      },
      onError: (error: AxiosError<AuthErrorPayload>) => {
        if (error?.code === "ERR_NETWORK") {
          toast.error("Please check your network connection");
        } else {
          const errorMessage =
            error?.response?.data?.message ||
            error?.message ||
            "Something went wrong!";
          toast.error(errorMessage);
        }
      },
    },
  });
};
