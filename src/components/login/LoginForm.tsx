"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, InfoIcon } from "lucide-react";
import Image from "next/image";
import { useCurrentUser, useLogin } from "@/hooks/auth.api";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { Alert, AlertTitle } from "../ui/alert";
import { GoogleSignInButton } from "../shared/GoogleSignInButton";

interface ValidationErrors {
  email?: string[];
  password?: string[];
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: currentUser, isLoading: isCheckingAuth } = useCurrentUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  // If already authenticated, redirect to destination
  useEffect(() => {
    if (currentUser) {
      const callbackUrl = searchParams.get("callbackUrl");
      if (callbackUrl) {
        router.replace(callbackUrl);
      } else if (currentUser.is_subscribed) {
        if (currentUser.role === "owner") {
          router.replace("/");
        } else {
          router.replace("/tickets");
        }
      } else {
        router.replace("/auth/register/plans");
      }
    }
  }, [currentUser, router, searchParams]);

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const loginMutation = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      loginMutation?.mutate({ email, password });
    }
  };

  if (isCheckingAuth || currentUser) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  const backendErrors = (loginMutation?.error as { errors?: ValidationErrors })?.errors;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden font-urbanist">
      <div className="w-full max-w-120 z-10 space-y-8 flex flex-col items-center">
        {/* Card */}
        <div className="w-full bg-white/40 backdrop-blur-xl border border-white/60 rounded-xl p-8 shadow-lg  relative">
          <h2 className="text-2xl font-semibold text-center mb-10">
            Log In Your Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@mail.com"
                  className={`w-full px-5 h-10 py-4 bg-white/30 border ${
                    errors.email || backendErrors?.email?.[0] ? "border-red-500" : "border-white"
                  } rounded-md focus:outline-none placeholder:text-gray-400`}
                />
                {(errors.email || backendErrors?.email?.[0]) && (
                  <p className="text-red-500 text-xs mt-1 ml-1">
                    {errors.email || backendErrors?.email?.[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2 relative">
              <label className="text-sm font-medium text-gray-700 block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className={`w-full h-10 text-base px-5 py-4 bg-white/30 border ${
                    errors.password || backendErrors?.password?.[0] ? "border-red-500" : "border-white"
                  } rounded-md focus:outline-none placeholder:text-gray-400`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {(errors.password || backendErrors?.password?.[0]) && (
                <p className="text-red-500 text-xs mt-1 ml-1">
                  {errors.password || backendErrors?.password?.[0]}
                </p>
              )}
              <div className="flex justify-end">
                <Link
                  href="/auth/forgot_password"
                  className="text-sm text-red-400 hover:text-red-500 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>
            {loginMutation?.error?.message && (
              <Alert className="max-w-md border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
                <InfoIcon />
                <AlertTitle>{loginMutation?.error?.message}</AlertTitle>
              </Alert>
            )}
            {loginMutation?.data?.data?.is_subscribed &&
              loginMutation?.data?.message && (
                <Alert className="max-w-md border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
                  <InfoIcon />
                  <AlertTitle>{loginMutation?.data?.message}</AlertTitle>
                </Alert>
              )}

            {loginMutation?.data?.data?.is_subscribed === false && (
              <Alert className="max-w-md border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
                <InfoIcon />
                <AlertTitle>
                  You have must subscribe to access this feature
                </AlertTitle>{" "}
                <Link
                  href="/auth/register/plans"
                  className="text-blue-500 hover:underline"
                >
                  Subscribe now
                </Link>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={loginMutation?.isPending}
              className="w-full h-10 bg-linear-to-r from-secondary text-foreground to-primary font-normal rounded-md"
            >
              Log In {loginMutation?.isPending && <Spinner />}
            </Button>
          </form>

          <div className="mt-8 flex items-center gap-4">
            <div className="h-px w-full bg-white" />
            <span className="text-xs whitespace-nowrap font-medium">
              or register with
            </span>
            <div className="h-px w-full bg-white" />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4">
            <GoogleSignInButton />
          </div>

          <div className="mt-10 text-center">
            <p className="text-sm text-gray-400">
              Dont have any account?{" "}
              <Link
                href="/auth/register"
                className="text-[#1A1A1A] font-semibold hover:underline decoration-2 underline-offset-4"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
