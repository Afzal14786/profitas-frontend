"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Plus,
  ShieldCheck,
  Scale,
  Eye,
  ArrowLeft,
  ArrowRight,
  Search,
  X,
} from "lucide-react";
import { api, extractErrorMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  Verification,
  ComplianceRecord,
  VerificationType,
  VerificationStatus,
  ComplianceType,
  ComplianceStatus,
} from "@/types";
import { formatDate, humanize } from "@/lib/format";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ErrorBanner from "@/components/ui/ErrorBanner";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import StatusBadge from "@/components/features/StatusBadge";
import LegalTabs from "@/components/features/LegalTabs";
import ComplianceStatsCard from "@/components/features/ComplianceStatsCard";
import VerificationFormModal from "@/components/features/VerificationFormModal";
import VerificationDetailModal from "@/components/features/VerificationDetailModal";
import ComplianceFormModal from "@/components/features/ComplianceFormModal";
import ComplianceDetailModal from "@/components/features/ComplianceDetailModal";
import { Input, Select } from "@/components/ui/Input";
import { TableWrapper, THead, Th, Tr, Td } from "@/components/ui/Table";

function LegalInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAdmin } = useAuth();

  const tab = searchParams.get("tab") || "verifications";
  const page = Number(searchParams.get("page") || "1");
  const limit = 20;
  const vType = searchParams.get("vType") || "";
  const vStatus = searchParams.get("vStatus") || "";
  const cType = searchParams.get("cType") || "";
  const cStatus = searchParams.get("cStatus") || "";

  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [compliance, setCompliance] = useState<ComplianceRecord[]>([]);
  const [pagination, setPagination] = useState<{
    page: number;
    pages: number;
    total: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // modals
  const [vFormOpen, setVFormOpen] = useState(false);
  const [vDetailId, setVDetailId] = useState<string | null>(null);
  const [cFormOpen, setCFormOpen] = useState(false);
  const [cDetailId, setCDetailId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));

    const endpoint = tab === "verifications" ? "/verifications" : "/compliance";

    if (tab === "verifications") {
      if (vType) params.set("verificationType", vType);
      if (vStatus) params.set("status", vStatus);
    } else {
      if (cType) params.set("complianceType", cType);
      if (cStatus) params.set("status", cStatus);
    }

    api
      .get(`${endpoint}?${params.toString()}`)
      .then((r) => {
        if (cancelled) return;
        const payload = r.data.data;
        const list = Array.isArray(payload) ? payload : payload.data || [];
        const pag = payload.pagination || null;
        if (tab === "verifications") setVerifications(list);
        else setCompliance(list);
        setPagination(pag);
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
  }, [tab, page, vType, vStatus, cType, cStatus, reloadKey]);

  const updateQuery = (patch: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    if (!("page" in patch)) params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const gotoPage = (p: number) => {
    if (!pagination || p < 1 || p > pagination.pages) return;
    updateQuery({ page: String(p) });
  };

  const clearFilters = () => {
    const keep = new URLSearchParams();
    keep.set("tab", tab);
    router.replace(`${pathname}?${keep.toString()}`);
  };

  const hasFilters =
    tab === "verifications"
      ? Boolean(vType || vStatus)
      : Boolean(cType || cStatus);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Legal & Compliance
          </h1>
          <p className="text-slate-500 mt-1">
            Ownership verification, documentation and compliance status
          </p>
        </div>
        {isAdmin && (
          <Button
            icon={<Plus className="w-4 h-4" />}
            onClick={() =>
              tab === "verifications" ? setVFormOpen(true) : setCFormOpen(true)
            }
          >
            {tab === "verifications" ? "New Verification" : "New Compliance"}
          </Button>
        )}
      </div>

      <LegalTabs />

      {isAdmin && tab === "compliance" && <ComplianceStatsCard />}

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-3">
        {tab === "verifications" ? (
          <>
            <Select
              value={vType}
              onChange={(e) => updateQuery({ vType: e.target.value })}
              className="md:w-56"
            >
              <option value="">All types</option>
              <option value="title">Title</option>
              <option value="ownership">Ownership</option>
              <option value="encumbrance">Encumbrance</option>
              <option value="dispute">Dispute</option>
            </Select>
            <Select
              value={vStatus}
              onChange={(e) => updateQuery({ vStatus: e.target.value })}
              className="md:w-48"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="in_review">In Review</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </Select>
          </>
        ) : (
          <>
            <Select
              value={cType}
              onChange={(e) => updateQuery({ cType: e.target.value })}
              className="md:w-56"
            >
              <option value="">All types</option>
              <option value="regulatory">Regulatory</option>
              <option value="documentation">Documentation</option>
              <option value="disclosure">Disclosure</option>
            </Select>
            <Select
              value={cStatus}
              onChange={(e) => updateQuery({ cStatus: e.target.value })}
              className="md:w-48"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="in_review">In Review</option>
              <option value="compliant">Compliant</option>
              <option value="non_compliant">Non-Compliant</option>
            </Select>
          </>
        )}
        {hasFilters && (
          <Button
            variant="ghost"
            icon={<X className="w-4 h-4" />}
            onClick={clearFilters}
          >
            Clear
          </Button>
        )}
      </div>

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <Card className="p-5 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </Card>
      ) : tab === "verifications" ? (
        verifications.length === 0 ? (
          <Card>
            <EmptyState
              icon={ShieldCheck}
              title="No verifications found"
              description="Try clearing the filters or create a new verification."
            />
          </Card>
        ) : (
          <TableWrapper>
            <THead>
              <Tr>
                <Th>Type</Th>
                <Th>Status</Th>
                <Th>Remarks</Th>
                <Th>Created</Th>
                <Th className="text-right"></Th>
              </Tr>
            </THead>
            <tbody>
              {verifications.map((v) => (
                <Tr
                  key={v.id}
                  className="hover:bg-slate-50 cursor-pointer"
                  onClick={() => setVDetailId(v.id)}
                >
                  <Td className="font-medium text-slate-900">
                    {humanize(v.verificationType)}
                  </Td>
                  <Td>
                    <StatusBadge status={v.status} />
                  </Td>
                  <Td className="text-slate-600 max-w-[280px] truncate">
                    {v.remarks || "—"}
                  </Td>
                  <Td className="text-slate-500 text-xs">
                    {formatDate(v.createdAt)}
                  </Td>
                  <Td className="text-right">
                    <span className="inline-flex items-center gap-1 text-blue-600 text-sm">
                      <Eye className="w-3.5 h-3.5" /> View
                    </span>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </TableWrapper>
        )
      ) : compliance.length === 0 ? (
        <Card>
          <EmptyState
            icon={Scale}
            title="No compliance records found"
            description="Try clearing the filters or create a new record."
          />
        </Card>
      ) : (
        <TableWrapper>
          <THead>
            <Tr>
              <Th>Type</Th>
              <Th>Status</Th>
              <Th>Remarks</Th>
              <Th>Created</Th>
              <Th className="text-right"></Th>
            </Tr>
          </THead>
          <tbody>
            {compliance.map((c) => (
              <Tr
                key={c.id}
                className="hover:bg-slate-50 cursor-pointer"
                onClick={() => setCDetailId(c.id)}
              >
                <Td className="font-medium text-slate-900">
                  {humanize(c.complianceType)}
                </Td>
                <Td>
                  <StatusBadge status={c.status} />
                </Td>
                <Td className="text-slate-600 max-w-[280px] truncate">
                  {c.remarks || "—"}
                </Td>
                <Td className="text-slate-500 text-xs">
                  {formatDate(c.createdAt)}
                </Td>
                <Td className="text-right">
                  <span className="inline-flex items-center gap-1 text-blue-600 text-sm">
                    <Eye className="w-3.5 h-3.5" /> View
                  </span>
                </Td>
              </Tr>
            ))}
          </tbody>
        </TableWrapper>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-end gap-2">
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
      )}

      {/* Modals */}
      <VerificationFormModal
        open={vFormOpen}
        onClose={() => setVFormOpen(false)}
        onSaved={() => setReloadKey((k) => k + 1)}
      />
      <VerificationDetailModal
        open={Boolean(vDetailId)}
        onClose={() => setVDetailId(null)}
        verificationId={vDetailId}
        onChanged={() => setReloadKey((k) => k + 1)}
      />
      <ComplianceFormModal
        open={cFormOpen}
        onClose={() => setCFormOpen(false)}
        onSaved={() => setReloadKey((k) => k + 1)}
      />
      <ComplianceDetailModal
        open={Boolean(cDetailId)}
        onClose={() => setCDetailId(null)}
        recordId={cDetailId}
        onChanged={() => setReloadKey((k) => k + 1)}
      />
    </div>
  );
}

export default function LegalPage() {
  return (
    <Suspense fallback={<div className="text-slate-500">Loading…</div>}>
      <LegalInner />
    </Suspense>
  );
}
