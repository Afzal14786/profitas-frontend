"use client";

import { useEffect, useState } from "react";
import { api, extractErrorMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Verification } from "@/types";
import { formatDate, humanize } from "@/lib/format";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import StatusBadge from "@/components/features/StatusBadge";
import { Pencil } from "lucide-react";
import VerificationFormModal from "./VerificationFormModal";

export default function VerificationDetailModal({
  open,
  onClose,
  verificationId,
  onChanged,
}: {
  open: boolean;
  onClose: () => void;
  verificationId: string | null;
  onChanged: () => void;
}) {
  const { isAdmin } = useAuth();
  const [item, setItem] = useState<Verification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editOpen, setEditOpen] = useState(false);

  const load = () => {
    if (!verificationId) return;
    setLoading(true);
    setError("");
    api
      .get(`/verifications/${verificationId}`)
      .then((r) => setItem(r.data.data))
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (open && verificationId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, verificationId]);

  return (
    <>
      <Modal open={open} onClose={onClose} title="Verification" size="md">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-64" />
          </div>
        ) : error || !item ? (
          <div className="text-red-600 text-sm">{error || "Not found"}</div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-slate-900">
                  {humanize(item.verificationType)}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Created {formatDate(item.createdAt)}
                </div>
              </div>
              <StatusBadge status={item.status} />
            </div>

            <div className="grid grid-cols-1 gap-4 pt-4 border-t border-slate-100 text-sm">
              <Row label="Property ID" value={item.propertyId} mono />
              <Row label="Document ID" value={item.documentId ?? "—"} mono />
              <Row label="Verified By" value={item.verifiedBy ?? "—"} mono />
              <Row label="Last Updated" value={formatDate(item.updatedAt)} />
            </div>

            {item.remarks && (
              <div className="pt-4 border-t border-slate-100">
                <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                  Remarks
                </div>
                <p className="text-sm text-slate-700">{item.remarks}</p>
              </div>
            )}

            {isAdmin && (
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Pencil className="w-4 h-4" />}
                  onClick={() => setEditOpen(true)}
                >
                  Edit
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {item && (
        <VerificationFormModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onSaved={() => {
            load();
            onChanged();
          }}
          verification={item}
        />
      )}
    </>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span
        className={`text-slate-800 text-right break-all ${
          mono ? "font-mono text-xs" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}
