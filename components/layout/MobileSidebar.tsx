"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Sparkles,
  Users,
  Handshake,
  Scale,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const items = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
  {
    href: "/properties",
    label: "Properties",
    icon: Building2,
    adminOnly: false,
  },
  { href: "/liquidity", label: "Liquidity", icon: Sparkles, adminOnly: false },
  { href: "/users", label: "Users", icon: Users, adminOnly: true },
  { href: "/partners", label: "Partners", icon: Handshake, adminOnly: false },
  { href: "/legal", label: "Legal", icon: Scale, adminOnly: false },
];

export default function MobileSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  // Close on route change
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Lock body scroll while open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const visible = items.filter((i) => !i.adminOnly || isAdmin);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-white z-50 md:hidden transform transition-transform shadow-xl ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-200">
          <Link href="/" className="block" onClick={onClose}>
            <div className="text-2xl font-bold text-blue-600">PROFITAS</div>
            <div className="text-xs text-slate-500 mt-0.5">
              Liquidity Ecosystem
            </div>
          </Link>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="px-3 py-4 space-y-1">
          {visible.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 px-5 py-4 border-t border-slate-200 text-xs text-slate-400">
          v1.0 · MVP
        </div>
      </aside>
    </>
  );
}
