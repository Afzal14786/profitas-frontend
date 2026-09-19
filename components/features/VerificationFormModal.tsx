"use client";

import { useEffect, useState } from "react";
import { api, extractErrorMessage } from "@/lib/api";
import { Verification, VerificationType, VerificationStatus } from "@/types";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import ErrorBanner from "@/components/ui/ErrorBanner";
import { Input, Select, Textarea, FormField } from "@/components/ui/Input";

type FormState = {
  propertyId: string;
  documentId: string;
  verificationType: VerificationType | "";
  status: VerificationStatus;
  remarks: string;
};

const emptyForm: FormState = {
  propertyId: "",
  documentId: "",
  verificationType: "",
  status: "pending",
  remarks: "",
};

const types: { value: VerificationType; label: string }[] = [
  { value: "title", label: "Title" },
  { value: "ownership", label: "Ownership" },
  { value: "encumbrance", label: "Encumbrance" },
  { value: "dispute", label: "Dispute" },
];

const statuses: VerificationStatus[] = [
  "pending",
  "in_review",
  "verified",
  "rejected",
];

export default function VerificationFormModal({
  open,
  onClose,
  onSaved,
  verification,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  verification?: Verification | null;
}) {
  const isEdit = Boolean(verification);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError("");
    if (verification) {
      setForm({
        propertyId: verification.propertyId,
        documentId: verification.documentId ?? "",
        verificationType: verification.verificationType,
        status: verification.status,
        remarks: verification.remarks ?? "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, verification]);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setError("");
    if (!form.propertyId) return setError("Property ID is required.");
    if (!form.verificationType)
      return setError("Verification type is required.");

    setSaving(true);
    try {
      if (isEdit) {
        await api.patch(`/verifications/${verification!.id}`, {
          status: form.status,
          remarks: form.remarks.trim() || undefined,
        });
      } else {
        await api.post("/verifications", {
          propertyId: form.propertyId,
          documentId: form.documentId.trim() || undefined,
          verificationType: form.verificationType,
          remarks: form.remarks.trim() || undefined,
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Verification" : "New Verification"}
      size="md"
    >
      <div className="space-y-5">
        {error && <ErrorBanner message={error} />}

        <FormField
          label="Property ID"
          required
          hint="UUID of the property being verified."
        >
          <Input
            value={form.propertyId}
            onChange={(e) => update("propertyId", e.target.value)}
            disabled={isEdit}
            placeholder="00000000-0000-0000-0000-000000000000"
          />
        </FormField>

        {!isEdit && (
          <FormField
            label="Document ID"
            hint="Optional — link a specific document."
          >
            <Input
              value={form.documentId}
              onChange={(e) => update("documentId", e.target.value)}
              placeholder="Leave empty if none"
            />
          </FormField>
        )}

        <FormField label="Verification Type" required>
          <Select
            value={form.verificationType}
            onChange={(e) =>
              update("verificationType", e.target.value as VerificationType)
            }
            disabled={isEdit}
          >
            <option value="">Select a type</option>
            {types.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </FormField>

        {isEdit && (
          <FormField label="Status" required>
            <Select
              value={form.status}
              onChange={(e) =>
                update("status", e.target.value as VerificationStatus)
              }
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </Select>
          </FormField>
        )}

        <FormField label="Remarks">
          <Textarea
            value={form.remarks}
            onChange={(e) => update("remarks", e.target.value)}
            placeholder="Optional notes from the legal review"
          />
        </FormField>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} loading={saving}>
            {isEdit ? "Save Changes" : "Create"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
