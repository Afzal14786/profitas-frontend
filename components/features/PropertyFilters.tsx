"use client";

import { Search, X } from "lucide-react";
import { Input, Select } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export type PropertyFilterState = {
  status: string;
  propertyType: string;
  q: string;
};

export default function PropertyFilters({
  value,
  onChange,
  onClear,
}: {
  value: PropertyFilterState;
  onChange: (next: Partial<PropertyFilterState>) => void;
  onClear: () => void;
}) {
  const hasFilters = value.status || value.propertyType || value.q;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-3">
      <div className="relative flex-1 min-w-0">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <Input
          placeholder="Search by name or location..."
          value={value.q}
          onChange={(e) => onChange({ q: e.target.value })}
          className="pl-9"
        />
      </div>

      <Select
        value={value.status}
        onChange={(e) => onChange({ status: e.target.value })}
        className="md:w-48"
      >
        <option value="">All statuses</option>
        <option value="verified">Verified</option>
        <option value="pending_verification">Pending Verification</option>
        <option value="draft">Draft</option>
        <option value="rejected">Rejected</option>
        <option value="archived">Archived</option>
      </Select>

      <Select
        value={value.propertyType}
        onChange={(e) => onChange({ propertyType: e.target.value })}
        className="md:w-48"
      >
        <option value="">All types</option>
        <option value="commercial">Commercial</option>
        <option value="office">Office</option>
        <option value="retail">Retail</option>
        <option value="industrial">Industrial</option>
        <option value="residential">Residential</option>
        <option value="mixed_use">Mixed Use</option>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="md" onClick={onClear} icon={<X className="w-4 h-4" />}>
          Clear
        </Button>
      )}
    </div>
  );
}