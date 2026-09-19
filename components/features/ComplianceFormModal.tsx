"use client";

import { useEffect, useState } from "react";
import { api, extractErrorMessage } from "@/lib/api";
import { ComplianceRecord, ComplianceType, ComplianceStatus } from "@/types";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import ErrorBanner from "@/components/ui/ErrorBanner";
import { Input, Select, Textarea, FormField } from "@/components/ui/Input";

type FormState = {
  propertyId: string;
  complianceType: ComplianceType | "";
  status: ComplianceStatus;
  remarks: string;
};

const emptyForm: FormState = {
  propertyId: "",
  complianceType: "",
  status: "pending",
  remarks: "",
};

const types: { value: ComplianceType; label: string }[] = [
  { value: "regulatory", label: "Regulatory" },
  { value: "documentation", label: "Documentation" },
  { value: "disclosure", label: "Disclosure" },
];

const statuses: ComplianceStatus[] = [
  "pending",
  "in_review",
  "compliant",
  "non_compliant",
];

export default function ComplianceFormModal({
  open,
  onClose,
  onSaved,
  record,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  record?: ComplianceRecord | null;
}) {
  const isEdit = Boolean(record);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError("");
    if (record) {
      setForm({
        propertyId: record.propertyId,
        complianceType: record.complianceType,
        status: record.status,
        remarks: record.remarks ?? "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, record]);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setError("");
    if (!form.propertyId) return setError("Property ID is required.");
    if (!form.complianceType) return setError("Compliance type is required.");

    setSaving(true);
    try {
      if (isEdit) {
        await api.patch(`/compliance/${record!.id}`, {
          status: form.status,
          remarks: form.remarks.trim() || undefined,
        });
      } else {
        await api.post("/compliance", {
          propertyId: form.propertyId,
          complianceType: form.complianceType,
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
      title={isEdit ? "Edit Compliance" : "New Compliance Record"}
      size="md"
    >
      <div className="space-y-5">
        {error && <ErrorBanner message={error} />}

        <FormField label="Property ID" required hint="UUID of the property.">
          <Input
            value={form.propertyId}
            onChange={(e) => update("propertyId", e.target.value)}
            disabled={isEdit}
            placeholder="00000000-0000-0000-0000-000000000000"
          />
        </FormField>

        <FormField label="Compliance Type" required>
          <Select
            value={form.complianceType}
            onChange={(e) =>
              update("complianceType", e.target.value as ComplianceType)
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
                update("status", e.target.value as ComplianceStatus)
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
            placeholder="Optional notes from the compliance review"
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
