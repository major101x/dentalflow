import { createClient } from "@/lib/supabase/server";
import { requireSubscription } from "@/lib/requireSubscription";
import AddPracticeForm from "./AddPracticeForm";
import SignOutButton from "./SignOutButton";
import DeletePracticeButton from "./DeletePracticeButton";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await requireSubscription();
  const supabase = await createClient();

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
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">DentalFlow</h1>
            <p className="text-gray-500 mt-1 text-sm">{user.email}</p>
          </div>
          <SignOutButton />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 className="font-semibold text-gray-800 mb-4">Your Practices</h2>
            {!practices || practices.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
                No practices yet. Add your first one →
              </div>
            ) : (
              <div className="space-y-3">
                {practices.map((p) => (
                  <Link
                    key={p.id}
                    href={`/dashboard/${p.id}`}
                    className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{p.name}</p>
                        {p.npi && <p className="text-xs text-gray-400 mt-0.5">NPI: {p.npi}</p>}
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <p className="text-2xl font-bold text-blue-600">{countMap[p.id] ?? 0}</p>
                        <p className="text-xs text-gray-400">claims</p>
                        <DeletePracticeButton practiceId={p.id} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="font-semibold text-gray-800 mb-4">Add Practice</h2>
            <AddPracticeForm userId={user.id} />
          </div>
        </div>
      </div>
    </main>
  );
}
