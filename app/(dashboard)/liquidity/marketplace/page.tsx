"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, ShoppingBag } from "lucide-react";
import { api, extractErrorMessage } from "@/lib/api";
import { Listing } from "@/types";
import { formatCrores, formatDate } from "@/lib/format";
import Card from "@/components/ui/Card";
import ErrorBanner from "@/components/ui/ErrorBanner";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import StatusBadge from "@/components/features/StatusBadge";
import LiquidityTabs from "@/components/features/LiquidityTabs";
import { Select } from "@/components/ui/Input";
import { TableWrapper, THead, Th, Tr, Td } from "@/components/ui/Table";

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ limit: "50" });
    if (status) params.set("status", status);
    api
      .get(`/liquidity/listings?${params.toString()}`)
      .then((r) => setListings(r.data.data.data))
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Liquidity</h1>
        <p className="text-slate-500 mt-1">
          Browse listings from investors seeking liquidity
        </p>
      </div>

      <LiquidityTabs />

      <div className="flex items-center justify-between gap-3">
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="max-w-xs"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="matched">Matched</option>
          <option value="closed">Closed</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      </div>

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <Card className="p-5 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </Card>
      ) : listings.length === 0 ? (
        <Card>
          <EmptyState
            icon={ShoppingBag}
            title="No listings found"
            description="Listings appear when investors request liquidity via Sell / Match."
          />
        </Card>
      ) : (
        <TableWrapper>
          <THead>
            <Tr>
              <Th className="text-right">Asking Price</Th>
              <Th>Status</Th>
              <Th>Listed</Th>
              <Th className="text-right"></Th>
            </Tr>
          </THead>
          <tbody>
            {listings.map((l) => (
              <Tr key={l.id} className="hover:bg-slate-50">
                <Td className="text-right font-medium text-slate-900">
                  {formatCrores(Number(l.askingPrice))}
                </Td>
                <Td>
                  <StatusBadge status={l.status} />
                </Td>
                <Td className="text-slate-500">{formatDate(l.createdAt)}</Td>
                <Td className="text-right">
                  <Link
                    href={`/liquidity/marketplace/${l.id}`}
                    className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm"
                  >
                    <Eye className="w-3.5 h-3.5" /> View
                  </Link>
                </Td>
              </Tr>
            ))}
          </tbody>
        </TableWrapper>
      )}
    </div>
  );
}
