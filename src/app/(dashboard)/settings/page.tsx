"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import GeneralTab from "@/components/settings/GeneralTab";
import WorkspaceTab from "@/components/settings/WorkspaceTab";
import AISettingsTab from "@/components/settings/AISettingsTab";
import NotificationsTab from "@/components/settings/NotificationsTab";
import SecurityTab from "@/components/settings/SecurityTab";
import {
  User,
  Globe,
  Sparkles,
  Bell,
  Shield,
  Settings as SettingsIcon,
} from "lucide-react";
import { useSelector } from "react-redux";

type SettingTab = "general" | "workspace" | "ai" | "notifications" | "security";

function SettingsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabFromUrl = searchParams.get("tab") as SettingTab | null;
  const [activeTab, setActiveTab] = useState<SettingTab>(
    tabFromUrl || "general",
  );
  const user = useSelector((state: any) => state.auth.user);

  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const handleTabChange = (tabId: SettingTab) => {
    setActiveTab(tabId);
    router.push(`/settings?tab=${tabId}`, { scroll: false });
  };

  const tabs =
    user?.role == "owner"
      ? [
          { id: "general", label: "General", icon: <User size={18} /> },
          { id: "workspace", label: "Workspace", icon: <Globe size={18} /> },
          // { id: "ai", label: "AI Settings", icon: <Sparkles size={18} /> },
          {
            id: "notifications",
            label: "Notifications",
            icon: <Bell size={18} />,
          },
          { id: "security", label: "Security", icon: <Shield size={18} /> },
        ]
      : [
          { id: "general", label: "General", icon: <User size={18} /> },

          {
            id: "notifications",
            label: "Notifications",
            icon: <Bell size={18} />,
          },
          { id: "security", label: "Security", icon: <Shield size={18} /> },
        ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return <GeneralTab />;
      case "workspace":
        return <WorkspaceTab />;

      case "notifications":
        return <NotificationsTab />;
      case "security":
        return <SecurityTab />;
      default:
        return <GeneralTab />;
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-3 duration-400">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-gray-100/50">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-semibold flex items-center gap-3">
            Settings
          </h1>
          <p className="text-gray-400 font-medium text-sm">
            Manage your workspace and preferences
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto pb-4 scrollbar-hide">
        <div className="inline-flex p-1.5 bg-white rounded-sm border border-gray-100 relative group overflow-hidden">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as SettingTab)}
              className={`relative px-8 py-2 rounded-sm text-sm font-medium transition-all duration-300 flex items-center gap-2.5 whitespace-nowrap z-10 ${
                activeTab === tab.id
                  ? "text-gray-900"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-50/50"
              }`}
            >
              <span
                className={`transition-transform duration-300 ${activeTab === tab.id ? "scale-110" : "scale-100"}`}
              ></span>
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute inset-0 bg-linear-to-r from-secondary to-primary rounded-sm -z-10 animate-in zoom-in-95 duration-300" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Section */}
      <div className="min-h-125">{renderTabContent()}</div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <React.Suspense fallback={null}>
      <SettingsPageContent />
    </React.Suspense>
  );
}
