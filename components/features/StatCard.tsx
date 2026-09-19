import { LucideIcon } from "lucide-react";
import Card from "@/components/ui/Card";

type Color = "blue" | "emerald" | "purple" | "amber";

const colorMap: Record<Color, string> = {
  blue: "bg-blue-50 text-blue-600",
  emerald: "bg-emerald-50 text-emerald-600",
  purple: "bg-purple-50 text-purple-600",
  amber: "bg-amber-50 text-amber-600",
};

export default function StatCard({
  icon: Icon,
  label,
  value,
  color = "blue",
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
  color?: Color;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorMap[color]}`}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <div className="text-2xl font-bold text-slate-900 leading-tight">
            {value}
          </div>
          <div className="text-sm text-slate-500 truncate">{label}</div>
        </div>
      </div>
    </Card>
  );
}