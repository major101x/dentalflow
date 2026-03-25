import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireSubscription() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (!subscription) redirect("/pricing");

  return user;
}
