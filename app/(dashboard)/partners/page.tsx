"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Building2,
  Handshake,
  Plus,
  Search,
  X,
  Mail,
  Phone,
  User as UserIcon,
  ArrowRight,
} from "lucide-react";
import { api, extractErrorMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Partner, PartnerType } from "@/types";
import { humanize } from "@/lib/format";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ErrorBanner from "@/components/ui/ErrorBanner";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import StatusBadge from "@/components/features/StatusBadge";
import PartnerFormModal from "@/components/features/PartnerFormModal";
import { Input, Select } from "@/components/ui/Input";

const partnerTypeColor: Record<PartnerType, string> = {
  bank: "bg-blue-50 text-blue-700 border-blue-200",
  nbfc: "bg-emerald-50 text-emerald-700 border-emerald-200",
  institution: "bg-purple-50 text-purple-700 border-purple-200",
  property_platform: "bg-amber-50 text-amber-700 border-amber-200",
  legal_advocate: "bg-slate-100 text-slate-700 border-slate-200",
  property_manager: "bg-pink-50 text-pink-700 border-pink-200",
};

function PartnerCard({ p }: { p: Partner }) {
  const typeColor =
    partnerTypeColor[p.partnerType] ||
    "bg-slate-100 text-slate-700 border-slate-200";
  return (
    <Card className="p-5 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-slate-500" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-900 truncate">
              {p.organizationName || "Unnamed Partner"}
            </h3>
            <span
              className={`inline-flex mt-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wide ${typeColor}`}
            >
              {humanize(p.partnerType)}
            </span>
          </div>
        </div>
        <StatusBadge status={p.isActive ? "active" : "archived"} />
      </div>

      <div className="mt-4 space-y-1.5 text-xs text-slate-500">
        {p.contactPerson && (
          <div className="flex items-center gap-1.5">
            <UserIcon className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{p.contactPerson}</span>
          </div>
        )}
        {p.email && (
          <div className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{p.email}</span>
          </div>
        )}
        {p.phone && (
          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{p.phone}</span>
          </div>
        )}
      </div>

      {p.services && (
        <p className="mt-3 text-xs text-slate-600 line-clamp-2">{p.services}</p>
      )}

      <Link
        href={`/partners/${p.id}`}
        className="mt-5 inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-medium rounded-lg py-2.5 transition-colors"
      >
        View Partner
        <ArrowRight className="w-4 h-4" />
      </Link>
    </Card>
  );
}

function PartnersInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAdmin } = useAuth();

  const partnerType = searchParams.get("partnerType") || "";
  const isActiveParam = searchParams.get("isActive") || "";
  const q = searchParams.get("q") || "";

  const [searchInput, setSearchInput] = useState(q);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput === q) return;
      const params = new URLSearchParams(searchParams.toString());
      if (searchInput) params.set("q", searchInput);
      else params.delete("q");
      router.replace(`${pathname}?${params.toString()}`);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    const params = new URLSearchParams({ limit: "60" });
    if (partnerType) params.set("partnerType", partnerType);
    if (isActiveParam) params.set("isActive", isActiveParam);
    if (q) params.set("q", q);

    api
      .get(`/partners?${params.toString()}`)
      .then((r) => {
        if (cancelled) return;
        const payload = r.data.data;
        setPartners(Array.isArray(payload) ? payload : payload.data || []);
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
  }, [partnerType, isActiveParam, q, reloadKey]);

  const updateFilter = (key: "partnerType" | "isActive", value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchInput("");
    router.replace(pathname);
  };

  const hasFilters = Boolean(q || partnerType || isActiveParam);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Partners</h1>
          <p className="text-slate-500 mt-1">
            Banks, NBFCs, institutions and platforms supporting liquidity
          </p>
        </div>
        {isAdmin && (
          <Button
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setAddOpen(true)}
          >
            Add Partner
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search by name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={partnerType}
          onChange={(e) => updateFilter("partnerType", e.target.value)}
          className="md:w-52"
        >
          <option value="">All types</option>
          <option value="bank">Bank</option>
          <option value="nbfc">NBFC</option>
          <option value="institution">Institution</option>
          <option value="property_platform">Property Platform</option>
          <option value="legal_advocate">Legal Advocate</option>
          <option value="property_manager">Property Manager</option>
        </Select>

        <Select
          value={isActiveParam}
          onChange={(e) => updateFilter("isActive", e.target.value)}
          className="md:w-40"
        >
          <option value="">All statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            icon={<X className="w-4 h-4" />}
          >
            Clear
          </Button>
        )}
      </div>

      {error && <ErrorBanner message={error} />}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-5 space-y-3">
              <Skeleton className="h-11 w-11 rounded-xl" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </Card>
          ))}
        </div>
      ) : partners.length === 0 ? (
        <Card>
          <EmptyState
            icon={Handshake}
            title="No partners found"
            description={
              hasFilters
                ? "Try clearing the filters or adjusting your search."
                : "Partners will appear here once they are added to the ecosystem."
            }
            action={
              hasFilters ? (
                <Button onClick={clearFilters}>Clear Filters</Button>
              ) : isAdmin ? (
                <Button
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => setAddOpen(true)}
                >
                  Add Partner
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.map((p) => (
            <PartnerCard key={p.id} p={p} />
          ))}
        </div>
      )}

      <PartnerFormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={() => setReloadKey((k) => k + 1)}
      />
    </div>
  );
}

export default function PartnersPage() {
  return (
    <Suspense fallback={<div className="text-slate-500">Loading…</div>}>
      <PartnersInner />
    </Suspense>
  );
}
