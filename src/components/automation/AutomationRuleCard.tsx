import React from "react";
import { Zap, MoreVertical, Edit, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type AutomationRule } from "@/lib/types/automation";

interface Props {
  rule: AutomationRule;
  onEdit: (rule: AutomationRule) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, isEnabled: boolean) => void;
}

export function AutomationRuleCard({
  rule,
  onEdit,
  onDelete,
  onToggle,
}: Props) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-4 transition-all hover:shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-emerald-50 text-emerald-500">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 leading-none mb-1">
              {rule.name}
            </h3>
            <p className="text-sm text-muted-foreground">{rule.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Switch
            checked={rule.isEnabled}
            onCheckedChange={(val) => onToggle(rule.id, val)}
          />
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={() => onEdit(rule)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(rule.id)}
                className="text-rose-500 focus:text-rose-500"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-gray-50">
        <div className="flex items-center flex-wrap gap-2 text-xs font-semibold">
          <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full flex gap-1">
            IF{" "}
            <span className="text-gray-900 capitalize">
              {rule.condition.parameter} {rule.condition.operator}{" "}
              {rule.condition.value}
            </span>
          </span>
          <span className="text-gray-400">→</span>
          <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full flex gap-1">
            THEN <span className="text-gray-900 capitalize">{rule.action}</span>
          </span>
        </div>
        <div className="text-xs text-muted-foreground whitespace-nowrap">
          Triggered{" "}
          <span className="font-bold text-gray-900">
            {rule.triggerCount.toLocaleString()}
          </span>{" "}
          times
        </div>
      </div>
    </div>
  );
}
