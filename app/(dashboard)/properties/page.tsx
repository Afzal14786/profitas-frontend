"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Plus, Eye, ArrowLeft, ArrowRight } from "lucide-react";
import { api, extractErrorMessage } from "@/lib/api";
import { Property, Pagination } from "@/types";
import { formatCrores, formatYield, humanize } from "@/lib/format";
import Button from "@/components/ui/Button";
import ErrorBanner from "@/components/ui/ErrorBanner";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import StatusBadge from "@/components/features/StatusBadge";
import PropertyFilters, {
  PropertyFilterState,
} from "@/components/features/PropertyFilters";
import PropertyFormModal from "@/components/features/PropertyFormModal";
import {
  TableWrapper,
  THead,
  Th,
  Tr,
  Td,
} from "@/components/ui/Table";

function PropertiesInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "20");
  const status = searchParams.get("status") || "";
  const propertyType = searchParams.get("propertyType") || "";
  const q = searchParams.get("q") || "";

  const [filters, setFilters] = useState<PropertyFilterState>({
    status,
    propertyType,
    q,
  });
  const [searchInput, setSearchInput] = useState(q);
  const [properties, setProperties] = useState<Property[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // sync local filter state when URL changes
  useEffect(() => {
    setFilters({ status, propertyType, q });
    setSearchInput(q);
  }, [status, propertyType, q]);

  // debounce search input → URL
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput === q) return;
      const params = new URLSearchParams(searchParams.toString());
      if (searchInput) params.set("q", searchInput);
      else params.delete("q");
      params.set("page", "1");
      router.replace(`${pathname}?${params.toString()}`);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  // fetch
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (status) params.set("status", status);
    if (propertyType) params.set("propertyType", propertyType);
    if (q) params.set("q", q);

    api
      .get(`/properties?${params.toString()}`)
      .then((r) => {
        if (cancelled) return;
        setProperties(r.data.data.data);
        setPagination(r.data.data.pagination);
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
  }, [page, limit, status, propertyType, q, reloadKey]);

  // update URL when filters change
  const updateFilters = (next: Partial<PropertyFilterState>) => {
    const merged = { ...filters, ...next };
    setFilters(merged);
    const params = new URLSearchParams(searchParams.toString());
    (["status", "propertyType", "q"] as const).forEach((k) => {
      if (merged[k]) params.set(k, merged[k]);
      else params.delete(k);
    });
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilters({ status: "", propertyType: "", q: "" });
    setSearchInput("");
    router.replace(pathname);
  };

  const gotoPage = (p: number) => {
    if (!pagination || p < 1 || p > pagination.pages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.replace(`${pathname}?${params.toString()}`);
  };

  const range = useMemo(() => {
    if (!pagination) return "";
    const start = (pagination.page - 1) * pagination.limit + 1;
    const end = Math.min(pagination.page * pagination.limit, pagination.total);
    return `Showing ${start}–${end} of ${pagination.total}`;
  }, [pagination]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Properties</h1>
          <p className="text-slate-500 mt-1">
            {pagination
              ? `${pagination.total} ${pagination.total === 1 ? "property" : "properties"} in the ecosystem`
              : "Browse and manage real-estate assets"}
          </p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setAddOpen(true)}>
          Add Property
        </Button>
      </div>

      <PropertyFilters
        value={filters}
        onChange={updateFilters}
        onClear={clearFilters}
      />

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl">
          <EmptyState
            title="No properties found"
            description="Try clearing the filters or add a new property to get started."
            action={
              <Button icon={<Plus className="w-4 h-4" />} onClick={() => setAddOpen(true)}>
                Add Property
              </Button>
            }
          />
        </div>
      ) : (
        <TableWrapper>
          <THead>
            <Tr>
              <Th>Name</Th>
              <Th>Location</Th>
              <Th>Type</Th>
              <Th className="text-right">Value</Th>
              <Th className="text-right">Yield</Th>
              <Th>Status</Th>
              <Th className="text-right"></Th>
            </Tr>
          </THead>
          <tbody>
            {properties.map((p) => (
              <Tr key={p.id} className="hover:bg-slate-50">
                <Td className="font-medium text-slate-900 max-w-[240px] truncate">
                  {p.name}
                </Td>
                <Td className="text-slate-600">{p.location}</Td>
                <Td className="text-slate-600">{humanize(p.propertyType)}</Td>
                <Td className="text-right text-slate-900 font-medium">
                  {formatCrores(p.value)}
                </Td>
                <Td className="text-right text-slate-600">
                  {formatYield(p.rentalYield)}
                </Td>
                <Td>
                  <StatusBadge status={p.status} />
                </Td>
                <Td className="text-right">
                  <Link
                    href={`/properties/${p.id}`}
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

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">{range}</p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => gotoPage(pagination.page - 1)}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Prev
            </Button>
            <span className="text-sm text-slate-500 px-2">
              Page {pagination.page} of {pagination.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.pages}
              onClick={() => gotoPage(pagination.page + 1)}
            >
              Next <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <PropertyFormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={() => setReloadKey((k) => k + 1)}
      />
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div className="text-slate-500">Loading…</div>}>
      <PropertiesInner />
    </Suspense>
  );
}