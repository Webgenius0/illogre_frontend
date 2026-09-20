"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Eye,
  EyeOff,
} from "lucide-react";
import { useUpdateSecuritySettings } from "@/hooks/settings.api";
import { Spinner } from "@/components/ui/spinner";

export default function SecurityTab() {
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: updateSecurity, isPending: isUpdating } =
    useUpdateSecuritySettings();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!currentPassword)
      newErrors.currentPassword = "Current password is required";
    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }
    if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdatePassword = () => {
    if (!validate()) return;
    updateSecurity({
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: confirmPassword,
    });
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Password Security Settings Section */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 space-y-8 w-full max-w-4xl">
        <div>
          <h2 className="text-xl font-semibold">Security Settings</h2>
          <p className="text-sm font-medium text-gray-400">
            Manage your account security
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[13px] font-semibold text-gray-600 block">
              Current Password
            </label>
            <div className="relative group">
              <Input
                type={showPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  if (errors.currentPassword)
                    setErrors({ ...errors, currentPassword: "" });
                }}
                placeholder="********"
                className={`h-10 bg-white border-gray-200 font-medium pr-12 ${errors.currentPassword ? "border-red-500 focus:ring-red-500" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#B2E08A] transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-xs text-red-500 font-medium">
                {errors.currentPassword}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-semibold text-gray-600 block">
              New Password
            </label>
            <div className="relative group">
              <Input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errors.newPassword)
                    setErrors({ ...errors, newPassword: "" });
                }}
                placeholder="********"
                className={`h-10 bg-white border-gray-200 font-medium pr-12 ${errors.newPassword ? "border-red-500 focus:ring-red-500" : ""}`}
              />
            </div>
            {errors.newPassword && (
              <p className="text-xs text-red-500 font-medium">
                {errors.newPassword}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-semibold text-gray-600 block">
              Confirm New Password
            </label>
            <div className="relative group">
              <Input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword)
                    setErrors({ ...errors, confirmPassword: "" });
                }}
                placeholder="********"
                className={`h-10 bg-white border-gray-200 font-medium pr-12 ${errors.confirmPassword ? "border-red-500 focus:ring-red-500" : ""}`}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 font-medium">
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </div>

        <div className="pt-2">
          <Button
            onClick={handleUpdatePassword}
            disabled={isUpdating}
            className="h-10 bg-[#B2E08A] hover:bg-[#A3D17B] text-gray-900 px-10 flex items-center gap-2"
          >
            {isUpdating && <Spinner className="size-4" />}
            {isUpdating ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </div>
    </div>
  );
}
