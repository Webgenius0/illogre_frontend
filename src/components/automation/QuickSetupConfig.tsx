import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  useAutomationSettings,
  useSaveAutomationSettings
} from "@/hooks/automation.api";

export function QuickSetupConfig() {
  const { data: response, isLoading, refetch } = useAutomationSettings();
  const { mutateAsync: saveSettings } = useSaveAutomationSettings();

  const [modeId, setModeId] = useState<number | null>(null);
  const [humanLedThreshold, setHumanLedThreshold] = useState(60);
  const [aiAssistedThreshold, setAiAssistedThreshold] = useState(80);
  const [isSaving, setIsSaving] = useState(false);
  const [isModeSwitching, setIsModeSwitching] = useState(false);

  useEffect(() => {
    if (response?.data) {
      setHumanLedThreshold(response.data.human_led_threshold);
      setAiAssistedThreshold(response.data.ai_assisted_threshold);
      const selectedMode = response.data.modes.find((m: any) => m.is_selected);
      if (selectedMode) setModeId(selectedMode.id);
    }
  }, [response]);

  const initialHumanLed = Number(response?.data?.human_led_threshold ?? 60);
  const initialAiAssisted = Number(response?.data?.ai_assisted_threshold ?? 80);

  const hasChanges =
    !isModeSwitching &&
    (Number(humanLedThreshold) !== initialHumanLed ||
      Number(aiAssistedThreshold) !== initialAiAssisted);

  const handleCancel = () => {
    setHumanLedThreshold(initialHumanLed);
    setAiAssistedThreshold(initialAiAssisted);
  };

  const getModeName = (id: number | null) => {
    if (id === null) return "copilot";
    const foundMode = response?.data?.modes?.find((m: any) => Number(m.id) === Number(id));
    return foundMode ? foundMode.name : "copilot";
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        mode: getModeName(modeId),
        human_led_threshold: Number(humanLedThreshold),
        ai_assisted_threshold: Number(aiAssistedThreshold)
      };
      await saveSettings(payload);
      await refetch();
      toast.success("Settings updated successfully");
    } catch (error) {
      console.error("Failed to save changes", error);
      toast.error("Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleModeChange = async (id: number) => {
    setIsModeSwitching(true);
    setModeId(id);
    const modeName = getModeName(id).toLowerCase();

    // Get percentages based on the selected mode from the API response
    let newHuman = humanLedThreshold;
    let newAi = aiAssistedThreshold;

    const targetMode = response?.data?.modes?.find((m: any) => m.id === id);
    if ((targetMode as any)?.zones?.length >= 2) {
      newHuman = (targetMode as any).zones[0].max;
      newAi = (targetMode as any).zones[1].max;
    }

    setHumanLedThreshold(newHuman);
    setAiAssistedThreshold(newAi);

    try {
      const payload = {
        mode: getModeName(id),
        human_led_threshold: newHuman,
        ai_assisted_threshold: newAi
      };
      await saveSettings(payload);
      await refetch();
    } catch (error) {
      console.error("Failed to update mode", error);
    } finally {
      setIsModeSwitching(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-24 bg-gray-100 rounded-xl w-full"></div>
        <div className="h-10 bg-gray-100 rounded-md w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-12 bg-gray-100 rounded-xl"></div>
          <div className="h-12 bg-gray-100 rounded-xl"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="h-40 bg-gray-100 rounded-2xl"></div>
          <div className="h-40 bg-gray-100 rounded-2xl"></div>
          <div className="h-40 bg-gray-100 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const modes = response?.data?.modes || [];
  const selectedModeData = modes.find((m: any) => m.id === modeId) || modes[0];
  const zones = (selectedModeData as any)?.zones || [];

  const getTimeAgo = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return "just now";
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days === 1) return "yesterday";
    return `${days} days ago`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Quick Setup Section */}
      <div className="space-y-4">
        <h3 className="text-[15px] font-bold text-gray-900">Quick Setup</h3>
        {modes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {modes.map((mode, index) => {
              const isSelected = modeId === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => handleModeChange(mode.id)}
                  className={cn(
                    "flex items-start p-5 text-left transition-colors duration-200 relative cursor-pointer",
                    index !== modes.length - 1 ? "border-r border-gray-200" : "",
                    isSelected
                      ? "bg-[#f4f5f7] border-b-[3px] border-b-gray-900"
                      : "bg-white hover:bg-gray-50/50 border-b-[3px] border-b-transparent"
                  )}
                >
                  <div className="flex-1">
                    <h4 className="text-[15px] font-bold text-gray-900">
                      {mode.title}
                    </h4>
                    <p className="text-[13px] text-gray-500 mt-1.5 font-medium">
                      {mode.description}
                    </p>
                  </div>
                  <div className="ml-4 flex items-center justify-center mt-0.5">
                    <div className={cn(
                      "flex items-center justify-center h-5 w-5 rounded-full border",
                      isSelected ? "border-gray-900 border-[2px]" : "border-gray-300"
                    )}>
                      {isSelected && (
                        <div className="h-2 w-2 rounded-full bg-gray-900" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
        {response?.data?.last_updated_at && (
          <p className="text-[13px] font-medium text-gray-400 capitalize">
            Last updated {getTimeAgo(response.data.last_updated_at)}: {getModeName(modeId).replace("-", " ")}
          </p>
        )}
      </div>

      <div className="h-px w-full bg-gray-200/60" />

      {/* Decision Thresholds Section */}
      <div className="space-y-6">
        <div>
          <h3 className="text-[15px] font-bold text-gray-900">Decision Thresholds</h3>
          <p className="text-[13px] font-medium text-gray-500 mt-1">
            All three zones are always active. Set the boundaries based on AI confidence.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex h-[30px] rounded-md overflow-hidden text-[13px] font-medium text-gray-900">
          {humanLedThreshold > 0 && (
            <div
              className="bg-[#c4bcae] flex items-center justify-center transition-all duration-300 overflow-hidden"
              style={{ width: `${humanLedThreshold}%` }}
            >
              <span className="truncate px-1">Human-led</span>
            </div>
          )}
          {(aiAssistedThreshold - humanLedThreshold) > 0 && (
            <div
              className="bg-[#e9c77b] flex items-center justify-center transition-all duration-300 overflow-hidden"
              style={{ width: `${aiAssistedThreshold - humanLedThreshold}%` }}
            >
              <span className="truncate px-1">AI-assisted</span>
            </div>
          )}
          {(100 - aiAssistedThreshold) > 0 && (
            <div
              className="bg-[#84c984] flex items-center justify-center transition-all duration-300 overflow-hidden"
              style={{ width: `${100 - aiAssistedThreshold}%` }}
            >
              <span className="truncate px-1">AI-driven</span>
            </div>
          )}
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="h-1.5 w-1.5 rounded-full bg-[#c4bcae]" />
              <span className="text-[14px] font-medium text-gray-500">Human-led up to</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={100}
                value={humanLedThreshold}
                onChange={(e) => setHumanLedThreshold(Number(e.target.value))}
                onBlur={() => {
                  let val = humanLedThreshold;
                  if (val < 0) val = 0;
                  if (val > 100) val = 100;
                  if (val > aiAssistedThreshold) val = aiAssistedThreshold;
                  setHumanLedThreshold(val);
                }}
                className="w-[60px] h-8 text-center text-[15px] font-bold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c4bcae]"
              />
              <span className="text-[14px] font-medium text-gray-500">%</span>
            </div>
          </div>

          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="h-1.5 w-1.5 rounded-full bg-[#e9c77b]" />
              <span className="text-[14px] font-medium text-gray-500">AI-assisted up to</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={100}
                value={aiAssistedThreshold}
                onChange={(e) => setAiAssistedThreshold(Number(e.target.value))}
                onBlur={() => {
                  let val = aiAssistedThreshold;
                  if (val < 0) val = 0;
                  if (val > 100) val = 100;
                  if (val < humanLedThreshold) val = humanLedThreshold;
                  setAiAssistedThreshold(val);
                }}
                className="w-[60px] h-8 text-center text-[15px] font-bold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e9c77b]"
              />
              <span className="text-[14px] font-medium text-gray-500">%</span>
            </div>
          </div>

          {/* Empty div for the 3rd column */}
          <div></div>
        </div>

        {/* Cards */}
        {zones.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* Human-led Card */}
            <div className="bg-white rounded-[20px] p-6 border border-gray-200 border-t-[3px] border-t-gray-300 shadow-sm flex flex-col justify-between h-full min-h-[220px]">
              <div>
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#c4bcae]" />
                  <span className="text-[13px] font-bold text-gray-700">{zones[0].title}</span>
                </div>
                <h4 className="text-[22px] font-bold text-gray-900 mb-3">0-{humanLedThreshold}%</h4>
                <p className="text-[13px] text-gray-500 leading-relaxed font-medium">
                  {zones[0].description}
                </p>
              </div>
              <div className="bg-[#f0eee9] px-4 py-3 rounded-lg text-[14px] font-bold text-gray-900 mt-6">
                {zones[0].action_text}
              </div>
            </div>

            {/* AI-assisted Card */}
            <div className="bg-white rounded-[20px] p-6 border border-gray-200 border-t-[3px] border-t-[#e9c77b] shadow-sm flex flex-col justify-between h-full min-h-[220px]">
              <div>
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#e9c77b]" />
                  <span className="text-[13px] font-bold text-gray-700">{zones[1].title}</span>
                </div>
                <h4 className="text-[22px] font-bold text-gray-900 mb-3">{humanLedThreshold}-{aiAssistedThreshold}%</h4>
                <p className="text-[13px] text-gray-500 leading-relaxed font-medium">
                  {zones[1].description}
                </p>
              </div>
              <div className="bg-[#fdf8eb] px-4 py-3 rounded-lg text-[14px] font-bold text-[#b59032] mt-6">
                {zones[1].action_text}
              </div>
            </div>

            {/* AI-driven Card */}
            <div className="bg-white rounded-[20px] p-6 border border-gray-200 border-t-[3px] border-t-[#84c984] shadow-sm flex flex-col justify-between h-full min-h-[220px]">
              <div>
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#84c984]" />
                  <span className="text-[13px] font-bold text-gray-700">{zones[2].title}</span>
                </div>
                <h4 className="text-[22px] font-bold text-gray-900 mb-3">{aiAssistedThreshold}-100%</h4>
                <p className="text-[13px] text-gray-500 leading-relaxed font-medium">
                  {zones[2].description}
                </p>
              </div>
              <div className="bg-[#eef8ec] px-4 py-3 rounded-lg text-[14px] font-bold text-[#3d7a3d] mt-6">
                {zones[2].action_text}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Save Modal/Bar */}
      {hasChanges && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200 px-6 py-4 flex items-center gap-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <span className="text-[14px] font-bold text-gray-700">You have unsaved changes</span>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-5 py-2 text-[14px] font-bold text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 text-[14px] font-bold text-white bg-gray-900 hover:bg-gray-800 rounded-full transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
