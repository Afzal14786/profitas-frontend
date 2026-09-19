"use client";

import { useAuth } from "@/context/AuthContext";
import { LogOut, UserCircle2 } from "lucide-react";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="md:hidden">
          <span className="text-xl font-bold text-blue-600">PROFITAS</span>
        </div>

        <div className="hidden md:block text-sm text-slate-500">
          Real Estate Liquidity Ecosystem
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <UserCircle2 className="w-6 h-6 text-slate-400" />
            <div className="hidden sm:block leading-tight">
              <div className="font-medium text-slate-800">{user?.name}</div>
              <div className="text-xs text-slate-500 capitalize">
                {user?.role}
              </div>
            </div>
          </div>

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