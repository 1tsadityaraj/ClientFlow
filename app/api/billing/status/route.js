import { isStripeEnabled } from "@/lib/stripe.js";

export async function GET() {
  return Response.json({ enabled: isStripeEnabled() });
}
