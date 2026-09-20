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

export default function CompanyInformationForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch, // Needed to compare password with confirmPassword
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: "",
      company: "",
      website: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  // Watch the password field to compare it in the confirmation field
  const passwordValue = watch("password");

  const onSubmit = (data: any) => {
    router.push(`plans`);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden font-urbanist">
      <div className="w-full max-w-125 z-10 space-y-8 flex flex-col items-center">
        {/* Card */}
        <div className="w-full bg-white/30 backdrop-blur-xl border border-white/60 rounded-2xl p-8 sm:p-12 shadow-xl relative">
          <h2 className="text-2xl font-semibold text-center mb-2">
            Company Information
          </h2>
          <p className="text-sm text-[#A0A0A0] font-normal mb-10 text-center">
            Create your Company Information
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  {...register("fullName", { validate: validators.name })}
                  placeholder="Enter your full name"
                  className={`w-full px-5 h-10 py-4 bg-white/30 border ${
                    errors.fullName ? "border-red-500" : "border-white"
                  } rounded-md shadow focus:outline-none placeholder:text-gray-400`}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-xs mt-1">
                    {String(errors.fullName.message)}
                  </p>
                )}
              </div>
            </div>
            {/* Company Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">
                Company Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  {...register("company", { validate: validators.company })}
                  placeholder="Enter your full name"
                  className={`w-full px-5 h-10 py-4 bg-white/30 border ${
                    errors.company ? "border-red-500" : "border-white"
                  } rounded-md shadow focus:outline-none placeholder:text-gray-400`}
                />
                {errors.company && (
                  <p className="text-red-500 text-xs mt-1">
                    {String(errors.company.message)}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">
                Company Email
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

            {/* Website URL */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">
                Website URL
              </label>
              <div className="relative">
                <input
                  type="text"
                  {...register("website", {
                    required: "Website url required",
                  })}
                  placeholder="Enter your full name"
                  className={`w-full px-5 h-10 py-4 bg-white/30 border ${
                    errors.website ? "border-red-500" : "border-white"
                  } rounded-md shadow focus:outline-none placeholder:text-gray-400`}
                />
                {errors.website && (
                  <p className="text-red-500 text-xs mt-1">
                    {String(errors.website.message)}
                  </p>
                )}
              </div>
            </div>

            {/* Password Confirmation */}
            <div className="space-y-2 relative">
              <label className="text-sm font-medium text-gray-700 block">
                Password Confirmation
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                  })}
                  placeholder="Confirm Password"
                  className={`w-full h-10 text-base px-5 py-4 bg-white/30 border ${
                    errors.confirmPassword ? "border-red-500" : "border-white"
                  } rounded-md shadow focus:outline-none placeholder:text-gray-400`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {String(errors.confirmPassword.message)}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-linear-to-r from-secondary to-primary font-normal rounded-md transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95"
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
