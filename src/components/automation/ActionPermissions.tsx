import { AlertTriangle, ChevronRight, ShieldCheck } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { type AIActionPermission } from "@/lib/types/automation";

interface Props {
  permissions: AIActionPermission[];
  onToggle: (id: string, isEnabled: boolean) => void;
}

export function ActionPermissions({ permissions, onToggle }: Props) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "High":
        return "bg-rose-50 text-rose-500 border-rose-100";
      case "Medium":
        return "bg-amber-50 text-amber-500 border-amber-100";
      case "Low":
        return "bg-emerald-50 text-emerald-500 border-emerald-100";
      default:
        return "bg-gray-50 text-gray-500 border-gray-100";
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 lg:sticky lg:top-8">
      {/* Risk Warning */}
      <div className="bg-amber-50/50 border border-amber-100 rounded-md p-3 mb-6 flex items-start gap-4">
        <div className="text-amber-500">
          <AlertTriangle className="size-4 mt-1" />
        </div>
        <p className="text-xs text-amber-900 leading-relaxed font-medium">
          High-risk actions require additional confirmation. Always review
          before enabling.
        </p>
      </div>

      <div className="space-y-6">
        {permissions.map((action) => (
          <div
            key={action.id}
            className="flex items-center justify-between group"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-gray-900 hover:text-emerald-600 transition-colors cursor-default">
                  {action.name}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getRiskColor(action.riskLevel)}`}
                >
                  {action.riskLevel}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mr-4">
                {action.description}
              </p>
            </div>
            <Switch
              checked={action.isEnabled}
              onCheckedChange={(val) => onToggle(action.id, val)}
              className="mt-1"
            />
          </div>
        ))}
      </div>

      <div className="h-px bg-gray-50 my-6" />

      {/* Safety Settings */}
      <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50 text-[#2F80ED]">
        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" />
          Safety Settings
        </h4>
        <div className="space-y-3">
          {[
            "Require human approval for refunds > $100",
            "Max 5 auto-actions per ticket",
            "Block actions on VIP customers",
          ].map((setting, i) => (
            <div
              key={i}
              className="flex items-center gap-3 text-xs font-medium"
            >
              <ChevronRight className="h-3 w-3" />
              <span>{setting}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
