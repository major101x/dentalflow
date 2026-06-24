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
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-700 text-sm">
            ← Practices
          </Link>
          <span className="text-gray-300">/</span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{practice.name}</h1>
            {practice.npi && <p className="text-xs text-gray-400">NPI: {practice.npi}</p>}
          </div>
        </div>

        <ClaimExtractor
          practiceId={practiceId}
          subscribed={usage.subscribed}
          remaining={usage.remaining}
        />

        <div className="mt-10">
          <h2 className="font-semibold text-gray-800 mb-4">Recent Claims</h2>
          <ClaimHistory initialClaims={claims ?? []} practiceId={practiceId} />
        </div>
      </div>
    </main>
  );
}
