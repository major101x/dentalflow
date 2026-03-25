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
    await supabase.from("subscriptions")
      .update({
        polar_subscription_id: sub.id,
        status: "active",
        current_period_end: sub.currentPeriodEnd,
        updated_at: new Date().toISOString(),
      })
      .eq("polar_customer_id", sub.customerId);
  }

  if (event.type === "subscription.canceled" || event.type === "subscription.revoked") {
    const sub = event.data;
    await supabase.from("subscriptions")
      .update({
        status: event.type === "subscription.canceled" ? "canceled" : "revoked",
        updated_at: new Date().toISOString(),
      })
      .eq("polar_customer_id", sub.customerId);
  }

  return NextResponse.json({ received: true });
}
