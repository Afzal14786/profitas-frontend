"use client";

import { useEffect, useState } from "react";
import { Scale } from "lucide-react";
import { api, extractErrorMessage } from "@/lib/api";
import { ComplianceRecord } from "@/types";
import { formatDate, humanize } from "@/lib/format";
import Card from "@/components/ui/Card";
import ErrorBanner from "@/components/ui/ErrorBanner";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import StatusBadge from "@/components/features/StatusBadge";

export default function ComplianceTab({ propertyId }: { propertyId: string }) {
  const [items, setItems] = useState<ComplianceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    api
      .get(`/compliance?propertyId=${propertyId}&limit=50`)
      .then((r) => {
        if (cancelled) return;
        const payload = r.data.data;
        setItems(Array.isArray(payload) ? payload : payload.data || []);
      })
      .catch((err) => {
        if (!cancelled) setError(extractErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [propertyId]);

  if (loading) {
    return (
      <Card className="p-5 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </Card>
    );
  }

  if (error) return <ErrorBanner message={error} />;

  if (items.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={Scale}
          title="No compliance records"
          description="Compliance records for this property will appear here."
        />
      </Card>
    );
  }

  return (
    <Card className="divide-y divide-slate-100">
      {items.map((c) => (
        <div key={c.id} className="p-4 flex items-center justify-between gap-4">
          <div>
            <div className="font-medium text-slate-900">
              {humanize(c.complianceType)}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {c.remarks || "No remarks"} · {formatDate(c.createdAt)}
            </div>
          </div>
          <StatusBadge status={c.status} />
        </div>
      ))}
    </Card>
  );
}
