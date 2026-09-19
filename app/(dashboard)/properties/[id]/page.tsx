"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Pencil,
  Archive,
  ShieldCheck,
  ShieldX,
  Send,
} from "lucide-react";
import { api, extractErrorMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Property } from "@/types";
import { formatCrores, formatYield, humanize, formatDate } from "@/lib/format";
import Button from "@/components/ui/Button";
import ErrorBanner from "@/components/ui/ErrorBanner";
import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import StatusBadge from "@/components/features/StatusBadge";
import PropertyFormModal from "@/components/features/PropertyFormModal";
import LiquidityModal from "@/components/features/LiquidityModal";
import DocumentsTab from "@/components/features/DocumentsTab";
import VerificationsTab from "@/components/features/VerificationsTab";
import ComplianceTab from "@/components/features/ComplianceTab";

type TabKey = "documents" | "verifications" | "compliance";

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [liquidityOpen, setLiquidityOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("documents");

  const load = () => {
    setLoading(true);
    setError("");
    api
      .get<{ data: Property }>(`/properties/${id}`)
      .then((r) => setProperty(r.data.data))
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const archive = async () => {
    if (!confirm("Archive this property?")) return;
    setActionError("");
    setActionLoading("archive");
    try {
      await api.delete(`/properties/${id}`);
      load();
    } catch (err) {
      setActionError(extractErrorMessage(err));
    } finally {
      setActionLoading("");
    }
  };

  const submitForVerification = async () => {
    setActionError("");
    setActionLoading("submit");
    try {
      await api.patch(`/properties/${id}`, { status: "pending_verification" });
      load();
    } catch (err) {
      setActionError(extractErrorMessage(err));
    } finally {
      setActionLoading("");
    }
  };

  const adminSetStatus = async (status: "verified" | "rejected") => {
    setActionError("");
    setActionLoading(status);
    try {
      await api.patch(`/properties/${id}/status`, { status });
      load();
    } catch (err) {
      setActionError(extractErrorMessage(err));
    } finally {
      setActionLoading("");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-40" />
        <Card className="p-8 space-y-6">
          <Skeleton className="h-10 w-2/3" />
          <div className="grid grid-cols-3 gap-6">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
          <Skeleton className="h-14 w-full rounded-xl" />
        </Card>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.push("/properties")}
          className="text-sm text-slate-500 hover:text-slate-800 inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Properties
        </button>
        <ErrorBanner message={error || "Property not found"} />
      </div>
    );
  }

  const isAdmin = user?.role === "admin";
  const canLiquidity = property.status === "verified";

  const tabs: { key: TabKey; label: string }[] = [
    { key: "documents", label: "Documents" },
    { key: "verifications", label: "Verifications" },
    { key: "compliance", label: "Compliance" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button
        onClick={() => router.push("/properties")}
        className="text-sm text-slate-500 hover:text-slate-800 inline-flex items-center gap-1"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Properties
      </button>

      {actionError && <ErrorBanner message={actionError} />}

      <Card className="p-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <MapPin className="w-4 h-4" />
              {property.location}
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mt-2">
              {property.name}
            </h1>
            <div className="text-sm text-slate-500 mt-1">
              {humanize(property.propertyType)}
              {property.address && ` · ${property.address}`}
            </div>
          </div>
          <StatusBadge status={property.status} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mt-8">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-400">
              Value
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {formatCrores(property.value)}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-400">
              Rental Yield
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {formatYield(property.rentalYield)}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-400">
              Added
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {formatDate(property.createdAt)}
            </div>
          </div>
        </div>

        {property.ownershipDetails && (
          <div className="mt-8">
            <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">
              Ownership
            </div>
            <p className="text-sm text-slate-700">
              {property.ownershipDetails}
            </p>
          </div>
        )}

        <button
          disabled={!canLiquidity}
          onClick={() => setLiquidityOpen(true)}
          className="mt-8 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold text-lg transition-colors"
        >
          GET LIQUIDITY
        </button>
        {!canLiquidity && (
          <p className="text-xs text-slate-500 text-center mt-2">
            {property.status === "draft"
              ? "Submit this property for verification to unlock liquidity."
              : property.status === "pending_verification"
                ? "Verification in progress. Liquidity unlocks once verified."
                : property.status === "rejected"
                  ? "Property was rejected. Fix the issues and resubmit."
                  : "This property is archived."}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-slate-100">
          <Button
            variant="outline"
            size="sm"
            icon={<Pencil className="w-4 h-4" />}
            onClick={() => setEditOpen(true)}
          >
            Edit
          </Button>

          {property.status === "draft" && (
            <Button
              variant="outline"
              size="sm"
              icon={<Send className="w-4 h-4" />}
              loading={actionLoading === "submit"}
              onClick={submitForVerification}
            >
              Submit for Verification
            </Button>
          )}

          {isAdmin && property.status === "pending_verification" && (
            <>
              <Button
                variant="primary"
                size="sm"
                icon={<ShieldCheck className="w-4 h-4" />}
                loading={actionLoading === "verified"}
                onClick={() => adminSetStatus("verified")}
              >
                Mark as Verified
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={<ShieldX className="w-4 h-4" />}
                loading={actionLoading === "rejected"}
                onClick={() => adminSetStatus("rejected")}
              >
                Reject
              </Button>
            </>
          )}

          {property.status !== "archived" && (
            <Button
              variant="ghost"
              size="sm"
              icon={<Archive className="w-4 h-4" />}
              loading={actionLoading === "archive"}
              onClick={archive}
              className="ml-auto text-slate-500 hover:text-red-600"
            >
              Archive
            </Button>
          )}
        </div>
      </Card>

      {/* Tabs */}
      <div>
        <div className="bg-white border border-slate-200 rounded-2xl p-1.5 inline-flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
                activeTab === t.key
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {activeTab === "documents" && (
            <DocumentsTab propertyId={property.id} canUpload={true} />
          )}
          {activeTab === "verifications" && (
            <VerificationsTab propertyId={property.id} />
          )}
          {activeTab === "compliance" && (
            <ComplianceTab propertyId={property.id} />
          )}
        </div>
      </div>

      <PropertyFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={load}
        property={property}
      />

      <LiquidityModal
        open={liquidityOpen}
        onClose={() => setLiquidityOpen(false)}
        property={property}
      />
    </div>
  );
}
