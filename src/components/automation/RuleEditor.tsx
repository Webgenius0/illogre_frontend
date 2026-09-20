import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type AutomationRule } from "@/lib/types/automation";

interface Props {
  rule?: AutomationRule | null;
  onSave: (rule: AutomationRule) => void;
  onCancel: () => void;
}

export function RuleEditor({ rule, onSave, onCancel }: Props) {
  const [formData, setFormData] = useState<Partial<AutomationRule>>({
    name: "",
    description: "",
    condition: {
      parameter: "AI Confidence Score",
      operator: "Greater than",
      value: "90%",
    },
    action: "Auto Resolve ticket",
    isEnabled: true,
    triggerCount: 0,
  });

  useEffect(() => {
    if (rule) {
      setFormData(rule);
    }
  }, [rule]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: rule?.id || Math.random().toString(36).substr(2, 9),
    } as AutomationRule);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="h-10 w-10 bg-white border border-gray-100 hover:bg-gray-50"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">
            {rule ? "Edit Automation Rule" : "Create Automation Rule"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Define conditions and actions to automate ticket resolution.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rule Info */}
        <div className="bg-white rounded-2xl p-6">
          <h3 className="text-sm font-semibold mb-6 flex items-center gap-2">
            Rule Information
          </h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold block">Rule Name</label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="High Confidence Auto Resolve"
                className="h-10 bg-gray-50/50 border-gray-100 text-sm"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold block">
                Rule Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Briefly describe what this rule does..."
                className="w-full h-24 p-4 rounded-md bg-gray-50/50 border border-gray-100 text-sm outline-none resize-none"
                required
              />
            </div>
          </div>
        </div>

        {/* Conditions */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="text-sm font-semibold mb-6 flex items-center gap-2">
            Conditions
          </h3>
          <p className="text-xs text-muted-foreground mb-6">
            Set the criteria that must be met for this rule to trigger.
          </p>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="px-4 flex items-center justify-center h-10 rounded-md border border-gray-100 text-sm font-medium">
              If
            </div>
            <div className="flex-1 w-full">
              <Select
                value={formData.condition?.parameter}
                onValueChange={(val) =>
                  setFormData((p) => ({
                    ...p,
                    condition: {
                      parameter: val ?? "",
                      operator: p.condition?.operator ?? "",
                      value: p.condition?.value ?? "",
                    },
                  }))
                }
              >
                <SelectTrigger className="h-10! w-full bg-gray-50/50 border-gray-100 text-sm">
                  <SelectValue placeholder="AI Confidence Score" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AI Confidence Score">
                    AI Confidence Score
                  </SelectItem>
                  <SelectItem value="Customer Loyalty Tier">
                    Customer Loyalty Tier
                  </SelectItem>
                  <SelectItem value="Ticket Sentiment">
                    Ticket Sentiment
                  </SelectItem>
                  <SelectItem value="Total Orders">Total Orders</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 w-full">
              <Select
                value={formData.condition?.operator}
                onValueChange={(val) =>
                  setFormData((p) => ({
                    ...p,
                    condition: {
                      parameter: val ?? "",
                      operator: p.condition?.operator ?? "",
                      value: p.condition?.value ?? "",
                    },
                  }))
                }
              >
                <SelectTrigger className="h-10! w-full bg-gray-50/50 border-gray-100 text-sm">
                  <SelectValue placeholder="Greater than" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Greater than">Greater than</SelectItem>
                  <SelectItem value="Less than">Less than</SelectItem>
                  <SelectItem value="Equal to">Equal to</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 w-full">
              <Input
                value={formData.condition?.value}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    condition: { ...p.condition!, value: e.target.value },
                  }))
                }
                className="h-10 bg-gray-50/50 border-gray-100 text-sm"
                required
              />
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-full w-2 bg-linear-to-b from-indigo-500/10 to-transparent transition-opacity opacity-0 group-hover:opacity-100" />
          <h3 className="text-sm font-semibold mb-6 flex items-center">
            Action
          </h3>
          <p className="text-xs text-muted-foreground mb-6">
            Select what the AI should do when the conditions are met.
          </p>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="px-4 h-10 flex items-center justify-center rounded-md border border-gray-100 text-sm font-medium">
              Then
            </div>
            <div className="flex-1 w-full">
              <Select
                value={formData.action}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, action: val ?? undefined }))
                }
              >
                <SelectTrigger className="h-10! w-full bg-gray-50/50 border-gray-100 text-sm">
                  <SelectValue placeholder="Auto Resolve ticket" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Auto Resolve ticket">
                    Auto Resolve ticket
                  </SelectItem>
                  <SelectItem value="Route to agent review queue">
                    Route to agent review queue
                  </SelectItem>
                  <SelectItem value="Escalate to VIP support">
                    Escalate to VIP support
                  </SelectItem>
                  <SelectItem value="Flag for immediate review">
                    Flag for immediate review
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Rule Preview */}
        <div className="bg-white rounded-2xl p-6 border border-indigo-100 flex items-start gap-2 shadow-sm shadow-indigo-100/50">
          <div className="text-indigo-500">
            <Eye className="h-5 w-5" />
          </div>
          <div className="flex-1 mb-2">
            <div className="text-sm font-semibold ">Rule Preview</div>
            <p className="text-sm text-gray-900 font-medium p-2 mt-2 border rounded-md">
              If {formData.condition?.parameter || "parameter"}{" "}
              {formData.condition?.operator.toLowerCase() || "is"}{" "}
              {formData.condition?.value || '"value"'} Then{" "}
              {formData.action?.toLowerCase() || "action"}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="h-10 px-8 bg-white border border-gray-100 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="h-10 px-8 bg-[#add633] hover:bg-[#9cc122] text-foreground gap-2"
          >
            <Save className="h-5 w-5" />
            {rule ? "Save Changes" : "Save Rule"}
          </Button>
        </div>
      </form>
    </div>
  );
}
