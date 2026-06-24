import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Button from "@/components/ui/Button";
import { Check } from "@/components/ui/icons";

const FEATURES = [
  "Unlimited CDT code extractions",
  "Manage unlimited dental practices",
  "Full claim history per practice",
  "Copy-ready claim summaries",
];

export default async function PricingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full">
        <div className="mb-8">
          <span className="gl-label">Pricing</span>
          <h1 className="text-3xl font-semibold tracking-tight text-ink mt-2">
            One plan. Everything included.
          </h1>
          <p className="text-muted text-[0.95rem] mt-2 leading-relaxed">
            Start extracting CDT codes in seconds.
          </p>
        </div>

        <div className="bg-surface rounded-lg border border-border p-8">
          <div className="flex items-baseline gap-1.5">
            <span className="text-5xl font-semibold tracking-tight text-ink">$199</span>
            <span className="text-muted">/month</span>
          </div>
          <p className="text-sm text-muted mt-2">
            Per billing company. Unlimited practices.
          </p>

          <ul className="space-y-3 my-8">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm text-ink">
                <Check className="h-4 w-4 shrink-0 text-accent" />
                {feature}
              </li>
            ))}
          </ul>

          <form action="/api/checkout" method="POST">
            <Button type="submit" size="lg" className="w-full">
              Subscribe — $199/month
            </Button>
          </form>

          <p className="text-center text-xs text-muted mt-4">
            Secure payment via Polar. Cancel anytime.
          </p>
        </div>

        <p className="text-center text-sm text-muted mt-6">
          Signed in as <span className="font-mono text-ink">{user.email}</span>
        </p>
      </div>
    </main>
  );
}
