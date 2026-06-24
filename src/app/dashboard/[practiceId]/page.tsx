import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAuth, getUsage } from "@/lib/access";
import Link from "next/link";
import ClaimExtractor from "@/components/ClaimExtractor";
import ClaimHistory from "./ClaimHistory";

export default async function PracticePage({
  params,
}: {
  params: Promise<{ practiceId: string }>;
}) {
  const { practiceId } = await params;
  const user = await requireAuth();
  const supabase = await createClient();
  const usage = await getUsage(supabase, user.id);

  const { data: practice } = await supabase
    .from("practices")
    .select("id, name, npi")
    .eq("id", practiceId)
    .eq("user_id", user.id)
    .single();

  if (!practice) notFound();

  const { data: claims } = await supabase
    .from("claims")
    .select("id, claim_data, created_at")
    .eq("practice_id", practiceId)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <main className="min-h-screen">
      <header className="border-b border-border bg-surface">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
          <Link
            href="/dashboard"
            className="gl-label inline-flex items-center gap-1.5 hover:text-ink transition-colors cursor-pointer"
          >
            ← Practices
          </Link>
          <div className="mt-2 flex items-baseline gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-ink">{practice.name}</h1>
            {practice.npi && <span className="gl-label">NPI {practice.npi}</span>}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <ClaimExtractor
          practiceId={practiceId}
          subscribed={usage.subscribed}
          remaining={usage.remaining}
        />

        <div className="mt-12">
          <h2 className="gl-label mb-4">Recent claims</h2>
          <ClaimHistory initialClaims={claims ?? []} practiceId={practiceId} />
        </div>
      </div>
    </main>
  );
}
