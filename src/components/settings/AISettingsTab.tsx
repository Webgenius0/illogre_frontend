"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Info } from "lucide-react";
import { useSettings, useUpdateAiSettings } from "@/hooks/settings.api";
import { Spinner } from "@/components/ui/spinner";

export default function AISettingsTab() {
  const { data: settingsData, isLoading } = useSettings();
  const { mutate: updateAi, isPending: isUpdating } = useUpdateAiSettings();

  const [tone, setTone] = useState<"friendly" | "professional" | "formal">(
    "professional",
  );
  const [agentName, setAgentName] = useState("Tixolve AI");
  const [language, setLanguage] = useState<null | string>("auto");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (settingsData?.data?.ai_settings) {
      const ai = settingsData.data.ai_settings;
      setTone(ai.ai_tone || "professional");
      setAgentName(ai.ai_agent_name || "Tixolve AI");
      setLanguage(ai.ai_response_language || "auto");
    }
  }, [settingsData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!agentName.trim()) newErrors.agentName = "AI agent name is required";
    // Secret key might be optional or pre-filled on server
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const tones = [
    { id: "friendly", emoji: "😊", label: "Friendly" },
    { id: "professional", emoji: "💼", label: "Professional" },
    { id: "formal", emoji: "📋", label: "Formal" },
  ];

  const languages = [
    { label: "Auto-detect customer language", value: "auto" },
    { label: "English", value: "en" },
    { label: "Spanish", value: "es" },
    { label: "French", value: "fr" },
    { label: "German", value: "de" },
    { label: "Portuguese", value: "pt" },
    { label: "Arabic", value: "ar" },
    { label: "Japanese", value: "ja" },
  ];

  const handleSave = () => {
    if (!validate()) return;
    updateAi({
      ai_tone: tone,
      ai_agent_name: agentName,
      ai_response_language: language,
    });
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
      {/* AI Settings Section */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 space-y-10">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            AI Settings
          </h2>
          <p className="text-sm font-normal text-gray-400">
            Update your AI Assistant settings
          </p>
        </div>

        <div className="space-y-8">
          {/* Tone Selector */}
          <div className="grid grid-cols-3 gap-4">
            {tones.map((t) => (
              <button
                key={t.id}
                onClick={() => setTone(t.id as any)}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 gap-2 group ${
                  tone === t.id
                    ? `border-[#B2E08A] bg-[#B2E08A]/5`
                    : `border-gray-50 bg-white hover:border-gray-100`
                }`}
              >
                <span className={`text-2xl`}>{t.emoji}</span>
                <span
                  className={`text-[12px] font-semibold ${tone === t.id ? "text-gray-900" : "text-gray-400"}`}
                >
                  {t.label}
                </span>
              </button>
            ))}
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-gray-600 ml-1 block">
                AI Agent Name
              </label>
              <Input
                value={agentName}
                onChange={(e) => {
                  setAgentName(e.target.value);
                  if (errors.agentName) setErrors({ ...errors, agentName: "" });
                }}
                className={`h-10 bg-white border-gray-200 font-medium ${errors.agentName ? "border-red-500 focus:ring-red-500" : ""}`}
              />
              {errors.agentName && (
                <p className="text-xs text-red-500 font-medium ml-1">
                  {errors.agentName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-gray-600 ml-1 block">
                Response Language
              </label>
              <Select value={language || ""} onValueChange={setLanguage}>
                <SelectTrigger className="h-10! w-full bg-white border-gray-200">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  {languages?.map((item, index) => (
                    <SelectItem key={index} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>


        </div>

        <div className="pt-2">
          <Button
            onClick={handleSave}
            disabled={isUpdating}
            className="w-full h-10 bg-[#B2E08A] hover:bg-[#A3D17B] text-gray-900 flex items-center justify-center gap-2"
          >
            {isUpdating && <Spinner className="size-4" />}
            {isUpdating ? "Saving..." : "Save AI Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}
