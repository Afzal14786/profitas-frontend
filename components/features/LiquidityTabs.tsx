"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/liquidity", label: "My Requests" },
  { href: "/liquidity/marketplace", label: "Marketplace" },
  { href: "/liquidity/credit", label: "Credit" },
];

export default function LiquidityTabs() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/liquidity"
      ? pathname === "/liquidity" || /^\/liquidity\/[^/]+$/.test(pathname)
      : pathname.startsWith(href);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-1.5 inline-flex gap-1">
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
            isActive(t.href)
              ? "bg-blue-50 text-blue-700"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}