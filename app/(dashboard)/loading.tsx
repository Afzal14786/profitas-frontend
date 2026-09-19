export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-48 bg-slate-200 rounded-lg animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 bg-white border border-slate-200 rounded-2xl animate-pulse"
          />
        ))}
      </div>
      <div className="h-64 bg-white border border-slate-200 rounded-2xl animate-pulse" />
    </div>
  );
}
