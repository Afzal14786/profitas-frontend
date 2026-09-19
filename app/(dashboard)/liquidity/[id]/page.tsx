"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, XCircle } from "lucide-react";
import { api, extractErrorMessage } from "@/lib/api";
import { LiquidityRequest } from "@/types";
import { formatCrores, formatDate, humanize } from "@/lib/format";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ErrorBanner from "@/components/ui/ErrorBanner";
import Skeleton from "@/components/ui/Skeleton";
import StatusBadge from "@/components/features/StatusBadge";

export default function LiquidityRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [request, setRequest] = useState<LiquidityRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const load = () => {99
    setLoading(true);
    setError("");
    api
      .get(`/liquidity/requests/${id}`)
      .then((r) => setRequest(r.data.data))
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const cancel = async () => {
    if (!confirm("Cancel this liquidity request?")) return;
    setActionError("");
    setActionLoading(true);
    try {
      await api.patch(`/liquidity/requests/${id}/status`, {
        status: "cancelled",
      });
      load();
    } catch (err) {
      setActionError(extractErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-40" />
        <Card className="p-8 space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-24 w-full" />
        </Card>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.push("/liquidity")}
          className="text-sm text-slate-500 hover:text-slate-800 inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <ErrorBanner message={error || "Request not found"} />
      </div>
    );
  }

  const amount =
    request.listing?.askingPrice ??
    request.creditApplication?.requestedAmount ??
    null;

  const canCancel = !["completed", "cancelled"].includes(request.status);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => router.push("/liquidity")}
        className="text-sm text-slate-500 hover:text-slate-800 inline-flex items-center gap-1"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Liquidity
      </button>

      {actionError && <ErrorBanner message={actionError} />}

      <Card className="p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-400">
              {humanize(request.liquidityType)} Request
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              {formatCrores(amount != null ? Number(amount) : null)}
            </h1>
            <div className="text-sm text-slate-500 mt-1">
              Created {formatDate(request.createdAt)}
            </div>
          </div>
          <StatusBadge status={request.status} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8 pt-6 border-t border-slate-100">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-400">
              Property ID
            </div>
            <div className="text-sm text-slate-700 mt-1 font-mono break-all">
              {request.propertyId}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-400">
              Request ID
            </div>
            <div className="text-sm text-slate-700 mt-1 font-mono break-all">
              {request.id}
            </div>
          </div>
        </div>

        {request.listing && (
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="text-xs uppercase tracking-wide text-slate-400 mb-2">
              Listing
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-slate-900 font-semibold">
                  Asking Price:{" "}
                  {formatCrores(Number(request.listing.askingPrice))}
                </div>
                <div className="text-sm text-slate-500 mt-0.5">
                  {humanize(request.listing.status)}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  router.push(`/liquidity/marketplace/${request.listing!.id}`)
                }
              >
                View Listing
              </Button>
            </div>
          </div>
        )}

        {request.creditApplication && (
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="text-xs uppercase tracking-wide text-slate-400 mb-2">
              Credit Application
            </div>
            <div className="text-slate-900 font-semibold">
              Requested:{" "}
              {formatCrores(Number(request.creditApplication.requestedAmount))}
            </div>
            <div className="text-sm text-slate-500 mt-0.5">
              Status: {humanize(request.creditApplication.status)}
              {request.creditApplication.lenderId
                ? " · Lender assigned"
                : " · Awaiting lender routing"}
            </div>
          </div>
        )}

        {canCancel && (
          <div className="flex justify-end mt-8 pt-6 border-t border-slate-100">
            <Button
              variant="danger"
              size="sm"
              icon={<XCircle className="w-4 h-4" />}
              loading={actionLoading}
              onClick={cancel}
            >
              Cancel Request
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
