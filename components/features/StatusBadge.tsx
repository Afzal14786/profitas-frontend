const styles: Record<string, string> = {
  // green
  verified: "bg-green-50 text-green-700 border-green-200",
  compliant: "bg-green-50 text-green-700 border-green-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  accepted: "bg-green-50 text-green-700 border-green-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  disbursed: "bg-green-50 text-green-700 border-green-200",
  matched: "bg-green-50 text-green-700 border-green-200",

  // amber
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  pending_verification: "bg-amber-50 text-amber-700 border-amber-200",
  in_review: "bg-amber-50 text-amber-700 border-amber-200",
  processing: "bg-amber-50 text-amber-700 border-amber-200",
  routed: "bg-amber-50 text-amber-700 border-amber-200",

  // blue
  requested: "bg-blue-50 text-blue-700 border-blue-200",
  active: "bg-blue-50 text-blue-700 border-blue-200",

  // red
  rejected: "bg-red-50 text-red-700 border-red-200",
  non_compliant: "bg-red-50 text-red-700 border-red-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  withdrawn: "bg-red-50 text-red-700 border-red-200",

  // slate
  draft: "bg-slate-100 text-slate-600 border-slate-200",
  archived: "bg-slate-100 text-slate-600 border-slate-200",
  closed: "bg-slate-100 text-slate-600 border-slate-200",
};

function labelOf(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function StatusBadge({ status }: { status: string }) {
  const cls = styles[status] || "bg-slate-100 text-slate-700 border-slate-200";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium whitespace-nowrap ${cls}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {labelOf(status)}
    </span>
  );
}