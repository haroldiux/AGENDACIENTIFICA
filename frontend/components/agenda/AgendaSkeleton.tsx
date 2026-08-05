export default function AgendaSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {[1, 2, 3].map((group) => (
        <div key={group} className="space-y-4">
          <div className="h-6 bg-slate-700 rounded w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((card) => (
              <div
                key={card}
                className="bg-card text-card-foreground border border-border shadow-sm p-4 rounded-xl space-y-3 border-slate-700/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="h-5 bg-slate-700 rounded w-3/4" />
                  <div className="h-4 bg-slate-700 rounded w-16" />
                </div>
                <div className="flex gap-3">
                  <div className="h-4 bg-slate-700 rounded w-24" />
                  <div className="h-4 bg-slate-700 rounded w-32" />
                </div>
                <div className="h-4 bg-slate-700 rounded w-20 mt-2" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
