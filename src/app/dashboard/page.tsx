import { createClient } from "@/lib/supabase/server";
import { requireAuth, getUsage, FREE_EXTRACTION_LIMIT } from "@/lib/access";
import AddPracticeForm from "./AddPracticeForm";
import SignOutButton from "./SignOutButton";
import DeletePracticeButton from "./DeletePracticeButton";
import { interactiveCardClass } from "@/components/ui/Card";
import { ArrowRight } from "@/components/ui/icons";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await requireAuth();
  const supabase = await createClient();
  const usage = await getUsage(supabase, user.id);

  const { data: practices } = await supabase
    .from("practices")
    .select("id, name, npi, created_at")
    .order("created_at", { ascending: false });

  // Get claim counts per practice
  const { data: claimCounts } = await supabase
    .from("claims")
    .select("practice_id")
    .eq("user_id", user.id);

  const countMap: Record<string, number> = {};
  claimCounts?.forEach(({ practice_id }) => {
    countMap[practice_id] = (countMap[practice_id] ?? 0) + 1;
  });

  return (
    <main className="min-h-screen">
      <header className="border-b border-border bg-surface">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <span className="text-lg font-semibold tracking-tight text-ink">DentalFlow</span>
            <span className="gl-label hidden sm:inline">{user.email}</span>
          </div>
          <SignOutButton />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {!usage.subscribed && (
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border border-l-2 border-l-accent bg-surface px-5 py-4">
            <p className="text-sm text-ink">
              {usage.remaining > 0 ? (
                <>
                  <span className="font-mono font-medium text-accent">{usage.remaining}</span>
                  {" "}of {FREE_EXTRACTION_LIMIT} free extractions remaining.
                </>
              ) : (
                <>You&apos;ve used all {FREE_EXTRACTION_LIMIT} free extractions. Subscribe to keep extracting claims.</>
              )}
            </p>
            <Link
              href="/pricing"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover transition-colors cursor-pointer"
            >
              Subscribe
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-10">
          <div className="lg:col-span-2">
            <h2 className="gl-label mb-4">Your practices</h2>
            {!practices || practices.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-surface p-10 text-center">
                <p className="text-sm text-muted">
                  No practices yet. Add your first one to start extracting claims.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {practices.map((p) => (
                  <Link
                    key={p.id}
                    href={`/dashboard/${p.id}`}
                    className={`group block ${interactiveCardClass} p-5`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-medium text-ink truncate">{p.name}</p>
                        {p.npi && (
                          <p className="gl-label mt-1">NPI {p.npi}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-5 shrink-0">
                        <div className="text-right">
                          <p className="text-2xl font-semibold tabular-nums text-ink leading-none">
                            {countMap[p.id] ?? 0}
                          </p>
                          <p className="gl-label mt-1">claims</p>
                        </div>
                        <DeletePracticeButton practiceId={p.id} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="gl-label mb-4">Add practice</h2>
            <AddPracticeForm userId={user.id} />
          </div>
        </div>
      </div>
    </main>
  );
}
