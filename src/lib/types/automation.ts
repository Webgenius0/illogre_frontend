export type ActionRiskLevel = "High" | "Medium" | "Low";

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  condition: {
    parameter: string;
    operator: string;
    value: string;
  };
  action: string;
  triggerCount: number;
  isEnabled: boolean;
}

export interface AIActionPermission {
  id: string;
  name: string;
  description: string;
  riskLevel: ActionRiskLevel;
  isEnabled: boolean;
}

export interface AutomationActivity {
  id: string;
  actionName: string;
  ticketId: string;
  customerName: string;
  timestamp: string;
  status: "Success" | "Failed" | "Pending";
  triggeredBy: string;
  confidence: number;
  reason: string;
  source: string;
}

export interface AutomationStats {
  activeRules: number;
  totalTriggered: number;
  aiActionsEnabled: number;
  automationRate: string;
}
