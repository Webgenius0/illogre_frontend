"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { axiosPublic } from "@/hooks/axios/useAxiosPublic";

function AcceptInvitationContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const [status, setStatus] = useState<"inspecting" | "idle" | "loading" | "success" | "error">("inspecting");
  const [message, setMessage] = useState("");
  const [details, setDetails] = useState<{ email?: string; company_name?: string } | null>(null);

  // Inspect invitation on mount (safe read-only GET)
  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing or invalid invitation token.");
      return;
    }

    const inspectInvitation = async () => {
      try {
        const response = await axiosPublic.get(
          `/auth/accept-invitation/${encodeURIComponent(token)}`
        );
        if (response.data?.success || response.data?.status === "success") {
          setDetails(response.data?.data || null);
          setStatus("idle");
        } else {
          setStatus("error");
          setMessage(response.data?.message || "Invalid or expired invitation.");
        }
      } catch (error: unknown) {
        const err = error as AxiosError<{ message?: string }>;
        setStatus("error");
        setMessage(
          err.response?.data?.message ||
            "Unable to verify invitation. It may be expired or already used."
        );
      }
    };

    inspectInvitation();
  }, [token]);

  // Accept invitation on button submit (state-changing POST)
  const handleAccept = async () => {
    if (!token) return;
    setStatus("loading");
    try {
      const response = await axiosPublic.post(
        `/auth/accept-invitation/${encodeURIComponent(token)}`
      );

      if (response.data?.success || response.data?.status === "success") {
        setStatus("success");
        setMessage(response.data?.message || "Invitation accepted successfully! Account activated.");
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      } else {
        setStatus("error");
        setMessage(response.data?.message || "Failed to accept invitation.");
      }
    } catch (error: unknown) {
      const err = error as AxiosError<{ message?: string }>;
      setStatus("error");
      setMessage(
        err.response?.data?.message ||
          "Something went wrong while accepting the invitation. Please try again."
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
        <p className="text-gray-500 mb-6">
          {details?.company_name
            ? `You have been invited to join ${details.company_name} on Tixolve.`
            : "You have been invited to join a professional team on Tixolve."}{" "}
          Click below to accept and activate your account.
        </p>

        {details?.email && (
          <div className="mb-6 py-2 px-4 bg-gray-50 rounded-xl text-xs text-gray-600">
            Invited as: <span className="font-semibold text-gray-900">{details.email}</span>
          </div>
        )}

        {status === "inspecting" && (
          <div className="flex items-center justify-center space-x-2 text-gray-500 py-3">
            <div className="w-4 h-4 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-4 h-4 bg-gray-400 rounded-full animate-bounce [animation-delay:-.3s]"></div>
            <div className="w-4 h-4 bg-gray-400 rounded-full animate-bounce [animation-delay:-.5s]"></div>
            <span className="font-medium ml-2 text-sm">Verifying invitation...</span>
          </div>
        )}

        {status === "idle" && (
          <button
            onClick={handleAccept}
            className="w-full bg-[#14a800] hover:bg-[#118f00] text-white font-semibold py-4 rounded-xl transition duration-300 shadow-lg shadow-green-200 cursor-pointer"
          >
            Accept & Join Team
          </button>
        )}

        {status === "loading" && (
          <div className="flex items-center justify-center space-x-2 text-green-600 py-3">
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
              onClick={() => router.push("/auth/login")}
              className="mt-3 text-sm underline font-semibold cursor-pointer"
            >
              Return to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-sm font-medium text-gray-500">Loading invitation...</div>
        </div>
      }
    >
      <AcceptInvitationContent />
    </Suspense>
  );
}
