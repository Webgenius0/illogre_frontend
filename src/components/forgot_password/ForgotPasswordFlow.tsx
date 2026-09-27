"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Mail, Check, Eye, EyeOff, Loader2, InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useForgotPassword,
  useResetPassword,
  useVerifyOtp,
} from "@/hooks/auth.api";
import { toast } from "sonner";
import { Spinner } from "../ui/spinner";
import { Alert, AlertTitle } from "../ui/alert";

export default function ForgotPasswordFlow() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showPassword, setShowPassword] = useState(false);
  const [timer, setTimer] = useState(60);
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const {
    mutate: forgotPassword,
    isPending: isForgotPasswordPending,
    error: forgotPasswordError,
  } = useForgotPassword();
  const { mutate: verifyOtp, isPending: isVerifyOtpPending } = useVerifyOtp();
  const { mutate: resetPassword, isPending: isResetPasswordPending } =
    useResetPassword();

  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Timer for OTP resend
  useEffect(() => {
    if (step === 2 && timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      forgotPassword(
        { email },
        {
          onSuccess: () => {
            setStep(2);
            setTimer(60);
          },
        },
      );
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }

    if (digits.length > 1) {
      const newOtp = [...otp];
      for (let i = 0; i < digits.length && index + i < 6; i++) {
        newOtp[index + i] = digits[i];
      }
      setOtp(newOtp);
      const nextFocusIndex = Math.min(index + digits.length, 5);
      otpRefs[nextFocusIndex]?.current?.focus();
    } else {
      const newOtp = [...otp];
      newOtp[index] = digits;
      setOtp(newOtp);
      if (index < 5) otpRefs[index + 1]?.current?.focus();
    }
  };

  const handleOtpPaste = (
    index: number,
    e: React.ClipboardEvent<HTMLInputElement>,
  ) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    const digits = pastedData.replace(/\D/g, "");
    if (!digits) return;

    const newOtp = [...otp];
    for (let i = 0; i < digits.length && index + i < 6; i++) {
      newOtp[index + i] = digits[i];
    }
    setOtp(newOtp);

    const nextFocusIndex = Math.min(index + digits.length, 5);
    otpRefs[nextFocusIndex]?.current?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs[index - 1]?.current?.focus();
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.every((d) => d) && otp.join("").length === 6) {
      verifyOtp(
        { email, otp: otp.join("") },
        {
          onSuccess: (data) => {
            setToken(data?.token);
            setStep(3);
          },
        },
      );
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      toast.error("Passwords do not match");
      return;
    }
    resetPassword(
      {
        email,
        token,
        password,
        password_confirmation: passwordConfirmation,
      },
      {
        onSuccess: () => {
          setStep(4);
        },
      },
    );
  };

  // Step 1: Email Input
  if (step === 1) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 font-urbanist">
        <div className="w-full max-w-140 bg-white/30 backdrop-blur-xl border border-white/60 rounded-2xl p-6 sm:p-12 md:p-16 shadow-lg text-center relative overflow-hidden">
          <h2 className="text-2xl font-semibold mb-10">Enter your email</h2>
          <form onSubmit={handleEmailSubmit} className="space-y-8 text-left">
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700 block">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rifatsf101@gmail.com"
                required
                className="w-full px-5 h-12 bg-white/40 border border-white/60 rounded-md shadow-sm focus:outline-none placeholder:text-gray-400"
              />
              {forgotPasswordError?.message && (
                <Alert className="max-w-md border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
                  <InfoIcon />
                  <AlertTitle>{forgotPasswordError.message}</AlertTitle>
                </Alert>
              )}
            </div>

            <Button
              type="submit"
              disabled={isForgotPasswordPending || !email}
              className="w-full py-5 bg-linear-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90 text-foreground text-base rounded-md transition-all duration-300 flex items-center justify-center gap-2"
            >
              {isForgotPasswordPending && <Spinner />}
              {isForgotPasswordPending ? "Sending..." : "Send Code"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Step 2: OTP Verification
  if (step === 2) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 font-urbanist">
        <div className="w-full max-w-140 bg-white/30 backdrop-blur-xl border border-white/60 rounded-2xl p-6 sm:p-12 md:p-16 shadow-lg text-center relative overflow-hidden">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-primary/20 flex items-center justify-center bg-white/10 relative shadow-[inset_0_0_20px_rgba(202,229,85,0.1)]">
              <div className="size-15 rounded-full bg-linear-to-br from-primary/10 to-secondary/10 flex items-center justify-center border border-white/30">
                <Mail className="text-secondary size-8" />
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-semibold mb-2">Verify Code</h2>
          <p className="text-[#A0A0A0] text-base mb-10">
            We've sent a 6-digit code to{" "}
            <span className="text-foreground font-semibold">{email}</span>
          </p>
          <form onSubmit={handleOtpSubmit} className="space-y-10">
            <div className="flex justify-center gap-1.5 sm:gap-3">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={otpRefs[i]}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  onPaste={(e) => handleOtpPaste(i, e)}
                  placeholder="-"
                  className="size-11 sm:size-14 text-center text-xl sm:text-2xl font-semibold bg-white/30 border border-white/60 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-gray-400/50 shadow-sm"
                />
              ))}
            </div>
            <Button
              type="submit"
              disabled={otp.some((d) => !d) || isVerifyOtpPending}
              className="w-full py-3 sm:py-5 bg-linear-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90 text-foreground text-base mb-6 sm:mb-10 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isVerifyOtpPending && (
                <Loader2 className="animate-spin size-5" />
              )}
              {isVerifyOtpPending ? "Verifying..." : "Verify Code"}
            </Button>
            <p className="text-base text-gray-500 font-medium">
              Didn't get a code?{" "}
              <button
                type="button"
                onClick={() => {
                  if (timer === 0) {
                    forgotPassword(
                      { email },
                      {
                        onSuccess: () => setTimer(60),
                      },
                    );
                  }
                }}
                className={`transition-colors ${timer > 0 || isForgotPasswordPending ? "text-gray-400 cursor-not-allowed" : "text-foreground cursor-pointer"}`}
              >
                {isForgotPasswordPending
                  ? "Resending..."
                  : `Resend code ${timer > 0 ? `(${timer}s)` : ""}`}
              </button>
            </p>
          </form>
        </div>
      </div>
    );
  }

  // Step 3: New Password
  if (step === 3) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 font-urbanist">
        <div className="w-full max-w-140 bg-white/30 backdrop-blur-xl border border-white/60 rounded-2xl p-6 sm:p-12 md:p-16 shadow-lg text-center relative overflow-hidden">
          <h2 className="text-2xl font-semibold mb-2">Set New Password</h2>
          <p className="text-[#A0A0A0] text-base mb-12 font-medium">
            Please fill out this field to continue the registration
          </p>
          <form onSubmit={handlePasswordSubmit} className="space-y-8 text-left">
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full px-5 h-12 bg-white/40 border border-white/60 rounded-md shadow-sm focus:outline-none placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 block">
                Password Confirmation
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  placeholder="enter your password"
                  required
                  className="w-full px-5 h-12 bg-white/40 border border-white/60 rounded-md shadow-sm focus:outline-none placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              disabled={isResetPasswordPending}
              className="w-full py-5 bg-linear-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90 text-foreground text-base rounded-md transition-all duration-300 flex items-center justify-center gap-2"
            >
              {isResetPasswordPending && (
                <Loader2 className="animate-spin size-5" />
              )}
              {isResetPasswordPending ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Step 4: Success
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 font-urbanist">
      <div className="w-full max-w-140 bg-white/30 backdrop-blur-xl border border-white/60 rounded-2xl p-6 sm:p-12 md:p-16 shadow-lg text-center relative overflow-hidden">
        <div className="flex justify-center mb-6">
          <div className="size-20 rounded-full border border-primary/20 flex items-center justify-center bg-white/10 relative shadow-[inset_0_0_20px_rgba(202,229,85,0.1)]">
            <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-white/30 shadow-lg">
              <Check className="text-secondary w-8 h-8 sm:w-10 sm:h-10 stroke-[3px]" />
            </div>
          </div>
        </div>
        <h2 className="text-2xl font-semibold mb-2">
          Password Successfully Done
        </h2>
        <p className="text-[#6B6B6B] text-base sm:text-lg mb-8 sm:mb-14 font-medium">
          Your password has been successfully reset. You can now log in with
          your new password.
        </p>
        <Link
          href="/auth/login"
          className="w-full inline-block py-3 bg-linear-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90 text-foreground text-base rounded-md transition-all duration-300 transform active:scale-[0.98] text-center"
        >
          Continue
        </Link>
      </div>
    </div>
  );
}
