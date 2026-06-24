import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

// Number of extractions a user gets before a subscription is required.
export const FREE_EXTRACTION_LIMIT = 5;

// Page-level gate: requires a signed-in user, but NOT a subscription.
// Free users need to reach the dashboard to spend their free extractions.
export async function requireAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return user;
}

export type Usage = {
  subscribed: boolean;
  used: number;
  remaining: number;
  canExtract: boolean;
};

// Computes a user's entitlement: active subscription grants unlimited use;
// otherwise they get FREE_EXTRACTION_LIMIT extractions, counted by their
// existing `claims` rows (each successful extraction inserts one).
export async function getUsage(
  supabase: SupabaseClient,
  userId: string
): Promise<Usage> {
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  const subscribed = !!subscription;

  const { count } = await supabase
    .from("claims")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  const used = count ?? 0;
  const remaining = Math.max(0, FREE_EXTRACTION_LIMIT - used);

  return {
    subscribed,
    used,
    remaining,
    canExtract: subscribed || used < FREE_EXTRACTION_LIMIT,
  };
}
