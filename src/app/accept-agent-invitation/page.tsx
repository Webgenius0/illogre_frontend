"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { axiosPublic } from "@/hooks/axios/useAxiosPublic";
import { useDispatch } from "react-redux";
import { setAuth } from "@/store/slices/authSlice";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle2, AlertCircle } from "lucide-react";

function AcceptAgentInvitationContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const dispatch = useDispatch();

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleAccept = async () => {
    if (!token) {
      toast.error("Invalid or missing invitation token.");
      return;
    }

    setStatus("loading");
    try {
      const response = await axiosPublic.get(
        `/auth/accept-agent-invitation?token=${encodeURIComponent(token)}`
      );

      const resData = response.data;
      if (resData?.success || resData?.status === "success" || resData?.data) {
        setStatus("success");
        setMessage(resData?.message || "Invitation accepted successfully!");
        
        if (resData?.access_token && resData?.data) {
          dispatch(
            setAuth({
              user: resData.data,
              token: resData.access_token,
              remember: true,
            })
          );
        }

        toast.success("Account activated!");
        setTimeout(() => {
          if (resData?.access_token) {
            router.push("/tickets");
          } else {
            router.push("/auth/login");
          }
        }, 2000);
      } else {
        setStatus("error");
        setMessage(resData?.message || "Failed to accept invitation.");
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
          <h3 className="text-lg font-semibold leading-none tracking-tight text-gray-900 flex items-center gap-2">
            Support Agent Invitation
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            You have been invited to join the Tixolve Support Team. Do you want to accept this invitation and activate your account?
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

export default function AcceptAgentInvitationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-sm font-medium text-gray-500">Loading invitation...</div>
      </div>
    }>
      <AcceptAgentInvitationContent />
    </Suspense>
  );
}
