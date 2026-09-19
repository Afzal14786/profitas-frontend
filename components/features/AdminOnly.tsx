"use client";

import { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { ShieldAlert } from "lucide-react";

export default function AdminOnly({ children }: { children: ReactNode }) {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="text-slate-500">Loading…</div>;
  }

  if (!isAdmin) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-7 h-7 text-red-500" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-800">
          Admin access required
        </h3>
        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          This section is available to PROFITAS administrators only.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}