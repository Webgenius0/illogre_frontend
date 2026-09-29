"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AxiosError } from "axios";
import { axiosPublic } from "@/hooks/axios/useAxiosPublic";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function AcceptInvitationPage() {
  const params = useParams();
  const token = params?.token as string;
  const router = useRouter();

  const [status, setStatus] = useState<"inspecting" | "idle" | "loading" | "success" | "error">("inspecting");
  const [message, setMessage] = useState("");
  const [details, setDetails] = useState<{ email?: string; company_name?: string } | null>(null);

  // Inspect invitation on mount (safe read-only GET)
  React.useEffect(() => {
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

  const handleAccept = async () => {
    if (!token) return;
    setStatus("loading");
    try {
      const response = await axiosPublic.post(
        `/auth/accept-invitation/${encodeURIComponent(token)}`
      );

      if (response.data?.success || response.data?.status === "success" || response.data?.data) {
        setStatus("success");
        setMessage(response.data?.message || "Invitation accepted successfully! Account activated.");
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
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
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl max-w-md w-full space-y-5 relative">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold leading-none tracking-tight text-gray-900">
            Team Invitation
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            {details?.company_name
              ? `You have been invited to join ${details.company_name} on Tixolve.`
              : "You have been invited to join a workspace team on Tixolve."}{" "}
            Do you want to accept this invitation and activate your account?
          </p>
          {details?.email && (
            <p className="text-xs text-gray-400 font-medium">
              Invited as: <span className="text-gray-700 font-semibold">{details.email}</span>
            </p>
          )}
        </div>

        {status === "inspecting" && (
          <div className="flex items-center justify-center space-x-2 text-gray-500 py-3">
            <div className="w-4 h-4 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-4 h-4 bg-gray-400 rounded-full animate-bounce [animation-delay:-.3s]"></div>
            <div className="w-4 h-4 bg-gray-400 rounded-full animate-bounce [animation-delay:-.5s]"></div>
            <span className="font-medium ml-2 text-xs">Verifying invitation...</span>
          </div>
        )}

        {status === "success" && (
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <div>
              <p className="font-semibold">Invitation Accepted!</p>
              <p>{message}</p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="p-3 bg-red-50 rounded-xl border border-red-100 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600 shrink-0" />
            <div>
              <p className="font-semibold">Acceptance Failed</p>
              <p>{message}</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
          <Link href="/auth/login">
            <Button variant="outline" size="sm" className="rounded-xl text-xs font-semibold px-4">
              Cancel
            </Button>
          </Link>
          
          <Button
            size="sm"
            onClick={handleAccept}
            disabled={status === "loading" || status === "success"}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold px-5 flex items-center gap-2"
          >
            {status === "loading" ? (
              <>
                <span>Activating</span>
                <Spinner />
              </>
            ) : status === "success" ? (
              "Activated ✓"
            ) : (
              "Accept Invitation"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
