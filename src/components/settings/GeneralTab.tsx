"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSettings, useUpdateGeneralSettings } from "@/hooks/settings.api";
import { Spinner } from "@/components/ui/spinner";
import { Camera } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

export default function GeneralTab() {
  const { data: settingsData, isLoading } = useSettings();
  const { mutate: updateGeneral, isPending: isUpdating } =
    useUpdateGeneralSettings();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (settingsData?.data?.personal_details) {
      const { name, email, phone_number, avatar_url } =
        settingsData.data.personal_details;
      setName(name || "");
      setEmail(email || "");
      setPhoneNumber(phone_number || "");
      if (avatar_url) setAvatarPreview(avatar_url);
    }
  }, [settingsData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Full name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Avatar size should be less than 2MB");
        return;
      }
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    if (!validate()) return;

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("phone_number", phoneNumber);
    if (avatar) {
      formData.append("avatar", avatar);
    }
    formData.append("_method", "PATCH");

    updateGeneral(formData);
  };

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center bg-white p-8 rounded-2xl border border-gray-100">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-2xl border border-gray-100 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-semibold">General Settings</h2>
          <p className="text-sm font-normal text-gray-400">
            Update your personal information
          </p>
        </div>

        <div className="relative group w-24 h-24">
          <div className="w-full h-full rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 relative">
            {avatarPreview ? (
              <Image
                src={avatarPreview}
                alt="Avatar"
                fill
                loading="eager"
                sizes="100"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <Camera size={32} />
              </div>
            )}
          </div>
          <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#B2E08A] rounded-lg flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform">
            <Camera size={16} className="text-gray-900" />
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleAvatarChange}
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="space-y-2">
          <label className="text-[13px] font-medium text-gray-700 block">
            Full Name
          </label>
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors({ ...errors, name: "" });
            }}
            className={`h-10 ${errors.name ? "border-red-500 focus:ring-red-500" : ""}`}
            placeholder="John Doe"
          />
          {errors.name && (
            <p className="text-xs text-red-500 font-medium">{errors.name}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-[13px] font-medium text-gray-700 block">
            Email
          </label>
          <Input
            value={email}
            readOnly
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: "" });
            }}
            className={`h-10 bg-gray-50 ${errors.email ? "border-red-500 focus:ring-red-500" : ""}`}
            placeholder="john@example.com"
          />
          {errors.email && (
            <p className="text-xs text-red-500 font-medium">{errors.email}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-[13px] font-medium text-gray-700 block">
            Phone Number
          </label>
          <Input
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="h-10"
            placeholder="+8801234567"
          />
        </div>
      </div>

      <div className="pt-2">
        <Button
          onClick={handleSave}
          disabled={isUpdating}
          className="h-10 bg-[#B2E08A] hover:bg-[#A3D17B] text-foreground px-10 flex items-center gap-2"
        >
          {isUpdating && <Spinner className="size-4" />}
          {isUpdating ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
