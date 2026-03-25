import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function PricingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">DentalFlow</h1>
          <p className="text-gray-500 mt-2">Start extracting CDT codes in seconds.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="flex items-end gap-1 mb-1">
            <span className="text-4xl font-bold text-gray-900">$199</span>
            <span className="text-gray-400 mb-1">/month</span>
          </div>
          <p className="text-sm text-gray-500 mb-6">Per billing company — unlimited practices.</p>

          <ul className="space-y-3 mb-8">
            {[
              "Unlimited CDT code extractions",
              "Manage unlimited dental practices",
              "Full claim history per practice",
              "Copy-ready claim summaries",
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm text-gray-700">
                <span className="text-blue-500 font-bold">✓</span>
                {feature}
              </li>
            ))}
          </ul>

          <form action="/api/checkout" method="POST">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Subscribe — $199/month
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-4">
            Secure payment via Polar. Cancel anytime.
          </p>
        </div>

        <p className="text-center text-sm text-gray-400 mt-4">
          Signed in as {user.email}
        </p>
      </div>
    </main>
  );
}
