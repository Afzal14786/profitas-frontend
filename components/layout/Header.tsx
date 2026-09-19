"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { LogOut, UserCircle2, Menu } from "lucide-react";

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
      <div className="px-4 md:px-6 py-4 flex items-center justify-between gap-3">
        {/* Left: hamburger (mobile) + brand (mobile) */}
        <div className="flex items-center gap-3 min-w-0">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="md:hidden w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <span className="md:hidden text-lg font-bold text-blue-600">
            PROFITAS
          </span>
          <span className="hidden md:inline text-sm text-slate-500">
            Real Estate Liquidity Ecosystem
          </span>
        </div>

        {/* Right: user + logout */}
        <div className="flex items-center gap-2">
          <Link
            href="/profile"
            className="flex items-center gap-2 text-sm px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <UserCircle2 className="w-6 h-6 text-slate-400" />
            <div className="hidden sm:block leading-tight text-left">
              <div className="font-medium text-slate-800 truncate max-w-[140px]">
                {user?.name}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                    isAdmin
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  {isAdmin ? "Admin" : "Investor"}
                </span>
              </div>
            </div>
          </Link>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-red-600 px-2 py-1.5 rounded-lg hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
