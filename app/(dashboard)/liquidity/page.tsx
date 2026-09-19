"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Sparkles } from "lucide-react";
import { api, extractErrorMessage } from "@/lib/api";
import { LiquidityRequest } from "@/types";
import { formatCrores, formatDate, humanize } from "@/lib/format";
import Card from "@/components/ui/Card";
import ErrorBanner from "@/components/ui/ErrorBanner";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import StatusBadge from "@/components/features/StatusBadge";
import LiquidityTabs from "@/components/features/LiquidityTabs";
import { TableWrapper, THead, Th, Tr, Td } from "@/components/ui/Table";

export default function MyLiquidityPage() {
  const [requests, setRequests] = useState<LiquidityRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .get("/liquidity/requests?mine=true&limit=50")
      .then((r) => setRequests(r.data.data.data))
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Liquidity</h1>
        <p className="text-slate-500 mt-1">
          Manage your liquidity requests and explore financing options
        </p>
      </div>

      <LiquidityTabs />

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <Card className="p-5 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </Card>
      ) : requests.length === 0 ? (
        <Card>
          <EmptyState
            icon={Sparkles}
            title="No liquidity requests yet"
            description="Open a verified property and click GET LIQUIDITY to get started."
          />
        </Card>
      ) : (
        <TableWrapper>
          <THead>
            <Tr>
              <Th>Type</Th>
              <Th>Status</Th>
              <Th className="text-right">Amount</Th>
              <Th>Created</Th>
              <Th className="text-right"></Th>
            </Tr>
          </THead>
          <tbody>
            {requests.map((r) => {
              const amount =
                r.listing?.askingPrice ??
                r.creditApplication?.requestedAmount ??
                null;
              return (
                <Tr key={r.id} className="hover:bg-slate-50">
                  <Td className="font-medium text-slate-900">
                    {humanize(r.liquidityType)}
                  </Td>
                  <Td>
                    <StatusBadge status={r.status} />
                  </Td>
                  <Td className="text-right text-slate-700">
                    {formatCrores(amount != null ? Number(amount) : null)}
                  </Td>
                  <Td className="text-slate-500">{formatDate(r.createdAt)}</Td>
                  <Td className="text-right">
                    <Link
                      href={`/liquidity/${r.id}`}
                      className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </Link>
                  </Td>
                </Tr>
              );
            })}
          </tbody>
        </TableWrapper>
      )}
    </div>
  );
}
