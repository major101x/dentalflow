import Skeleton from "@/components/ui/Skeleton";
import { cardClass } from "@/components/ui/Card";

export default function PracticeLoading() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-border bg-surface">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-56 mt-3" />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input card */}
          <div className={`${cardClass} p-6 space-y-4`}>
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-72 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
          {/* Output card */}
          <div className={`${cardClass} p-6 space-y-4`}>
            <Skeleton className="h-3 w-28" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
            <Skeleton className="h-16 w-full" />
          </div>
        </div>

        <div className="mt-12">
          <Skeleton className="h-3 w-28 mb-4" />
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`${cardClass} px-5 py-3.5 flex items-center justify-between`}>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
