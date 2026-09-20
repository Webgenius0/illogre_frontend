"use client";

import React, { useState, useEffect } from "react";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { axiosPublic } from "@/hooks/axios/useAxiosPublic";

export default function page() {
  const { token } = useParams();
  const router = useRouter();
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const handleAccept = async () => {
    setStatus("loading");
    try {
      const response = await axiosPublic.get(
        `/auth/accept-invitation/${token}`
      );

      if (response.data.success) {
        setStatus("success");
        setMessage(response.data.message);
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      }
    } catch (error: any) {
      setStatus("error");
      setMessage(
        error.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden p-8 text-center">
        {/* Icon Section */}
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Team Invitation
        </h2>
        <p className="text-gray-500 mb-8">
          You have been invited to join a professional team on Tixolve. Click
          below to accept and activate your account.
        </p>
        {status === "idle" && (
          <button
            onClick={handleAccept}
            className="w-full bg-[#14a800] hover:bg-[#118f00] text-white font-semibold py-4 rounded-xl transition duration-300 shadow-lg shadow-green-200"
          >
            Accept & Join Team
          </button>
        )}
        {status === "loading" && (
          <div className="flex items-center justify-center space-x-2 text-green-600">
            <div className="w-4 h-4 bg-green-600 rounded-full animate-bounce"></div>
            <div className="w-4 h-4 bg-green-600 rounded-full animate-bounce [animation-delay:-.3s]"></div>
            <div className="w-4 h-4 bg-green-600 rounded-full animate-bounce [animation-delay:-.5s]"></div>
            <span className="font-medium ml-2">Activating your account...</span>
          </div>
        )}
        {status === "success" && (
          <div className="p-4 bg-green-50 rounded-2xl border border-green-100 italic text-green-700">
            <p className="font-bold mb-1">🎉 Success!</p>
            <p className="text-sm">{message}</p>
            <p className="mt-2 text-xs text-green-600">
              Redirecting to login...
            </p>
          </div>
        )}
        {status === "error" && (
          <div className="p-4 bg-red-50 rounded-2xl border border-red-100 text-red-700">
            <p className="font-bold mb-1">Oops!</p>
            <p className="text-sm">{message}</p>
            <button
              onClick={() => setStatus("idle")}
              className="mt-3 text-sm underline font-semibold"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
