import Skeleton from "@/components/ui/Skeleton";
import { cardClass } from "@/components/ui/Card";

export default function DashboardLoading() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-border bg-surface">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-9 w-24" />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-10">
          <div className="lg:col-span-2">
            <Skeleton className="h-3 w-24 mb-4" />
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`${cardClass} p-5 flex items-center justify-between`}>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-8 w-10" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <Skeleton className="h-3 w-24 mb-4" />
            <div className={`${cardClass} p-5 space-y-4`}>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-11 w-full" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
