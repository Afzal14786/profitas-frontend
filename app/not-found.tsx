import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center max-w-md">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
          <Compass className="w-7 h-7 text-slate-500" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-slate-900">
          Page not found
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}