"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { axiosPublic } from "@/hooks/axios/useAxiosPublic";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function AcceptInvitationPage() {
  const params = useParams();
  const token = params?.token as string;
  const router = useRouter();

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleAccept = async () => {
    if (!token) return;
    setStatus("loading");
    try {
      const response = await axiosPublic.post(
        `/auth/accept-invitation/${token}`
      );

      if (response.data?.success || response.data?.status === "success" || response.data?.data) {
        setStatus("success");
        setMessage(response.data?.message || "Invitation accepted successfully!");
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      } else {
        setStatus("error");
        setMessage(response.data?.message || "Failed to accept invitation.");
      }
    } catch (error: any) {
      setStatus("error");
      setMessage(
        error.response?.data?.message ||
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
            You have been invited to join a workspace team on Tixolve. Do you want to accept this invitation and activate your account?
          </p>
        </div>

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
