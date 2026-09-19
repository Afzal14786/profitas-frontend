"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const tabs = [
  { key: "verifications", label: "Verifications" },
  { key: "compliance", label: "Compliance" },
];

export default function LegalTabs() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get("tab") || "verifications";

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-1.5 inline-flex gap-1">
      {tabs.map((t) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", t.key);
        return (
          <Link
            key={t.key}
            href={`${pathname}?${params.toString()}`}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
              active === t.key
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}