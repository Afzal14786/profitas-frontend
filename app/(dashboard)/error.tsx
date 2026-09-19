"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center max-w-md">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7 text-red-600" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-slate-900">
          Something went wrong
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {error.message || "An unexpected error occurred."}
        </p>
        <button
          onClick={reset}
          className="mt-6 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg"
        >
          <RotateCw className="w-4 h-4" />
          Try again
        </button>
      </div>
    </div>
  );
}
