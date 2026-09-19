"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { api, extractErrorMessage } from "@/lib/api";
import { Verification } from "@/types";
import { formatDate, humanize } from "@/lib/format";
import Card from "@/components/ui/Card";
import ErrorBanner from "@/components/ui/ErrorBanner";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import StatusBadge from "@/components/features/StatusBadge";

export default function VerificationsTab({
  propertyId,
}: {
  propertyId: string;
}) {
  const [items, setItems] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    api
      .get(`/verifications?propertyId=${propertyId}&limit=50`)
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
          icon={ShieldCheck}
          title="No verifications yet"
          description="Legal verifications for this property will appear here."
        />
      </Card>
    );
  }

  return (
    <Card className="divide-y divide-slate-100">
      {items.map((v) => (
        <div key={v.id} className="p-4 flex items-center justify-between gap-4">
          <div>
            <div className="font-medium text-slate-900">
              {humanize(v.verificationType)}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {v.remarks || "No remarks"} · {formatDate(v.createdAt)}
            </div>
          </div>
          <StatusBadge status={v.status} />
        </div>
      ))}
    </Card>
  );
}
