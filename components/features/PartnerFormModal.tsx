"use client";

import { useEffect, useState } from "react";
import { api, extractErrorMessage } from "@/lib/api";
import { Organization, Partner, PartnerType } from "@/types";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import ErrorBanner from "@/components/ui/ErrorBanner";
import { Input, Select, Textarea, FormField } from "@/components/ui/Input";
import { useToast } from "@/context/ToastContext";

type FormState = {
  organizationId: string;
  partnerType: PartnerType | "";
  contactPerson: string;
  email: string;
  phone: string;
  services: string;
};

const emptyForm: FormState = {
  organizationId: "",
  partnerType: "",
  contactPerson: "",
  email: "",
  phone: "",
  services: "",
};

const partnerTypes: { value: PartnerType; label: string }[] = [
  { value: "bank", label: "Bank" },
  { value: "nbfc", label: "NBFC" },
  { value: "institution", label: "Institution" },
  { value: "property_platform", label: "Property Platform" },
  { value: "legal_advocate", label: "Legal Advocate" },
  { value: "property_manager", label: "Property Manager" },
];

export default function PartnerFormModal({
  open,
  onClose,
  onSaved,
  partner,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  partner?: Partner | null;
}) {
  const isEdit = Boolean(partner);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [orgsLoading, setOrgsLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  // reset when open
  useEffect(() => {
    if (!open) return;
    setError("");
    if (partner) {
      setForm({
        organizationId: partner.organizationId,
        partnerType: partner.partnerType,
        contactPerson: partner.contactPerson ?? "",
        email: partner.email ?? "",
        phone: partner.phone ?? "",
        services: partner.services ?? "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, partner]);

  // load partner-type organizations for the dropdown (Create mode)
  useEffect(() => {
    if (!open || isEdit) return;
    setOrgsLoading(true);
    api
      .get<{ data: { data: Organization[] } | Organization[] }>(
        "/organizations?type=partner&limit=100",
      )
      .then((r) => {
        const payload = r.data.data;
        const list = Array.isArray(payload) ? payload : payload.data;
        setOrgs(list || []);
      })
      .catch(() => setOrgs([]))
      .finally(() => setOrgsLoading(false));
  }, [open, isEdit]);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setError("");

    if (!form.partnerType) {
      setError("Partner type is required.");
      return;
    }
    if (!isEdit && !form.organizationId) {
      setError("Please select an organization.");
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        partnerType: form.partnerType,
      };
      if (form.contactPerson.trim())
        payload.contactPerson = form.contactPerson.trim();
      if (form.email.trim()) payload.email = form.email.trim();
      if (form.phone.trim()) payload.phone = form.phone.trim();
      if (form.services.trim()) payload.services = form.services.trim();

      if (isEdit) {
        await api.patch(`/partners/${partner!.id}`, payload);
      } else {
        payload.organizationId = form.organizationId;
        await api.post("/partners", payload);
      }

      toast(isEdit ? "Partner updated" : "Partner created", "success");
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
      title={isEdit ? "Edit Partner" : "Add Partner"}
      size="lg"
    >
      <div className="space-y-5">
        {error && <ErrorBanner message={error} />}

        {!isEdit && (
          <FormField
            label="Organization"
            required
            hint="Only organizations of type 'partner' appear here."
          >
            <Select
              value={form.organizationId}
              onChange={(e) => update("organizationId", e.target.value)}
              disabled={orgsLoading}
            >
              <option value="">
                {orgsLoading
                  ? "Loading organizations…"
                  : "Select an organization"}
              </option>
              {orgs.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.email})
                </option>
              ))}
            </Select>
          </FormField>
        )}

        {isEdit && partner?.organizationName && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm">
            <div className="text-xs uppercase tracking-wide text-slate-400">
              Organization
            </div>
            <div className="font-medium text-slate-900 mt-0.5">
              {partner.organizationName}
            </div>
          </div>
        )}

        <FormField label="Partner Type" required>
          <Select
            value={form.partnerType}
            onChange={(e) =>
              update("partnerType", e.target.value as PartnerType)
            }
          >
            <option value="">Select a type</option>
            {partnerTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Contact Person">
            <Input
              value={form.contactPerson}
              onChange={(e) => update("contactPerson", e.target.value)}
              placeholder="e.g. Rahul Sharma"
            />
          </FormField>
          <FormField label="Phone">
            <Input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+91 98765 43210"
            />
          </FormField>
        </div>

        <FormField label="Email">
          <Input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="contact@partner.com"
          />
        </FormField>

        <FormField label="Services">
          <Textarea
            value={form.services}
            onChange={(e) => update("services", e.target.value)}
            placeholder="e.g. Asset-backed credit, escrow, settlement"
          />
        </FormField>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} loading={saving}>
            {isEdit ? "Save Changes" : "Create Partner"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
