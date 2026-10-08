import { Suspense } from "react";
import LoginForm from "@/components/login/LoginForm";
import { Spinner } from "@/components/ui/spinner";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center">
          <Spinner className="size-8 text-primary" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
