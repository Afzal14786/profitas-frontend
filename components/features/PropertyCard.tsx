import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import Card from "@/components/ui/Card";
import StatusBadge from "./StatusBadge";
import { formatCrores, formatYield, humanize } from "@/lib/format";

export type PropertySummary = {
  id: string;
  name: string;
  location: string;
  value: number | null;
  rentalYield: number | null;
  status: string;
  propertyType: string;
};

export default function PropertyCard({
  property,
}: {
  property: PropertySummary;
}) {
  return (
    <Card className="p-5 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{property.location}</span>
          </div>
          <h3 className="mt-1 font-semibold text-slate-900 truncate">
            {property.name}
          </h3>
          <div className="text-xs text-slate-400 mt-0.5">
            {humanize(property.propertyType)}
          </div>
        </div>
        <StatusBadge status={property.status} />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-5">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-slate-400">
            Value
          </div>
          <div className="text-lg font-semibold text-slate-900">
            {formatCrores(property.value)}
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wide text-slate-400">
            Rental Yield
          </div>
          <div className="text-lg font-semibold text-slate-900">
            {formatYield(property.rentalYield)}
          </div>
        </div>
      </div>

      <Link
        href={`/properties/${property.id}`}
        className="mt-5 inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-medium rounded-lg py-2.5 transition-colors"
      >
        View Property
        <ArrowRight className="w-4 h-4" />
      </Link>
    </Card>
  );
}