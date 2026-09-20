"use client";
import React, { useState, useEffect, useRef } from "react";
import { Mail } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "../ui/button";
import {
  useRegisterEmailVerification,
  useRegisterResendOtp,
} from "@/hooks/auth.api";
import { Spinner } from "../ui/spinner";

export default function EmailVerification() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "example@email.com";
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Resend timer logic
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take last character
    setOtp(newOtp);

    // If a digit is entered, move to the next field
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    // Move to previous field on backspace if current field is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const otpVerifyMutation = useRegisterEmailVerification();

  const handleVerify = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length === 4) {
      otpVerifyMutation.mutate({ email, otp: code });
    }
  };

  const resendOtpMutation = useRegisterResendOtp();

  const handleResend = (e: React.MouseEvent) => {
    e.preventDefault();
    if (timer === 0) {
      setTimer(60);
      resendOtpMutation.mutate({ email });
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden font-urbanist">
      <div className="w-full max-w-100 z-10 space-y-4 sm:space-y-8 flex flex-col items-center">
        <div className="w-full bg-white/30 backdrop-blur-xl border border-white/60 rounded-2xl p-6 shadow-lg relative text-center">
          {/* Email Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-primary/20 flex items-center justify-center bg-white/10 relative shadow-[inset_0_0_20px_rgba(202,229,85,0.1)]">
              <div className="size-15 rounded-full bg-linear-to-br from-primary/10 to-secondary/10 flex items-center justify-center border border-white/30">
                <Mail className="text-secondary size-8" />
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mb-2">Verify Your Email</h2>
          <p className="text-[#A0A0A0] text-base mb-8 sm:mb-12 font-normal space-x-1">
            <span>We've sent a code to</span>
            <span className="text-foreground font-semibold block sm:inline">
              {email}
            </span>
          </p>
          <form onSubmit={handleVerify}>
            <div className="flex justify-center gap-2 sm:gap-4 mb-8 sm:mb-12">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  placeholder="-"
                  className="size-14 text-center text-2xl font-semibold bg-white/30 border border-white/60 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-gray-400/50 shadow-sm"
                />
              ))}
            </div>

            <Button
              type="submit"
              className="w-full h-10 bg-linear-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90 text-foreground text-base mb-6 sm:mb-10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={
                otp.some((digit) => !digit) || otpVerifyMutation?.isPending
              }
            >
              Verify Code {otpVerifyMutation?.isPending && <Spinner />}
            </Button>
          </form>

          <p className="text-base text-gray-500 font-medium">
            Didn't get a code?{" "}
            <button
              onClick={handleResend}
              disabled={timer > 0 || resendOtpMutation?.isPending}
              className={`font-medium transition-colors ${
                timer > 0
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-foreground cursor-pointer"
              }`}
            >
              {resendOtpMutation?.isPending ? "Sending.." : "Resend code"}
              {timer > 0 && `(${timer}s)`}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
