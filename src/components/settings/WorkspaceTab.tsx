"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UploadCloud } from "lucide-react";
import { useSettings, useUpdateWorkspaceSettings } from "@/hooks/settings.api";
import { Spinner } from "@/components/ui/spinner";
import Image from "next/image";
import { toast } from "sonner";

export default function WorkspaceTab() {
  const { data: settingsData, isLoading } = useSettings();
  const { mutate: updateWorkspace, isPending: isUpdating } = useUpdateWorkspaceSettings();

  const [companyName, setCompanyName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (settingsData?.data?.company_details) {
      const { company_name, support_email, website_url, brand_logo } = settingsData.data.company_details;
      setCompanyName(company_name || "");
      setSupportEmail(support_email || "");
      setWebsiteUrl(website_url || "");
      if (brand_logo) setLogoPreview(brand_logo);
    }
  }, [settingsData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!companyName.trim()) newErrors.companyName = "Company name is required";
    if (!supportEmail.trim()) {
      newErrors.supportEmail = "Support email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail)) {
      newErrors.supportEmail = "Invalid email format";
    }
    if (websiteUrl.trim() && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(websiteUrl)) {
      newErrors.websiteUrl = "Invalid website URL";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Logo size should be less than 2MB");
        return;
      }
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    if (!validate()) return;

    const formData = new FormData();
    formData.append("company_name", companyName);
    formData.append("support_email", supportEmail);
    formData.append("website_url", websiteUrl);
    if (logo) {
      formData.append("logo", logo);
    }
    formData.append("_method", "PATCH");

    updateWorkspace(formData);
  };

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center bg-white p-8 rounded-2xl border border-gray-100">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Company Information section */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 space-y-8 h-fit">
        <div className="border-b border-gray-50 pb-4">
          <h2 className="text-xl font-semibold">Company Information</h2>
          <p className="text-sm font-normal text-gray-400">
            Update your company details
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[13px] font-semibold text-gray-600 ml-1 block">
              Company Name
            </label>
            <Input
              value={companyName}
              onChange={(e) => {
                setCompanyName(e.target.value);
                if (errors.companyName) setErrors({ ...errors, companyName: "" });
              }}
              className={`h-10 bg-white border-gray-200 transition-all font-medium ${errors.companyName ? "border-red-500 focus:ring-red-500" : ""}`}
              placeholder="Tixolve Demo Inc."
            />
            {errors.companyName && <p className="text-xs text-red-500 font-medium ml-1">{errors.companyName}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-[13px] font-semibold text-gray-600 ml-1 block">
              Support Email
            </label>
            <Input
              value={supportEmail}
              onChange={(e) => {
                setSupportEmail(e.target.value);
                if (errors.supportEmail) setErrors({ ...errors, supportEmail: "" });
              }}
              className={`h-10 bg-white border-gray-200 font-medium ${errors.supportEmail ? "border-red-500 focus:ring-red-500" : ""}`}
              placeholder="support@tixolve.io"
            />
            {errors.supportEmail && <p className="text-xs text-red-500 font-medium ml-1">{errors.supportEmail}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-[13px] font-semibold text-gray-600 ml-1 block">
              Website URL
            </label>
            <Input
              value={websiteUrl}
              onChange={(e) => {
                setWebsiteUrl(e.target.value);
                if (errors.websiteUrl) setErrors({ ...errors, websiteUrl: "" });
              }}
              className={`h-10 bg-white border-gray-200 font-medium ${errors.websiteUrl ? "border-red-500 focus:ring-red-500" : ""}`}
              placeholder="https://tixolve.io"
            />
            {errors.websiteUrl && <p className="text-xs text-red-500 font-medium ml-1">{errors.websiteUrl}</p>}
          </div>
        </div>

        <div className="pt-2">
          <Button
            onClick={handleSave}
            disabled={isUpdating}
            className="h-10 bg-[#B2E08A] hover:bg-[#A3D17B] text-gray-900 px-10 flex items-center gap-2"
          >
            {isUpdating && <Spinner className="size-4" />}
            {isUpdating ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Brand Logo section */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 space-y-8 h-fit">
        <div className="border-b border-gray-50 pb-4 text-left">
          <h2 className="text-xl font-semibold">Brand Logo</h2>
          <p className="text-sm font-normal text-gray-400">
            Update your company brand assets
          </p>
        </div>

        <div className="space-y-10">
          <div className="space-y-3">
            <label className="text-[13px] font-semibold text-gray-600 ml-1 block">
              Upload Logo
            </label>
            <label className="border-2 border-dashed border-gray-100 rounded-2xl p-10 flex flex-col items-center justify-center gap-3 bg-gray-50/50 hover:bg-gray-50 hover:border-[#B2E08A]/30 transition-all cursor-pointer group">
              <UploadCloud className="text-blue-500" size={28} />
              <div className="text-center">
                <p className="font-bold text-gray-900 text-sm">
                  Upload your logo
                </p>
                <p className="text-xs text-gray-400 font-medium mt-1">
                  PNG, JPG up to 2MB
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleLogoChange}
              />
            </label>
          </div>

          <div className="space-y-4">
            <label className="text-[13px] font-semibold text-gray-600 ml-1 block">
              Current Logo
            </label>
            <div className="flex items-center gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-center min-w-32 min-h-16 relative">
                {logoPreview ? (
                  <div className="relative w-32 h-16">
                    <Image
                      src={logoPreview}
                      alt="Logo"
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <p className="text-2xl font-black tracking-tighter text-gray-900 opacity-20">
                    No Logo
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
