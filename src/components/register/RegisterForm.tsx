"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import google from "../../assets/google.png";
import apple from "../../assets/apple.png";
import Image from "next/image";
import { Controller, useForm } from "react-hook-form";
import { validators } from "@/utils/validator";
import { Checkbox } from "../ui/checkbox";
import { useRouter } from "next/navigation";
import { useRegister, useSocialLogin } from "@/hooks/auth.api";
import { useGoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();

  // register mutation
  const { mutate: registerUser, isPending } = useRegister();
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

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      company_name: "",
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      terms: false,
      user_type: "owner",
    },
  });

  const passwordValue = watch("password");

  const onSubmit = (data: any) => {
    registerUser(data);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden font-urbanist">
      <div className="w-full max-w-120 z-10 space-y-8 flex flex-col items-center">
        {/* Card */}
        <div className="w-full bg-white/30 backdrop-blur-xl border border-white/60 rounded-2xl p-8 shadow-xl relative">
          <h2 className="text-2xl font-semibold text-center mb-2">
            Register your account
          </h2>
          <p className="text-sm text-[#A0A0A0] font-normal mb-10 text-center">
            Please fill out this field to continue the registration
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Company Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">
                Company Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  {...register("company_name", {
                    validate: validators.company,
                  })}
                  placeholder="Enter your company name"
                  className={`w-full px-5 h-10 py-4 bg-white/30 border ${
                    errors.company_name ? "border-red-500" : "border-white"
                  } rounded-md shadow focus:outline-none placeholder:text-gray-400`}
                />
                {errors.company_name && (
                  <p className="text-red-500 text-xs mt-1">
                    {String(errors.company_name.message)}
                  </p>
                )}
              </div>
            </div>
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  {...register("name", { validate: validators.name })}
                  placeholder="Enter your full name"
                  className={`w-full px-5 h-10 py-4 bg-white/30 border ${
                    errors.name ? "border-red-500" : "border-white"
                  } rounded-md shadow focus:outline-none placeholder:text-gray-400`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {String(errors.name.message)}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  {...register("email", { validate: validators.email })}
                  placeholder="yourname@mail.com"
                  className={`w-full px-5 h-10 py-4 bg-white/30 border ${
                    errors.email ? "border-red-500" : "border-white"
                  } rounded-md shadow focus:outline-none placeholder:text-gray-400`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {String(errors.email.message)}
                  </p>
                )}
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2 relative">
              <label className="text-sm font-medium text-gray-700 block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password", { validate: validators.password })}
                  placeholder="Password"
                  className={`w-full h-10 text-base px-5 py-4 bg-white/30 border ${
                    errors.password ? "border-red-500" : "border-white"
                  } rounded-md shadow focus:outline-none placeholder:text-gray-400`}
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
                <p className="text-red-500 text-xs mt-1">
                  {String(errors.password.message)}
                </p>
              )}
            </div>

            {/* Password Confirmation */}
            <div className="space-y-2 relative">
              <label className="text-sm font-medium text-gray-700 block">
                Password Confirmation
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password_confirmation", {
                    validate: (v) =>
                      !v
                        ? "Please confirm your password"
                        : v !== passwordValue
                          ? "Passwords do not match"
                          : true,
                  })}
                  placeholder="Confirm Password"
                  className={`w-full h-10 text-base px-5 py-4 bg-white/30 border ${
                    errors.password_confirmation
                      ? "border-red-500"
                      : "border-white"
                  } rounded-md shadow focus:outline-none placeholder:text-gray-400`}
                />
              </div>
              {errors.password_confirmation && (
                <p className="text-red-500 text-xs mt-1">
                  {String(errors.password_confirmation.message)}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                <Controller
                  name="terms"
                  control={control}
                  rules={{ validate: validators.terms }}
                  render={({ field }) => (
                    <Checkbox
                      className={`border-foreground/40 ${errors.terms ? "border-red-500" : ""}`}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <p>
                  I agree with the{" "}
                  <Link
                    href="/terms-and-conditions"
                    className="text-green-600 underline"
                  >
                    terms and conditions
                  </Link>
                </p>
              </label>

              {errors.terms && (
                <p className="text-red-500 text-xs mt-1">
                  {String(errors.terms.message)}
                </p>
              )}
            </div>
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-10 bg-linear-to-r from-secondary text-foreground to-primary"
            >
              Create Account {isPending && <Spinner />}
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
                  <Image src={google} alt="Google" className="w-5" />
                  Google
                </>
              )}
            </button>
          </div>

          <div className="mt-10 text-center text-sm flex items-center gap-1.5 justify-center">
            <p className="text-gray-400">Already have an account?</p>
            <Link
              href="/auth/login"
              className="text-foreground font-semibold hover:underline decoration-2 underline-offset-4"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
