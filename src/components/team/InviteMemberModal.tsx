"use client";

import React from "react";
import { X, SendIcon, Mail, Lock, Users, InfoIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useInviteTeamMember } from "@/hooks/team.api";
import { useState } from "react";
import { toast } from "sonner";
import { Spinner } from "../ui/spinner";
import { Alert, AlertTitle } from "../ui/alert";
import { useSelector } from "react-redux";

type InviteMemberModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccessAction?: (title: string, message: string) => void;
};

export function InviteMemberModal({
  isOpen,
  onClose,
  onSuccessAction,
}: InviteMemberModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("12345678");
  const [role, setRole] = useState("Support Agent");
  const user = useSelector((state: any) => state.auth.user);

  const inviteMember = useInviteTeamMember();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !role) {
      toast.error("Please fill in all fields.");
      return;
    }
    inviteMember?.mutate(
      { email, temporary_password: password, password: password, role },
      {
        onSuccess: () => {
          if (onSuccessAction) {
            onSuccessAction(
              "Invitation Sent Successfully",
              "An email with a temporary password has been sent to the new team member.",
            );
          } else {
            onClose();
          }
          setEmail("");
          setPassword("12345678");
          setRole("Support Agent");
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-120 p-8 rounded-xl gap-6">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-xl font-semibold">
            Invite Team Member
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold block">Email</label>
            <div className="relative">
              <Input
                placeholder="colleague@company.com"
                className="h-10 bg-white"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold block">
              Temporary Password
            </label>
            <div className="relative">
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 bg-white"
                type="text"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold block">Role</label>
            <Select value={role} onValueChange={(val) => setRole(val || "")}>
              <SelectTrigger className="h-10! bg-white w-full">
                <SelectValue placeholder="Select the job Role" />
              </SelectTrigger>
              {user?.role === "owner" ? (
                <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                  <SelectItem value="Support Manager">
                    Support Manager
                  </SelectItem>
                  <SelectItem value="Support Agent">Support Agent</SelectItem>
                </SelectContent>
              ) : (
                <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                  <SelectItem value="Support Agent">Support Agent</SelectItem>
                </SelectContent>
              )}
            </Select>
          </div>
          {inviteMember?.error?.response?.data?.data[0]
            ? (inviteMember?.error?.response?.data?.data[0] ||
                inviteMember?.error?.response?.data?.message) && (
                <Alert className="max-w-md border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
                  <InfoIcon />
                  <AlertTitle>
                    {inviteMember?.error?.response?.data?.data[0] ||
                      inviteMember?.error?.response?.data?.message ||
                      "Something went wrong!"}
                  </AlertTitle>
                </Alert>
              )
            : (inviteMember?.error?.response?.data?.message ||
                inviteMember?.error?.response?.data?.data[0]) && (
                <Alert className="max-w-md border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
                  <InfoIcon />
                  <AlertTitle>
                    {inviteMember?.error?.response?.data?.message ||
                      inviteMember?.error?.response?.data?.data[0] ||
                      "Something went wrong!"}
                  </AlertTitle>
                </Alert>
              )}

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={inviteMember?.isPending}
              className="flex-1 h-10 bg-gray-50 border-none text-gray-700 font-bold hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={inviteMember?.isPending}
              className="flex-1 h-10 bg-linear-to-tr from-primary to-secondary text-black"
            >
              Send Invite {inviteMember?.isPending && <Spinner />}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
