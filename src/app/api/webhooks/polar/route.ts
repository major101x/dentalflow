import { NextRequest, NextResponse } from "next/server";
import { validateEvent, WebhookVerificationError } from "@polar-sh/sdk/webhooks";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headers = Object.fromEntries(req.headers.entries());

  let event;
  try {
    event = validateEvent(body, headers, process.env.POLAR_WEBHOOK_SECRET!);
  } catch (e) {
    if (e instanceof WebhookVerificationError) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }
    throw e;
  }

  const supabase = await createClient();

  if (event.type === "subscription.active") {
    const sub = event.data;
    const userId = sub.externalCustomerId ?? sub.customerId;

    if (userId) {
      await supabase.from("subscriptions").upsert({
        user_id: userId,
        polar_subscription_id: sub.id,
        polar_customer_id: sub.customerId,
        status: "active",
        current_period_end: sub.currentPeriodEnd,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
    }
  }

  if (event.type === "subscription.canceled" || event.type === "subscription.revoked") {
    const sub = event.data;
    const userId = sub.externalCustomerId ?? sub.customerId;

    if (userId) {
      await supabase.from("subscriptions")
        .update({ status: event.type === "subscription.canceled" ? "canceled" : "revoked", updated_at: new Date().toISOString() })
        .eq("user_id", userId);
    }
  }

  return NextResponse.json({ received: true });
}
