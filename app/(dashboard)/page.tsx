"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Building2,
  Handshake,
  Scale,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { api, extractErrorMessage } from "@/lib/api";
import StatCard from "@/components/features/StatCard";
import PropertyCard, {
  PropertySummary,
} from "@/components/features/PropertyCard";
import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";

type Summary = {
  users: number;
  assets: number;
  partners: number;
  legal: number;
  verifiedProperties: number;
  pendingVerifications: number;
  activeLiquidityRequests: number;
};

export default function DashboardHome() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    Promise.all([
      api.get<{ data: Summary }>("/dashboard/summary"),
      api.get<{ data: PropertySummary[] }>("/dashboard/properties"),
    ])
      .then(([s, p]) => {
        if (cancelled) return;
        setSummary(s.data.data);
        setProperties(p.data.data);
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
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">
          Real Estate Liquidity Ecosystem — Manage properties, users, partners
          &amp; compliance
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading || !summary ? (
          <>
            {[0, 1, 2, 3].map((i) => (
              <Card key={i} className="p-5">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <div className="flex-1">
                    <Skeleton className="h-6 w-16 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </Card>
            ))}
          </>
        ) : (
          <>
            <StatCard
              icon={Users}
              label="Users"
              value={summary.users}
              color="blue"
            />
            <StatCard
              icon={Building2}
              label="Assets"
              value={summary.assets}
              color="emerald"
            />
            <StatCard
              icon={Handshake}
              label="Partners"
              value={summary.partners}
              color="purple"
            />
            <StatCard
              icon={Scale}
              label="Legal"
              value={summary.legal}
              color="amber"
            />
          </>
        )}
      </div>

      {/* Secondary metrics */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="text-xs uppercase tracking-wide text-slate-400">
              Verified Properties
            </div>
            <div className="text-xl font-semibold mt-1">
              {summary.verifiedProperties}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-xs uppercase tracking-wide text-slate-400">
              Pending Verifications
            </div>
            <div className="text-xl font-semibold mt-1">
              {summary.pendingVerifications}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-xs uppercase tracking-wide text-slate-400">
              Active Liquidity Requests
            </div>
            <div className="text-xl font-semibold mt-1">
              {summary.activeLiquidityRequests}
            </div>
          </Card>
        </div>
      )}

      {/* Properties preview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900">Properties</h2>
          <Link
            href="/properties"
            className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="p-5 space-y-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-40" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-10 w-full rounded-lg" />
              </Card>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <Card>
            <EmptyState
              icon={Building2}
              title="No properties yet"
              description="Properties will appear here once they are added to the ecosystem."
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.slice(0, 6).map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}