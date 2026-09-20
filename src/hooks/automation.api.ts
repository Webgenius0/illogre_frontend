import { useApiMutation, useApiQuery } from "./mutation/useApiMutation";
import { useSelector } from "react-redux";

export interface AutomationMode {
  id: number;
  name: string;
  title: string;
  description: string;
  is_selected: boolean;
}

export interface AutomationZone {
  id: number;
  name: string;
  title: string;
  range: string;
  min: number;
  max: number;
  description: string;
  action_text: string;
}

export interface AutomationSettingsData {
  human_led_threshold: number;
  ai_assisted_threshold: number;
  last_updated_at: string;
  modes: AutomationMode[];
  zones: AutomationZone[];
}

export interface AutomationSettingsResponse {
  success: boolean;
  data: AutomationSettingsData;
  message: string;
}

export const useAutomationSettings = () => {
  const { user } = useSelector((state: any) => state.auth);
  const prefix = user?.role === "Support Manager" ? "/manager" : "/owner";

  return useApiQuery<AutomationSettingsResponse>({
    key: "automation-settings",
    endpoint: `${prefix}/automations/settings`,
    isPrivate: true,
  });
};

export const useSaveAutomationSettings = () => {
  const { user } = useSelector((state: any) => state.auth);
  const prefix = user?.role === "Support Manager" ? "/manager" : "/owner";

  return useApiMutation<
    any,
    any,
    { mode: string; human_led_threshold: number; ai_assisted_threshold: number }
  >({
    key: "save-automation-settings",
    endpoint: `${prefix}/automations/settings`,
    method: "post",
    isPrivate: true,
  });
};
