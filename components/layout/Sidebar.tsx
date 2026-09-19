"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Sparkles,
  Users,
  Handshake,
  Scale,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const items = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
  { href: "/properties", label: "Properties", icon: Building2, adminOnly: false },
  { href: "/liquidity", label: "Liquidity", icon: Sparkles, adminOnly: false },
  { href: "/users", label: "Users", icon: Users, adminOnly: true },
  { href: "/partners", label: "Partners", icon: Handshake, adminOnly: false },
  { href: "/legal", label: "Legal", icon: Scale, adminOnly: false },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const visibleItems = items.filter((item) => !item.adminOnly || isAdmin);

  return (
    <aside className="hidden md:flex md:flex-col w-60 shrink-0 bg-white border-r border-slate-200 min-h-screen">
      <div className="px-5 py-6 border-b border-slate-200">
        <Link href="/" className="block">
          <div className="text-2xl font-bold text-blue-600">PROFITAS</div>
          <div className="text-xs text-slate-500 mt-1">Liquidity Ecosystem</div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {visibleItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-slate-200 text-xs text-slate-400">
        v1.0 · MVP
      </div>
    </aside>
  );
}