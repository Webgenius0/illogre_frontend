import { toast } from "sonner";
import { useApiMutation, useApiQuery } from "./mutation/useApiMutation";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";

// pricing plans
export const usePricingPlans = () => {
  const user = useSelector((state: any) => state.auth.user);
  return useApiQuery({
    key: "pricing-plans",
    endpoint: "/pricing-plans",
    enabled: !!user && user.role === "owner",
  });
};

// checkout
export const useCheckout = () => {
  const router = useRouter();
  return useApiMutation({
    key: "checkout",
    method: "post",
    endpoint: "/auth/register/checkout",
    options: {
      onSuccess: (data) => {
        // If user is already subscribed, redirect to dashboard directly
        if (data?.data?.already_subscribed) {
          toast.info("You already have an active subscription!");
          router.push("/");
          return;
        }
        // Otherwise redirect to Stripe checkout
        if (data?.data?.checkout_url) {
          window.location.replace(data?.data?.checkout_url);
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
        console.error("Registration error:", error);
      },
    },
  });
};
