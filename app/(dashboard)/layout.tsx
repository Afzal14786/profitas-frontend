"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import Sidebar from "@/components/layout/Sidebar";
import MobileSidebar from "@/components/layout/MobileSidebar";
import Header from "@/components/layout/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-sm">Loading…</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <ToastProvider>
      <div className="min-h-screen flex bg-slate-50">
        <Sidebar />
        <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0">
          <Header onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 px-4 md:px-6 py-6 md:py-8">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
