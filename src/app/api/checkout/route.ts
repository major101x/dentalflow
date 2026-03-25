import { NextRequest, NextResponse } from "next/server";
import { Polar } from "@polar-sh/sdk";
import { createClient } from "@/lib/supabase/server";

const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  server: (process.env.POLAR_ENV as "sandbox" | "production") ?? "production",
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const origin = req.nextUrl.origin;

  const checkout = await polar.checkouts.create({
    products: [process.env.POLAR_PRODUCT_ID!],
    customerEmail: user.email!,
    externalCustomerId: user.id,
    successUrl: `${origin}/api/checkout/confirm?checkoutId={CHECKOUT_ID}`,
  });

  return NextResponse.redirect(checkout.url, { status: 303 });
}
