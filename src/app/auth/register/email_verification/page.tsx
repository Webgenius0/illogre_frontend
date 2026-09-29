import { Suspense } from "react";
import EmailVerification from "@/components/register/EmailVerification";

export default function Page() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <EmailVerification />
      </Suspense>
    </div>
  );
}
