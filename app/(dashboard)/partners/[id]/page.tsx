"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  User as UserIcon,
  Pencil,
  Power,
  PowerOff,
} from "lucide-react";
import { api, extractErrorMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Partner, PartnerType } from "@/types";
import { formatDate, humanize } from "@/lib/format";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ErrorBanner from "@/components/ui/ErrorBanner";
import Skeleton from "@/components/ui/Skeleton";
import StatusBadge from "@/components/features/StatusBadge";
import PartnerFormModal from "@/components/features/PartnerFormModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

const partnerTypeColor: Record<PartnerType, string> = {
  bank: "bg-blue-50 text-blue-700 border-blue-200",
  nbfc: "bg-emerald-50 text-emerald-700 border-emerald-200",
  institution: "bg-purple-50 text-purple-700 border-purple-200",
  property_platform: "bg-amber-50 text-amber-700 border-amber-200",
  legal_advocate: "bg-slate-100 text-slate-700 border-slate-200",
  property_manager: "bg-pink-50 text-pink-700 border-pink-200",
};

export default function PartnerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAdmin } = useAuth();

  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  const load = () => {
    setLoading(true);
    setError("");
    api
      .get(`/partners/${id}`)
      .then((r) => {
        const payload = r.data.data;
        setPartner({
          ...payload,
          organizationName:
            payload.organizationName ?? payload.organization?.name,
          organizationEmail:
            payload.organizationEmail ?? payload.organization?.email,
        });
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const deactivate = async () => {
    setActionError("");
    setActionLoading("deactivate");
    try {
      await api.delete(`/partners/${id}`);
      setConfirmDeactivate(false);
      load();
    } catch (err) {
      setActionError(extractErrorMessage(err));
    } finally {
      setActionLoading("");
    }
  };

  const reactivate = async () => {
    setActionError("");
    setActionLoading("reactivate");
    try {
      await api.patch(`/partners/${id}`, { isActive: true });
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
          <Skeleton className="h-12 w-1/2" />
          <Skeleton className="h-32 w-full" />
        </Card>
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.push("/partners")}
          className="text-sm text-slate-500 hover:text-slate-800 inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Partners
        </button>
        <ErrorBanner message={error || "Partner not found"} />
      </div>
    );
  }

  const typeColor =
    partnerTypeColor[partner.partnerType] ||
    "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => router.push("/partners")}
        className="text-sm text-slate-500 hover:text-slate-800 inline-flex items-center gap-1"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Partners
      </button>

      {actionError && <ErrorBanner message={actionError} />}

      <Card className="p-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
              <Building2 className="w-7 h-7 text-slate-500" />
            </div>
            <div className="min-w-0">
              <h1 className="text-3xl font-bold text-slate-900 truncate">
                {partner.organizationName || "Unnamed Partner"}
              </h1>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span
                  className={`inline-flex px-2.5 py-1 rounded-full border text-[11px] font-semibold uppercase tracking-wide ${typeColor}`}
                >
                  {humanize(partner.partnerType)}
                </span>
                <StatusBadge
                  status={partner.isActive ? "active" : "archived"}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8 pt-6 border-t border-slate-100">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-400 mb-1.5">
              Contact Person
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-800">
              <UserIcon className="w-4 h-4 text-slate-400" />
              {partner.contactPerson || "—"}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-400 mb-1.5">
              Phone
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-800">
              <Phone className="w-4 h-4 text-slate-400" />
              {partner.phone || "—"}
            </div>
          </div>
          <div className="sm:col-span-2">
            <div className="text-xs uppercase tracking-wide text-slate-400 mb-1.5">
              Email
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-800">
              <Mail className="w-4 h-4 text-slate-400" />
              {partner.email || "—"}
            </div>
          </div>
        </div>

        {partner.services && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="text-xs uppercase tracking-wide text-slate-400 mb-1.5">
              Services
            </div>
            <p className="text-sm text-slate-700">{partner.services}</p>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-slate-100 text-xs text-slate-400">
          Added {formatDate(partner.createdAt)}
        </div>

        {isAdmin && (
          <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              icon={<Pencil className="w-4 h-4" />}
              onClick={() => setEditOpen(true)}
            >
              Edit
            </Button>

            {partner.isActive ? (
              <Button
                variant="danger"
                size="sm"
                icon={<PowerOff className="w-4 h-4" />}
                loading={actionLoading === "deactivate"}
                onClick={() => setConfirmDeactivate(true)}
              >
                Deactivate
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                icon={<Power className="w-4 h-4" />}
                loading={actionLoading === "reactivate"}
                onClick={reactivate}
              >
                Reactivate
              </Button>
            )}
          </div>
        )}
      </Card>

      <PartnerFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={load}
        partner={partner}
      />

      <ConfirmDialog
        open={confirmDeactivate}
        onClose={() => setConfirmDeactivate(false)}
        onConfirm={deactivate}
        title="Deactivate Partner"
        description={`Deactivate ${partner.organizationName ?? "this partner"}? They will no longer appear in active partner lists.`}
        confirmText="Deactivate"
        variant="danger"
        loading={actionLoading === "deactivate"}
      />
    </div>
  );
}
