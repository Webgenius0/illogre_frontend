"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, InfoIcon } from "lucide-react";
import google from "../../assets/google.png";
import Image from "next/image";
import { useLogin, useSocialLogin } from "@/hooks/auth.api";
import { useGoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { Alert, AlertTitle } from "../ui/alert";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [googleLoading, setGoogleLoading] = useState(false);

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
  const socialLoginMutation = useSocialLogin();

  const googleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      setGoogleLoading(true);
      socialLoginMutation.mutate(
        { token: tokenResponse.access_token },
        {
          onSettled: () => {
            setGoogleLoading(false);
          },
        },
      );
    },
    onError: (error) => {
      console.error("Google OAuth error:", error);
      toast.error("Google sign-in was unsuccessful.");
      setGoogleLoading(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      loginMutation?.mutate({ email, password });
    }
  };

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
                    errors.email ? "border-red-500" : "border-white"
                  } rounded-md focus:outline-none placeholder:text-gray-400`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 ml-1">
                    {errors.email}
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
                    errors.password ? "border-red-500" : "border-white"
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
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 ml-1">
                  {errors.password}
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
            <button
              type="button"
              disabled={googleLoading || socialLoginMutation.isPending}
              onClick={() => {
                setGoogleLoading(true);
                googleLogin();
              }}
              className="flex items-center justify-center gap-3 py-2 px-4 bg-white/60 border border-white rounded-md hover:bg-white/80 transition-all duration-300 shadow-sm font-medium text-gray-700 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {googleLoading || socialLoginMutation.isPending ? (
                <>
                  <Spinner className="w-4 h-4" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <Image src={google} alt="Google" className="w-6.5" />
                  Google
                </>
              )}
            </button>
            {/* <button className="flex items-center justify-center gap-3 py-2 px-4 bg-white/60 border border-white rounded-md hover:bg-white/80 transition-all duration-300 shadow-sm font-medium text-gray-700">
              <Image src={apple} alt="Apple" className="w-5" />
              Apple
            </button> */}
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
