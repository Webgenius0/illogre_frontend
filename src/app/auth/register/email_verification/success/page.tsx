import { Check } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden font-urbanist">
      <div className="w-full max-w-140 z-10 space-y-4 sm:space-y-8 flex flex-col items-center">
        <div className="w-full bg-white/30 backdrop-blur-xl border border-white/60 rounded-2xl p-6 sm:p-12 md:p-20 shadow-lg relative text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="size-20 rounded-full border border-primary/20 flex items-center justify-center bg-white/10 relative shadow-[inset_0_0_20px_rgba(202,229,85,0.1)]">
              <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-white/30 shadow-lg">
                <Check className="text-secondary w-8 h-8 sm:w-10 sm:h-10 stroke-[3px]" />
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mb-2">
            Verify Successfully Done
          </h2>
          <p className="text-[#6B6B6B] text-base sm:text-lg mb-8 sm:mb-14 font-medium">
            You have successfully Create your account
          </p>

          <Link
            href="/auth/register/plans"
            className="w-full inline-block py-3 bg-linear-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90 text-foreground font-bold text-base rounded-md transition-all duration-300 transform active:scale-[0.98] text-center"
          >
            Continue
          </Link>
        </div>
      </div>
    </div>
  );
}
