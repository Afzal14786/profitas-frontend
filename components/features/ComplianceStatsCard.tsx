"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ComplianceStats } from "@/types";
import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";

export default function ComplianceStatsCard() {
  const [stats, setStats] = useState<ComplianceStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ data: ComplianceStats }>("/compliance/stats")
      .then((r) => setStats(r.data.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card className="p-4">
        <Skeleton className="h-14 w-full" />
      </Card>
    );
  }
  if (!stats) return null;

  const items = [
    { label: "Total", value: stats.total, cls: "text-slate-800" },
    { label: "Pending", value: stats.pending, cls: "text-amber-600" },
    { label: "In Review", value: stats.inReview, cls: "text-blue-600" },
    { label: "Compliant", value: stats.compliant, cls: "text-green-600" },
    { label: "Non-Compliant", value: stats.nonCompliant, cls: "text-red-600" },
  ];

  return (
    <Card className="p-4">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {items.map((it) => (
          <div key={it.label}>
            <div className="text-xs uppercase tracking-wide text-slate-400">
              {it.label}
            </div>
            <div className={`text-xl font-bold mt-1 ${it.cls}`}>{it.value}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
