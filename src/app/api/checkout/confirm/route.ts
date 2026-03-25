import { NextRequest, NextResponse } from "next/server";
import { Polar } from "@polar-sh/sdk";
import { createClient } from "@/lib/supabase/server";

const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  server: (process.env.POLAR_ENV as "sandbox" | "production") ?? "production",
});

export async function GET(req: NextRequest) {
  const checkoutId = req.nextUrl.searchParams.get("checkoutId");
  const origin = req.nextUrl.origin;

  if (!checkoutId) {
    return NextResponse.redirect(new URL("/pricing", origin));
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", origin));

  const checkout = await polar.checkouts.get({ id: checkoutId });
  console.log("[confirm] checkout status:", checkout.status, "customerId:", checkout.customerId);

  if (checkout.status === "confirmed" || checkout.status === "succeeded") {
    const { error } = await supabase.from("subscriptions").upsert({
      user_id: user.id,
      polar_customer_id: checkout.customerId ?? null,
      status: "active",
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
    console.log("[confirm] upsert error:", error);
  }

  return NextResponse.redirect(new URL("/dashboard", origin));
}
