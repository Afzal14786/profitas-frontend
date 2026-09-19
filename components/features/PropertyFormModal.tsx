"use client";

import { useEffect, useState } from "react";
import { api, extractErrorMessage } from "@/lib/api";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Input, Select, Textarea, FormField } from "@/components/ui/Input";
import ErrorBanner from "@/components/ui/ErrorBanner";
import { Property, Organization } from "@/types";

type FormState = {
  organizationId: string;
  name: string;
  location: string;
  address: string;
  propertyType: string;
  value: string;
  rentalYield: string;
  ownershipDetails: string;
};

const emptyForm: FormState = {
  organizationId: "",
  name: "",
  location: "",
  address: "",
  propertyType: "commercial",
  value: "",
  rentalYield: "",
  ownershipDetails: "",
};

export default function PropertyFormModal({
  open,
  onClose,
  onSaved,
  property,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  property?: Property | null;
}) {
  const isEdit = Boolean(property);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // reset form when modal opens
  useEffect(() => {
    if (!open) return;
    setError("");
    if (property) {
      setForm({
        organizationId: property.organizationId ?? "",
        name: property.name,
        location: property.location,
        address: property.address ?? "",
        propertyType: property.propertyType,
        value: String(property.value),
        rentalYield:
          property.rentalYield != null ? String(property.rentalYield) : "",
        ownershipDetails: property.ownershipDetails ?? "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, property]);

  // load my orgs (for Add mode only)
  useEffect(() => {
    if (!open || isEdit) return;
    api
      .get<{ data: Organization[] }>("/organizations/me")
      .then((r) =>
        setOrgs(
          r.data.data.filter(
            (o) =>
              o.type === "property_owner" || o.type === "property_developer"
          )
        )
      )
      .catch(() => setOrgs([]));
  }, [open, isEdit]);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setError("");

    // minimal frontend validation
    if (!form.name.trim() || !form.location.trim() || !form.value) {
      setError("Name, location, and value are required.");
      return;
    }
    const valueNum = Number(form.value);
    if (Number.isNaN(valueNum) || valueNum <= 0) {
      setError("Value must be a positive number.");
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        location: form.location.trim(),
        propertyType: form.propertyType,
        value: valueNum,
      };
      if (form.address.trim()) payload.address = form.address.trim();
      if (form.rentalYield) {
        const y = Number(form.rentalYield);
        if (!Number.isNaN(y)) payload.rentalYield = y;
      }
      if (form.ownershipDetails.trim())
        payload.ownershipDetails = form.ownershipDetails.trim();

      if (isEdit) {
        // PATCH — cannot change organizationId
        await api.patch(`/properties/${property!.id}`, payload);
      } else {
        if (form.organizationId) payload.organizationId = form.organizationId;
        await api.post("/properties", payload);
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
      title={isEdit ? "Edit Property" : "Add Property"}
      size="lg"
    >
      <div className="space-y-5">
        {error && <ErrorBanner message={error} />}

        {!isEdit && (
          <FormField label="Owning Organization" hint="Optional — leave empty to create a personal property.">
            <Select
              value={form.organizationId}
              onChange={(e) => update("organizationId", e.target.value)}
            >
              <option value="">Personal property (no organization)</option>
              {orgs.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.type.replace("_", " ")})
                </option>
              ))}
            </Select>
          </FormField>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Property Name" required>
            <Input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. Bangalore Commercial Property"
            />
          </FormField>
          <FormField label="Location" required>
            <Input
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              placeholder="e.g. Bangalore"
            />
          </FormField>
        </div>

        <FormField label="Full Address">
          <Textarea
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder="Street, area, city, pincode"
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Property Type" required>
            <Select
              value={form.propertyType}
              onChange={(e) => update("propertyType", e.target.value)}
            >
              <option value="commercial">Commercial</option>
              <option value="office">Office</option>
              <option value="retail">Retail</option>
              <option value="industrial">Industrial</option>
              <option value="residential">Residential</option>
              <option value="mixed_use">Mixed Use</option>
            </Select>
          </FormField>
          <FormField label="Value (₹)" required hint="e.g. 52000000 for ₹5.2 Cr">
            <Input
              type="number"
              value={form.value}
              onChange={(e) => update("value", e.target.value)}
              placeholder="52000000"
            />
          </FormField>
          <FormField label="Rental Yield (%)" hint="0 – 100">
            <Input
              type="number"
              step="0.01"
              value={form.rentalYield}
              onChange={(e) => update("rentalYield", e.target.value)}
              placeholder="8.40"
            />
          </FormField>
        </div>

        <FormField label="Ownership Details">
          <Textarea
            value={form.ownershipDetails}
            onChange={(e) => update("ownershipDetails", e.target.value)}
            placeholder="e.g. Freehold, sole ownership by XYZ Holdings"
          />
        </FormField>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} loading={saving}>
            {isEdit ? "Save Changes" : "Create Property"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}